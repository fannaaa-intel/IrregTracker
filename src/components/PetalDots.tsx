import { StyleSheet, View } from 'react-native';

import { radius, spacing, useThemeColors } from '@/theme';

const DOT = spacing.xs + 1; // 5

/** DESIGN.md §4.3: a tiny cluster of four petal dots, used as a quiet divider. Decorative. */
export function PetalDots() {
  const colors = useThemeColors();
  return (
    <View
      style={styles.row}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {[1, 0.7, 0.45, 0.25].map((opacity) => (
        <View key={opacity} style={[styles.dot, { backgroundColor: colors.petal, opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
});
