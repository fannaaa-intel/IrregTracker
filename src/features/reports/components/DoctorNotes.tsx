import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { flagMessage, flagTitle } from '@/features/flags/copy';
import { patternText } from '@/features/insights/logic';
import { symptomLabel } from '@/features/symptoms/logic';
import { format } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import { SUMMARY_RECENT_DAYS, type DoctorSummary } from '../doctor';

/** Summary for a doctor, part 2: what the app noticed, symptoms and her notes. */
export function DoctorNotes({ summary }: { summary: DoctorSummary }) {
  const colors = useThemeColors();
  const heading = [typography.heading, { color: colors.text }];
  const label = [typography.label, { color: colors.text }];
  const body = [typography.body, { color: colors.textMuted }];

  return (
    <>
      {summary.flags.length > 0 ? (
        <Card>
          <Text accessibilityRole="header" style={heading}>
            Things the app noticed
          </Text>
          {summary.flags.map((flag) => (
            <View key={flag.id} style={styles.item}>
              <Text style={label}>{flagTitle[flag.type]}</Text>
              <Text style={body}>{flagMessage(flag)}</Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <Text accessibilityRole="header" style={heading}>
          Symptoms
        </Text>
        {summary.recentSymptoms.length === 0 ? (
          <Text style={body}>No symptoms logged in the last {SUMMARY_RECENT_DAYS} days.</Text>
        ) : (
          <Text style={body}>
            Last {SUMMARY_RECENT_DAYS} days:{' '}
            {summary.recentSymptoms
              .map(({ symptom, days }) => `${symptomLabel[symptom].toLowerCase()} (${days})`)
              .join(', ')}
            .
          </Text>
        )}
        {summary.patterns.map((pattern) => (
          <Text key={pattern.symptom} style={[typography.body, { color: colors.text }]}>
            {patternText(pattern)} (seen around {pattern.periods} periods)
          </Text>
        ))}
      </Card>

      {summary.notes.length > 0 ? (
        <Card>
          <Text accessibilityRole="header" style={heading}>
            Your notes (last {SUMMARY_RECENT_DAYS} days)
          </Text>
          {summary.notes.map((note) => (
            <View key={note.date} style={styles.item}>
              <Text style={label}>{format(note.date, { withYear: true })}</Text>
              <Text style={body}>{note.body}</Text>
            </View>
          ))}
        </Card>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.xs,
  },
});
