import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

import { confidenceDots, confidenceLabel } from '../copy';
import type { Confidence } from '../logic';

const DOT = spacing.sm; // 8

/** DESIGN.md §5: Low / Medium / High with 1–3 filled dots, never color alone. */
export function ConfidenceChip({ confidence }: { confidence: Confidence }) {
  const colors = useThemeColors();
  const filled = confidenceDots[confidence];

  return (
    <View
      accessible
      accessibilityLabel={confidenceLabel[confidence]}
      style={[styles.chip, { backgroundColor: colors.surfaceTint }]}
    >
      <View style={styles.dots}>
        {[1, 2, 3].map((n) => (
          <View
            key={n}
            style={[
              styles.dot,
              { borderColor: colors.primaryDeep },
              n <= filled ? { backgroundColor: colors.primaryDeep } : null,
            ]}
          />
        ))}
      </View>
      <Text style={[typography.label, { color: colors.primaryDeep }]}>
        {confidenceLabel[confidence]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + spacing.xs / 2,
    borderRadius: radius.pill,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: 1.5,
  },
});
