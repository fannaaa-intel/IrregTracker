import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { useAppLockSetting } from '../../lock/hooks';
import { deleteAllData } from '../delete-all';
import { AppLockCard, YourDataCard } from './PrivacyCards';

const LOCK_MESSAGES = {
  'no-screen-lock':
    "Set up a screen lock (PIN, pattern or fingerprint) in your phone's settings first.",
} as const;

export function AppLockSection() {
  const { enabled, setEnabled } = useAppLockSetting();
  const [message, setMessage] = useState<string | null>(null);
  if (enabled === undefined) return null;

  const toggle = async (on: boolean) => {
    setMessage(null);
    const result = await setEnabled(on).catch(() => 'cancelled' as const);
    if (result === 'no-screen-lock') setMessage(LOCK_MESSAGES[result]);
  };

  return <AppLockCard enabled={enabled} message={message} onToggle={(on) => void toggle(on)} />;
}

export function YourDataSection() {
  const router = useRouter();

  const confirmDelete = () =>
    Alert.alert(
      'Delete all data?',
      "This removes every logged day, tag and setting from this phone, and the key that protects them. It can't be undone. A backup you saved stays where you saved it.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: () => {
            deleteAllData().catch(() => {
              Alert.alert(
                'Nothing was deleted',
                'Something went wrong. Please close the app, open it again and try once more.',
              );
            });
          },
        },
      ],
    );

  return (
    <YourDataCard
      onSaveBackup={() => router.push('/backup/export')}
      onRestore={() => router.push('/backup/restore')}
      onDeleteAll={confirmDelete}
    />
  );
}
