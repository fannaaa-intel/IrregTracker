import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { spacing, typography, useThemeColors } from '@/theme';

import type { RingModel } from '../summary';

// DESIGN.md §4.1: thin track (border, 10px), petal arc for progress, blush arc for the window.
const SIZE = 232;
const STROKE = spacing.sm + spacing.xs / 2; // 10
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

type Props = {
  model: RingModel;
};

function Arc({ from, to, color }: { from: number; to: number; color: string }) {
  const length = Math.max(to - from, 0) * CIRCUMFERENCE;
  return (
    <Circle
      cx={CENTER}
      cy={CENTER}
      r={RADIUS}
      fill="none"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeDasharray={[length, CIRCUMFERENCE]}
      strokeDashoffset={-from * CIRCUMFERENCE}
      rotation={-90}
      origin={`${CENTER}, ${CENTER}`}
    />
  );
}

export function CycleRing({ model }: Props) {
  const colors = useThemeColors();
  const usual = model.usual === null ? null : `of usually ${model.usual.min}–${model.usual.max}`;
  const spoken =
    model.usual === null
      ? `Day ${model.day} of your cycle`
      : `Day ${model.day} of your cycle. Cycles usually last ${model.usual.min} to ${model.usual.max} days.`;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={spoken} style={styles.ring}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={colors.border}
          strokeWidth={STROKE}
        />
        {model.window !== null ? (
          <Arc from={model.window.from} to={model.window.to} color={colors.blush} />
        ) : null}
        {model.progress !== null ? <Arc from={0} to={model.progress} color={colors.petal} /> : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          maxFontSizeMultiplier={1.3}
          style={[typography.display, styles.number, { color: colors.text }]}
        >
          Day {model.day}
        </Text>
        <Text maxFontSizeMultiplier={1.3} style={[typography.body, { color: colors.textMuted }]}>
          {usual ?? 'of this cycle'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
  },
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  number: {
    fontVariant: ['tabular-nums'],
  },
});
