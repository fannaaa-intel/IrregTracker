import { X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { radius, shadow, spacing, typography, useThemeColors } from '@/theme';

import { dismissUpdateBanner, restartIntoUpdate, useUpdateState } from '../app-update';

/**
 * A calm "new version ready" note at the bottom of the screen once an update has downloaded.
 * "Later" hides it; the update still applies the next time the app is opened.
 */
export function UpdateBanner() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { status, bannerDismissed } = useUpdateState();
  if (status !== 'ready' || bannerDismissed) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.banner,
        shadow.soft,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          bottom: insets.bottom + spacing.xxxl + spacing.xl,
        },
      ]}
    >
      <View style={styles.text}>
        <Text style={[typography.label, { color: colors.text }]}>New version ready</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Your data stays as it is.
        </Text>
      </View>
      <Button label="Restart" variant="quiet" onPress={restartIntoUpdate} />
      <IconButton icon={X} accessibilityLabel="Later" onPress={dismissUpdateBanner} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.lg,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
