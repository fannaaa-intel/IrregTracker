import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { spacing, typography, useThemeColors } from '@/theme';

import type { CycleSummary } from '../summary';

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[typography.heading, styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

/** Median / range / period length, from the counted cycles (PLAN.md §7). */
export function StatsRow({ summary }: { summary: CycleSummary }) {
  const colors = useThemeColors();
  const cycles = summary.count === 1 ? 'cycle' : 'cycles';

  return (
    <Card>
      <View style={styles.row}>
        <Stat label="Typical cycle" value={`${summary.typical} days`} />
        <Stat label="Range" value={`${summary.shortest}–${summary.longest} days`} />
        <Stat label="Typical period" value={`${summary.typicalPeriod} days`} />
      </View>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        From your last {summary.count} {cycles}. Cycle length varies by {summary.variation}{' '}
        {summary.variation === 1 ? 'day' : 'days'}.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  stat: {
    flexGrow: 1,
    flexBasis: 90,
    gap: spacing.xs,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
