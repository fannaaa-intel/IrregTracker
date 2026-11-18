/**
 * Local notifications for kind notes. Everything is scheduled on the phone: no push server,
 * no push token, no network (CLAUDE.md §1.1). Never log note content or settings.
 */
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { atLocalTime, localClock } from '../../lib/date';
import { isKindNoteId, planKindNotes, type KindNoteSettings } from './logic';
import { KIND_NOTE_TITLE } from './phrases';

const CHANNEL_ID = 'kind-notes';
let configured = false;

/** Once per app start: show notes even while the app is open, and set up the Android channel. */
export async function configureNotifications(): Promise<void> {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Kind notes',
      description: 'One gentle message a day',
      importance: AndroidImportance.DEFAULT,
    });
  }
}

export async function notificationsAllowed(): Promise<boolean> {
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

/** Asks once; on Android 13+ this shows the system prompt. */
export async function requestNotifications(): Promise<boolean> {
  if (await notificationsAllowed()) return true;
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}

/** Removes every scheduled kind note (also used by "Delete all data" in M6). */
export async function cancelKindNotes(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((request) => isKindNoteId(request.identifier))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );
}

/** Replaces the scheduled kind notes with a fresh plan from now (off = just clears them). */
export async function syncKindNotes(settings: KindNoteSettings): Promise<void> {
  await configureNotifications();
  await cancelKindNotes();
  if (!settings.enabled || !(await notificationsAllowed())) return;
  const plan = planKindNotes(settings, localClock());
  for (const note of plan) {
    await Notifications.scheduleNotificationAsync({
      identifier: note.id,
      content: { title: KIND_NOTE_TITLE, body: note.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: atLocalTime(note.date, note.hour),
        channelId: CHANNEL_ID,
      },
    });
  }
}
