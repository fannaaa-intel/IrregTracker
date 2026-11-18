// Delete all data (PLAN.md §8): scheduled notes, the database file and its key, then a fresh start.
import * as Updates from 'expo-updates';
import { DevSettings } from 'react-native';

import { wipeDatabase } from '../../db/client';
import { applyAppearance } from '../appearance/store';
import { protectAppSwitcher } from '../lock/device';
import { cancelKindNotes } from '../reminders/scheduler';

export async function deleteAllData(): Promise<void> {
  await cancelKindNotes().catch(() => undefined);
  await protectAppSwitcher(false).catch(() => undefined);
  await wipeDatabase();
  applyAppearance('system');
  // Restart so the app opens a new, empty encrypted database and shows the welcome cards.
  try {
    await Updates.reloadAsync();
  } catch {
    DevSettings.reload();
  }
}
