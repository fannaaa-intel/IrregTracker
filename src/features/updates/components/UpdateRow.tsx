import Constants from 'expo-constants';
import { Download, RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { spacing, touchTarget, typography, useThemeColors } from '@/theme';

import { checkForAppUpdate, updatesAvailable, useUpdateState } from '../app-update';
import { updateStatusText } from '../logic';

/** Settings → "Check for updates". Works any time; automatic checks only run 8 PM – 12 AM. */
export function UpdateRow() {
  const colors = useThemeColors();
  const { status } = useUpdateState();
  const version = Constants.expoConfig?.version ?? '';
  const busy = status === 'checking' || status === 'downloading';
  const ready = status === 'ready';
  const title = ready ? 'Restart to update' : 'Check for updates';
  const subtitle = updateStatusText(status, version, updatesAvailable());
  const Icon = ready ? RefreshCw : Download;

  return (
    <Pressable
      onPress={() => void checkForAppUpdate()}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${subtitle}`}
      accessibilityState={{ disabled: busy, busy }}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Icon size={22} strokeWidth={1.5} color={ready ? colors.primary : colors.textMuted} />
      <View style={styles.text}>
        <Text style={[typography.body, { color: colors.text }]}>{title}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      {busy ? <ActivityIndicator color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
