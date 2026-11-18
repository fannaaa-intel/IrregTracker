import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { cycleLine, periodLine, reportTitle, sexLine, symptomBarLabel, symptomLine } from '../copy';
import type { MonthReport } from '../logic';

const BAR = spacing.sm; // 8
const TOP_SYMPTOMS = 5;

/** "November 2026 at a glance": what she logged that month, in plain words and soft bars. */
export function MonthReportCard({ report }: { report: MonthReport }) {
  const colors = useThemeColors();
  const cycle = cycleLine(report);
  const top = report.symptoms.slice(0, TOP_SYMPTOMS);
  const most = Math.max(1, ...top.map((s) => s.days));

  const block = (label: string, text: string | null) =>
    text === null ? null : (
      <View style={styles.block}>
        <Text style={[typography.label, { color: colors.text }]}>{label}</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>{text}</Text>
      </View>
    );

  return (
    <Card>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
        {reportTitle(report)}
      </Text>

      {report.empty ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Nothing logged this month. Tap a day to add your period, how you feel, or sex.
        </Text>
      ) : (
        <View style={styles.blocks}>
          {block('Period', periodLine(report))}
          {block('Cycle', cycle)}
          <View style={styles.block}>
            <Text style={[typography.label, { color: colors.text }]}>How you felt</Text>
            <Text style={[typography.body, { color: colors.textMuted }]}>
              {symptomLine(report)}
            </Text>
            {top.map(({ symptom, days }) => (
              <View
                key={symptom}
                style={styles.barRow}
                accessible
                accessibilityLabel={symptomBarLabel(symptom, days)}
              >
                <Text style={[typography.caption, styles.barText, { color: colors.text }]}>
                  {symptomBarLabel(symptom, days)}
                </Text>
                <View style={[styles.track, { backgroundColor: colors.surfaceTint }]}>
                  <View
                    style={[
                      styles.fill,
                      { backgroundColor: colors.petal, width: `${(days / most) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
          {block('Sex', sexLine(report))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  blocks: {
    gap: spacing.lg,
  },
  block: {
    gap: spacing.xs,
  },
  barRow: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  barText: {
    flexShrink: 1,
  },
  track: {
    height: BAR,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: BAR,
    borderRadius: radius.pill,
  },
});
