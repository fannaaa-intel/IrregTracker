import { Animated, Image, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import splashImage from '@/assets/images/splash-icon.png';
import { Sparkle } from '@/components/Ornaments';
import { spacing, useThemeColors } from '@/theme';

import { SPLASH_IMAGE_SIZE } from '../timeline';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
export const RING_SIZE = SPLASH_IMAGE_SIZE + spacing.xxxl;
const RING_STROKE = 3;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_R;
const PROGRESS = 0.68; // like "day 18 of 26": the same picture as the Home ring
const WINDOW_FROM = 0.74;
const WINDOW_TO = 0.88;

/** Fades in while rising `distance` points into place. */
export const rise = (v: Animated.Value, distance: number = spacing.sm) => ({
  opacity: v,
  transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
});

type Props = {
  /** Draws the track and the petal progress arc. */
  ring: Animated.Value;
  /** Draws the blush window arc and brings in the two sparkles. */
  window: Animated.Value;
  /** The exit's slight lift (scale). */
  lift: Animated.AnimatedInterpolation<number>;
};

/** The logo exactly where the native splash left it, with the Home cycle ring drawing around it. */
export function OpeningRing({ ring, window, lift }: Props) {
  const colors = useThemeColors();
  const arc = (from: number, to: number, stroke: string, progress: Animated.Value) => (
    <AnimatedCircle
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RING_R}
      stroke={stroke}
      strokeWidth={RING_STROKE}
      strokeLinecap="round"
      fill="none"
      strokeDasharray={`${(to - from) * RING_LENGTH} ${RING_LENGTH}`}
      strokeDashoffset={progress.interpolate({
        inputRange: [0, 1],
        outputRange: [-from * RING_LENGTH + (to - from) * RING_LENGTH, -from * RING_LENGTH],
      })}
      opacity={progress.interpolate({ inputRange: [0, 0.01, 1], outputRange: [0, 1, 1] })}
      rotation={-90}
      origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
    />
  );

  return (
    <Animated.View style={[styles.center, { transform: [{ scale: lift }] }]}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ring}>
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_R}
          stroke={colors.border}
          strokeWidth={RING_STROKE}
          fill="none"
          opacity={ring}
        />
        {arc(WINDOW_FROM, WINDOW_TO, colors.blush, window)}
        {arc(0, PROGRESS, colors.petal, ring)}
      </Svg>
      <Image source={splashImage} style={styles.logo} />
      <Animated.View style={[styles.sparkleA, rise(window, spacing.xs)]}>
        <Sparkle size={18} color={colors.petal} />
      </Animated.View>
      <Animated.View style={[styles.sparkleB, rise(window, spacing.xs)]}>
        <Sparkle size={11} color={colors.blush} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
  },
  logo: {
    width: SPLASH_IMAGE_SIZE,
    height: SPLASH_IMAGE_SIZE,
  },
  // Just outside the ring (which reaches 24 pt beyond the logo).
  sparkleA: {
    position: 'absolute',
    top: -spacing.xxl,
    right: -spacing.xxl,
  },
  sparkleB: {
    position: 'absolute',
    bottom: -spacing.xl,
    left: -spacing.xxl,
  },
});
