import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Sparkle } from '@/components/Ornaments';
import { motion, spacing, typography, useReduceMotion, useThemeColors } from '@/theme';

import type { RingModel } from '../summary';

// DESIGN.md §4.1: thin track (border, 10px), petal arc for progress, blush arc for the window.
// The progress arc sweeps in when Home opens (250 ms), and a small dot marks today on the ring.
const SIZE = 232;
const STROKE = spacing.sm + spacing.xs / 2; // 10
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;
const KNOB = STROKE + spacing.xs; // 14

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

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

/** 0 → 1 once when the ring first shows; straight to 1 with Reduce motion. */
function useSweep(): Animated.Value {
  const reduceMotion = useReduceMotion();
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      value.setValue(1);
      return;
    }
    const anim = Animated.timing(value, {
      toValue: 1,
      duration: motion.sheet,
      delay: 120,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, value]);
  return value;
}

export function CycleRing({ model }: Props) {
  const colors = useThemeColors();
  const sweep = useSweep();
  const usual = model.usual === null ? null : `of usually ${model.usual.min}–${model.usual.max}`;
  const spoken =
    model.usual === null
      ? `Day ${model.day} of your cycle`
      : `Day ${model.day} of your cycle. Cycles usually last ${model.usual.min} to ${model.usual.max} days.`;
  const progress = model.progress;
  const angle = progress === null ? 0 : progress * 2 * Math.PI - Math.PI / 2;

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
        {progress !== null ? (
          <>
            <AnimatedCircle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={colors.petal}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={[progress * CIRCUMFERENCE, CIRCUMFERENCE]}
              strokeDashoffset={sweep.interpolate({
                inputRange: [0, 1],
                outputRange: [progress * CIRCUMFERENCE, 0],
              })}
              rotation={-90}
              origin={`${CENTER}, ${CENTER}`}
            />
            {/* Today's position: a small ring-coloured dot at the end of the arc. */}
            <AnimatedCircle
              cx={CENTER + RADIUS * Math.cos(angle)}
              cy={CENTER + RADIUS * Math.sin(angle)}
              r={KNOB / 2}
              fill={colors.surface}
              stroke={colors.primary}
              strokeWidth={3}
              opacity={sweep.interpolate({ inputRange: [0, 0.8, 1], outputRange: [0, 0, 1] })}
            />
          </>
        ) : null}
      </Svg>
      {/* Three tiny sparkles around the ring: a soft, girly touch (DESIGN.md §4.8). */}
      <Sparkle size={18} color={colors.petal} style={styles.sparkleA} />
      <Sparkle size={11} color={colors.blush} style={styles.sparkleB} />
      <Sparkle size={13} color={colors.petal} opacity={0.6} style={styles.sparkleC} />
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
  sparkleA: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  sparkleB: {
    position: 'absolute',
    top: spacing.xxl,
    right: -spacing.sm,
  },
  sparkleC: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
  },
});
