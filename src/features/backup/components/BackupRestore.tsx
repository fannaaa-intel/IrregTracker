import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { format } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import { BackupError, type BackupErrorKind } from '../crypto';
import { summarizeBackup, type BackupData } from '../format';
import { PassphraseField } from './PassphraseField';

type Props = {
  /** Lets her pick a file; resolves to its text, or null if she cancelled. */
  onPickFile: () => Promise<string | null>;
  /** Decrypts and validates. Throws BackupError. */
  onOpen: (fileText: string, passphrase: string) => Promise<BackupData>;
  onRestore: (data: BackupData) => Promise<void>;
  onDone: () => void;
};

const ERROR_TEXT: Record<BackupErrorKind | 'other', string> = {
  'not-a-backup': "This file isn't a Cycle Tracker backup.",
  'wrong-passphrase': "That passphrase doesn't open this backup. Check it and try again.",
  'newer-version': 'This backup is from a newer version of the app. Update the app first.',
  other: 'Something went wrong. Nothing was changed. Please try again.',
};

const errorKind = (e: unknown) => (e instanceof BackupError ? e.kind : 'other');

/** Settings → Restore a backup: pick → passphrase → preview → replace. Nothing changes until confirmed. */
export function BackupRestore({ onPickFile, onOpen, onRestore, onDone }: Props) {
  const colors = useThemeColors();
  const [fileText, setFileText] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [data, setData] = useState<BackupData | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const attempt = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(ERROR_TEXT[errorKind(e)]);
    } finally {
      setBusy(false);
    }
  };

  const note = (text: string | null) =>
    text === null ? null : <Text style={[typography.body, { color: colors.notice }]}>{text}</Text>;

  if (done) {
    return (
      <Card>
        <Text style={[typography.heading, { color: colors.calm }]}>Restored</Text>
        <Text style={[typography.body, { color: colors.text }]}>Your data is back.</Text>
        <Button label="Done" onPress={onDone} />
      </Card>
    );
  }

  if (data !== null) {
    const s = summarizeBackup(data);
    const range =
      s.firstDate !== null && s.lastDate !== null
        ? ` from ${format(s.firstDate, { withYear: true })} to ${format(s.lastDate, { withYear: true })}`
        : '';
    return (
      <View style={styles.container}>
        <Card>
          <Text style={[typography.heading, { color: colors.text }]}>In this backup</Text>
          <Text style={[typography.body, { color: colors.text }]}>
            {`${s.days} period ${s.days === 1 ? 'day' : 'days'}${range}, and ${s.tags} tagged ${s.tags === 1 ? 'cycle' : 'cycles'}.`}
          </Text>
        </Card>
        {note('Restoring replaces everything that is in the app now.')}
        {note(error)}
        <Button
          label={busy ? 'Restoring…' : 'Replace my data'}
          disabled={busy}
          onPress={() =>
            void attempt(async () => {
              await onRestore(data);
              setDone(true);
            })
          }
        />
        <Button variant="quiet" label="Cancel" onPress={onDone} disabled={busy} />
      </View>
    );
  }

  if (fileText === null) {
    return (
      <View style={styles.container}>
        <Text style={[typography.body, { color: colors.text }]}>
          Choose a backup file you saved before. You&apos;ll see what&apos;s in it before anything
          changes.
        </Text>
        {note(error)}
        <Button
          label="Choose backup file"
          disabled={busy}
          onPress={() => void attempt(async () => setFileText(await onPickFile()))}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PassphraseField
        label="Backup passphrase"
        value={passphrase}
        onChangeText={setPassphrase}
        editable={!busy}
      />
      {note(error)}
      <Button
        label={busy ? 'Opening… this takes a few seconds' : 'Open backup'}
        disabled={busy || passphrase.length === 0}
        onPress={() =>
          void attempt(async () => {
            setData(await onOpen(fileText, passphrase));
            setPassphrase('');
          })
        }
      />
      <Button variant="quiet" label="Choose a different file" onPress={() => setFileText(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
});
