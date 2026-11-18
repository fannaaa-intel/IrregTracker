/**
 * Local notifications for cycle reminders. Scheduled on the phone: no push server, no push token,
 * no network (CLAUDE.md §1.1). Never log reminder content, dates or settings (CLAUDE.md §1.3).
 */
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { settingRepo } from '../../db/repositories/setting-repo';
import type { Db } from '../../db/types';
import { atLocalTime, localClock } from '../../lib/date';
import { loadCycleOverview } from '../cycles/load';
import { isCycleReminderId, normalizeCycleReminders, planCycleReminders } from './cycle-logic';
import { configureNotifications, notificationsAllowed } from './scheduler';

const CHANNEL_ID = 'cycle-reminders';
let channelReady = false;

async function ensureChannel(): Promise<void> {
  await configureNotifications();
  if (channelReady || Platform.OS !== 'android') return;
  channelReady = true;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Reminders',
    description: 'Check-ins about your calendar',
    importance: AndroidImportance.DEFAULT,
  });
}

/** Removes every scheduled cycle reminder (also used by "Delete all data"). */
export async function cancelCycleReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => isCycleReminderId(request.identifier))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

/** Replaces the scheduled cycle reminders with a fresh plan from the latest data. */
export async function syncCycleReminders(db: Db): Promise<void> {
  await ensureChannel();
  await cancelCycleReminders();
  const settings = normalizeCycleReminders(await settingRepo.getCycleReminders(db));
  if (!settings.enabled || !(await notificationsAllowed())) return;

  const now = localClock();
  const overview = await loadCycleOverview(db, now.date);
  const fertileOn = await settingRepo.isFertileDaysOn(db);
  const plan = planCycleReminders(
    { prediction: overview.prediction, fertile: fertileOn ? overview.fertile : null },
    settings,
    now,
  );
  for (const reminder of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: { title: reminder.title, body: reminder.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: atLocalTime(reminder.date, reminder.hour, reminder.minute),
        channelId: CHANNEL_ID,
      },
    });
  }
}
