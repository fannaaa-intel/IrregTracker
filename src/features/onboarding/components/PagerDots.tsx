import { Animated, StyleSheet, View } from 'react-native';

import { radius, spacing, useThemeColors } from '@/theme';

const DOT = spacing.sm; // 8
const GAP = spacing.md; // 12
const PILL = DOT + GAP; // 20

type Props = {
  count: number;
  /** Horizontal scroll position of the pager, in points. */
  scrollX: Animated.Value;
  width: number;
  /** "Step 2 of 4" for screen readers. */
  label: string;
};

/** Soft dots with a petal pill that slides along under the finger to the current card. */
export function PagerDots({ count, scrollX, width, label }: Props) {
  const colors = useThemeColors();
  const span = Math.max(1, (count - 1) * width);

  return (
    <View accessible accessibilityLabel={label} style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, { backgroundColor: colors.blush }]} />
      ))}
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: colors.petal },
          {
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, span],
                  outputRange: [-(PILL - DOT) / 2, (count - 1) * (DOT + GAP) - (PILL - DOT) / 2],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: GAP,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
  pill: {
    position: 'absolute',
    left: 0,
    top: spacing.sm,
    width: PILL,
    height: DOT,
    borderRadius: radius.pill,
  },
});
