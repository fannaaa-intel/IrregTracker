import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { tagLabel, type TagReason } from '@/features/cycles/tags';
import { format } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import type { DoctorSummary } from '../doctor';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** Summary for a doctor, part 1: the numbers and the recent cycles. */
export function DoctorCycles({ summary }: { summary: DoctorSummary }) {
  const colors = useThemeColors();
  const stats = summary.overview.summary;
  const label = [typography.label, { color: colors.text }];
  const value = [typography.body, { color: colors.textMuted }];

  const fact = (name: string, text: string) => (
    <View key={name} style={styles.fact}>
      <Text style={label}>{name}</Text>
      <Text style={value}>{text}</Text>
    </View>
  );

  return (
    <>
      <Card>
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          Cycles
        </Text>
        {stats === null ? (
          <Text style={value}>Not enough complete cycles logged yet.</Text>
        ) : (
          <View style={styles.facts}>
            {fact('Typical cycle', `${plural(stats.typical, 'day')} (median of ${stats.count})`)}
            {fact('Range', `${stats.shortest} to ${plural(stats.longest, 'day')}`)}
            {fact('Variation', plural(stats.variation, 'day'))}
            {fact('Typical period', plural(stats.typicalPeriod, 'day'))}
          </View>
        )}
        {summary.current !== null
          ? fact(
              'Current cycle',
              `Day ${summary.current.day}, started ${format(summary.current.start, { withYear: true })}`,
            )
          : null}
      </Card>

      {summary.cycles.length > 0 ? (
        <Card>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            Recent cycles
          </Text>
          {summary.cycles.map((cycle) => (
            <View key={cycle.start} style={[styles.cycle, { borderColor: colors.border }]}>
              <Text style={label}>Started {format(cycle.start, { withYear: true })}</Text>
              <Text style={value}>
                {plural(cycle.length, 'day')} cycle · {plural(cycle.periodLength, 'day')} period
                {cycle.tag !== null ? ` · ${tagLabel[cycle.tag as TagReason] ?? cycle.tag}` : ''}
                {cycle.notCounted ? ' · left out of predictions' : ''}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  facts: {
    gap: spacing.md,
  },
  fact: {
    gap: 2,
  },
  cycle: {
    gap: 2,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
