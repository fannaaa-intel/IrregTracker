import { StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { spacing, typography, useThemeColors } from '@/theme';

type LockProps = {
  enabled: boolean;
  /** A calm explanation after a change that couldn't be made, or null. */
  message: string | null;
  onToggle: (on: boolean) => void;
};

/** Settings → App lock. Off by default. */
export function AppLockCard({ enabled, message, onToggle }: LockProps) {
  const colors = useThemeColors();
  return (
    <Card>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            App lock
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            Open the app with your fingerprint, face or phone PIN
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          accessibilityLabel="App lock"
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>
      {enabled ? (
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          The app also stays hidden in your recent apps, and screenshots are blocked.
        </Text>
      ) : null}
      {message !== null ? (
        <Text style={[typography.body, { color: colors.notice }]}>{message}</Text>
      ) : null}
    </Card>
  );
}

type DataProps = {
  onSaveBackup: () => void;
  onRestore: () => void;
  onDeleteAll: () => void;
};

/** Settings → Your data: backup, restore, delete all. */
export function YourDataCard({ onSaveBackup, onRestore, onDeleteAll }: DataProps) {
  const colors = useThemeColors();
  return (
    <Card>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
        Your data
      </Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Everything stays on this phone, encrypted. A backup lets you move it to a new phone.
      </Text>
      <Button label="Save a backup" onPress={onSaveBackup} />
      <Button variant="quiet" label="Restore a backup" onPress={onRestore} />
      <Button variant="quiet" label="Delete all data" onPress={onDeleteAll} />
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
});
