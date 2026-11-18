import { Droplet, Lock } from 'lucide-react-native';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Sparkle } from '@/components/Ornaments';
import { radius, spacing, useThemeColors } from '@/theme';

import { float, pop, turn, useAmbient, useEntrance } from './illustration-motion';

// Small living pictures for the welcome cards (DESIGN.md §4 motifs: cycle ring, petal dots,
// droplet). Each plays a short entrance when its card comes into view, then keeps a very slow,
// calm movement while it's on screen. Decorative only.

export type IllustrationProps = { active: boolean; reduceMotion: boolean };

export const ILLUSTRATION_SIZE = 168;
const SIZE = ILLUSTRATION_SIZE;
const KNOB = spacing.md + 2; // 14
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Card 1: the Home cycle ring. A "today" dot travels around it; the droplet floats. */
export function CycleIllustration({ active, reduceMotion }: IllustrationProps) {
  const colors = useThemeColors();
  const [arc, windowArc] = useEntrance(active, reduceMotion, 2, false);
  const [drop, knob] = useEntrance(active, reduceMotion, 2);
  const orbit = useAmbient(active, reduceMotion, { duration: 12000, mode: 'spin' });
  const bob = useAmbient(active, reduceMotion, { duration: 2800, mode: 'breathe' });
  const glow = useAmbient(active, reduceMotion, { duration: 3200, mode: 'breathe', native: false });
  const r = SIZE / 2 - 10;
  const length = 2 * Math.PI * r;
  const ring = (
    stroke: string,
    offset: Animated.AnimatedInterpolation<number> | number,
    dash: string,
    opacity?: Animated.AnimatedInterpolation<number> | Animated.Value,
  ) => (
    <AnimatedCircle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={r}
      fill="none"
      stroke={stroke}
      strokeWidth={10}
      strokeLinecap="round"
      strokeDasharray={dash}
      strokeDashoffset={offset}
      opacity={opacity}
      rotation={-90}
      origin={`${SIZE / 2}, ${SIZE / 2}`}
    />
  );
  const windowOpacity = Animated.multiply(
    windowArc,
    glow.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] }),
  );
  return (
    <View style={styles.box}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        {ring(colors.border, 0, `${length} ${length}`)}
        {ring(colors.blush, -length * 0.78, `${length * 0.14} ${length}`, windowOpacity)}
        {ring(
          colors.petal,
          arc.interpolate({ inputRange: [0, 1], outputRange: [length, length * 0.4] }),
          `${length} ${length}`,
        )}
      </Svg>
      <Animated.View style={[StyleSheet.absoluteFill, turn(orbit)]}>
        <Animated.View
          style={[
            styles.knob,
            { backgroundColor: colors.surface, borderColor: colors.primary },
            pop(knob),
          ]}
        />
      </Animated.View>
      <Animated.View style={[styles.sparkleA, pop(knob)]}>
        <Sparkle size={16} color={colors.petal} />
      </Animated.View>
      <Animated.View style={[styles.sparkleB, pop(knob)]}>
        <Sparkle size={10} color={colors.blush} />
      </Animated.View>
      <Animated.View style={pop(drop)}>
        <Animated.View style={float(bob, -spacing.sm)}>
          <Droplet size={36} strokeWidth={1.5} color={colors.primary} fill={colors.blush} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Card 3: a lock that breathes in a soft circle, with petal dots slowly circling it. */
export function PrivacyIllustration({ active, reduceMotion }: IllustrationProps) {
  const colors = useThemeColors();
  const [lock, ...dots] = useEntrance(active, reduceMotion, 5);
  const orbit = useAmbient(active, reduceMotion, { duration: 16000, mode: 'spin' });
  const breathe = useAmbient(active, reduceMotion, { duration: 3000, mode: 'breathe' });
  const spots = [
    { top: 6, left: SIZE / 2 - 5 },
    { top: SIZE / 2 - 5, right: 6 },
    { bottom: 6, left: SIZE / 2 - 5 },
    { top: SIZE / 2 - 5, left: 6 },
  ];
  return (
    <View style={styles.box}>
      <Animated.View style={[StyleSheet.absoluteFill, turn(orbit)]}>
        {dots.map((v, i) => (
          <Animated.View
            key={i}
            style={[styles.petal, spots[i], { backgroundColor: colors.petal }, pop(v)]}
          />
        ))}
      </Animated.View>
      <Animated.View style={pop(lock)}>
        <Animated.View
          style={[
            styles.lockCircle,
            { backgroundColor: colors.surfaceTint },
            {
              transform: [
                { scale: breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] }) },
              ],
            },
          ]}
        >
          <Lock size={40} strokeWidth={1.5} color={colors.primaryDeep} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

export const illustrationStyles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  box: illustrationStyles.box,
  knob: {
    position: 'absolute',
    top: 10 - KNOB / 2,
    left: SIZE / 2 - KNOB / 2,
    width: KNOB,
    height: KNOB,
    borderRadius: radius.pill,
    borderWidth: 3,
  },
  sparkleA: {
    position: 'absolute',
    top: -spacing.sm,
    right: -spacing.md,
  },
  sparkleB: {
    position: 'absolute',
    bottom: spacing.xs,
    left: -spacing.md,
  },
  petal: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: radius.pill,
  },
  lockCircle: {
    width: SIZE * 0.55,
    height: SIZE * 0.55,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
