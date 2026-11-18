import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Flower } from '@/components/Ornaments';
import { radius, spacing, typography, useThemeColors } from '@/theme';

const FLOWER = spacing.xxl + spacing.sm; // 40

/**
 * Home: today's gentle line (the same phrase as the kind note), a new one every day. A soft
 * blush wash and a small flower make it feel like a little note card.
 */
export function NoteCard({ phrase }: { phrase: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { borderColor: colors.border }]}>
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="note" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.surfaceTint} />
            <Stop offset="1" stopColor={colors.surface} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#note)" />
      </Svg>
      <Flower
        size={FLOWER}
        color={colors.blush}
        centerColor={colors.petal}
        opacity={0.9}
        style={styles.flower}
      />
      <View style={styles.text}>
        <Text style={[typography.caption, { color: colors.primaryDeep }]}>Today&apos;s note</Text>
        <Text style={[typography.body, { color: colors.text }]}>{phrase}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    paddingRight: spacing.xxxl + spacing.lg,
  },
  flower: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  text: {
    gap: spacing.xs,
  },
});
