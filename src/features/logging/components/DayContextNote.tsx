import { Info } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

/** Top of the day editor: what the calendar's estimate marks mean for this day. */
export function DayContextNote({ lines }: { lines: readonly string[] }) {
  const colors = useThemeColors();
  if (lines.length === 0) return null;
  return (
    <View style={[styles.note, { backgroundColor: colors.surfaceTint }]}>
      <Info size={spacing.lg} strokeWidth={1.75} color={colors.primaryDeep} />
      <View style={styles.text}>
        {lines.map((line) => (
          <Text key={line} style={[typography.body, { color: colors.primaryDeep }]}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
});
