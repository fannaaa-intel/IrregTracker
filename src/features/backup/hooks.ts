import { getRandomBytes } from 'expo-crypto';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useDb } from '../../db/DatabaseProvider';
import { notifyDbChange } from '../../db/live-query';
import { migrations } from '../../db/migrations';
import { backupRepo } from '../../db/repositories/backup-repo';
import { settingRepo } from '../../db/repositories/setting-repo';
import { todayLocal } from '../../lib/date';
import { normalizeKindNotes } from '../reminders/logic';
import { syncKindNotes } from '../reminders/scheduler';
import { BackupError, decryptBackup, encryptBackup } from './crypto';
import { DEVICE_ONLY_SETTINGS, validateBackupData, type BackupData } from './format';

const FILE_PREFIX = 'cycle-backup-';

/** Old backup files left in the private cache from earlier exports. */
function clearOldBackupFiles(): void {
  for (const entry of Paths.cache.list()) {
    if (entry instanceof File && entry.name.startsWith(FILE_PREFIX)) entry.delete();
  }
}

/** Export and restore of the encrypted backup (PLAN.md §8). Never logs data or passphrases. */
export function useBackup() {
  const db = useDb();

  return {
    /** Encrypts everything and opens the share sheet (Drive, Files, …). */
    exportBackup: async (passphrase: string): Promise<void> => {
      const snapshot = await backupRepo.readAll(db, DEVICE_ONLY_SETTINGS);
      const text = await encryptBackup(JSON.stringify(snapshot), passphrase, getRandomBytes);
      clearOldBackupFiles();
      const file = new File(Paths.cache, `${FILE_PREFIX}${todayLocal()}.json`);
      file.create();
      await file.write(text);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: 'Save your backup',
      });
    },

    /** The chosen file's text, or null if she cancelled. */
    pickBackupFile: async (): Promise<string | null> => {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return null;
      const file = new File(result.assets[0].uri);
      const text = await file.text();
      if (file.exists) file.delete();
      return text;
    },

    /** Decrypts and validates; nothing changes yet. */
    openBackup: async (fileText: string, passphrase: string): Promise<BackupData> => {
      const plain = await decryptBackup(fileText, passphrase);
      let parsed: unknown;
      try {
        parsed = JSON.parse(plain);
      } catch {
        throw new BackupError('not-a-backup');
      }
      const data = validateBackupData(parsed);
      if (data === null) throw new BackupError('not-a-backup');
      if (data.schemaVersion > migrations.length) throw new BackupError('newer-version');
      return data;
    },

    /** Replaces all data in one transaction, then reschedules kind notes from the restored settings. */
    restoreBackup: async (data: BackupData): Promise<void> => {
      await backupRepo.replaceAll(db, data, DEVICE_ONLY_SETTINGS);
      notifyDbChange();
      await syncKindNotes(normalizeKindNotes(await settingRepo.getKindNotes(db))).catch(() => {
        console.warn('Kind notes could not be rescheduled after restore.');
      });
    },
  };
}
