import { Sparkles } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { spacing, typography, useThemeColors } from '@/theme';

import { PATTERN_MIN_PERIODS, patternText, type SymptomPattern } from '../logic';

/** History: when symptoms tend to show up around her period, from her own logs. */
export function PatternsCard({ patterns }: { patterns: readonly SymptomPattern[] }) {
  const colors = useThemeColors();
  return (
    <Card>
      <View style={styles.head}>
        <Sparkles size={spacing.lg} strokeWidth={1.75} color={colors.primary} />
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          Your patterns
        </Text>
      </View>
      {patterns.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Log how you feel around your periods. Once a symptom shows up around {PATTERN_MIN_PERIODS}{' '}
          periods, you&apos;ll see when it usually starts.
        </Text>
      ) : (
        <View style={styles.list}>
          {patterns.map((p) => (
            <Text key={p.symptom} style={[typography.body, { color: colors.text }]}>
              {patternText(p)}
            </Text>
          ))}
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            From what you logged. Patterns can change, and they aren&apos;t a diagnosis.
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  list: {
    gap: spacing.sm,
  },
});
