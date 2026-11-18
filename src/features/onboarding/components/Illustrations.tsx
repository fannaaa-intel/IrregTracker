import { Droplet, Lock } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { radius, spacing, useThemeColors } from '@/theme';

// Small animated pictures for the welcome cards (DESIGN.md §4 motifs: cycle ring, petal dots,
// droplet). Each replays its entrance when its card comes into view. Decorative only.

type Props = { active: boolean; reduceMotion: boolean };

const SIZE = 168;
const ease = Easing.out(Easing.cubic);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** `count` values that rise 0 → 1 one after another whenever `active` turns on. */
function useEntrance(active: boolean, reduceMotion: boolean, count: number, native: boolean) {
  const [values] = useState(() => Array.from({ length: count }, () => new Animated.Value(0)));
  useEffect(() => {
    if (!active) {
      values.forEach((v) => v.setValue(0));
      return;
    }
    if (reduceMotion) {
      values.forEach((v) => v.setValue(1));
      return;
    }
    const anim = Animated.stagger(
      60,
      values.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 220, easing: ease, useNativeDriver: native }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [active, reduceMotion, values, native]);
  return values;
}

const pop = (v: Animated.Value) => ({
  opacity: v,
  transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
});

/** Card 1: the cycle ring from Home, filling to "day 18", with the likely window. */
export function CycleIllustration({ active, reduceMotion }: Props) {
  const colors = useThemeColors();
  const [arc, windowArc] = useEntrance(active, reduceMotion, 2, false);
  const [drop] = useEntrance(active, reduceMotion, 1, true);
  const r = SIZE / 2 - 10;
  const length = 2 * Math.PI * r;
  const ring = (
    stroke: string,
    offset: Animated.AnimatedInterpolation<number> | number,
    dash: string,
    opacity?: Animated.Value,
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
  return (
    <View style={styles.box}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        {ring(colors.border, 0, `${length} ${length}`)}
        {ring(colors.blush, -length * 0.78, `${length * 0.14} ${length}`, windowArc)}
        {ring(
          colors.petal,
          arc.interpolate({ inputRange: [0, 1], outputRange: [length, length * 0.4] }),
          `${length} ${length}`,
        )}
      </Svg>
      <Animated.View style={pop(drop)}>
        <Droplet size={36} strokeWidth={1.5} color={colors.primary} fill={colors.blush} />
      </Animated.View>
    </View>
  );
}

/** Card 2: a lock in a soft circle, with four petal dots around it. */
export function PrivacyIllustration({ active, reduceMotion }: Props) {
  const colors = useThemeColors();
  const [lock, ...dots] = useEntrance(active, reduceMotion, 5, true);
  const spots = [
    { top: 6, left: SIZE / 2 - 5 },
    { top: SIZE / 2 - 5, right: 6 },
    { bottom: 6, left: SIZE / 2 - 5 },
    { top: SIZE / 2 - 5, left: 6 },
  ];
  return (
    <View style={styles.box}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={[styles.petal, spots[i], { backgroundColor: colors.petal }, pop(v)]}
        />
      ))}
      <Animated.View
        style={[styles.lockCircle, { backgroundColor: colors.surfaceTint }, pop(lock)]}
      >
        <Lock size={40} strokeWidth={1.5} color={colors.primaryDeep} />
      </Animated.View>
    </View>
  );
}

const GRID_COLS = 5;
const GRID_ROWS = 3;
const FILLED = [5, 6, 7, 8]; // a few period days in the middle row
const CELL = 22;

/** Card 3: a mini calendar where a few days fill in, like adding past periods. */
export function CalendarIllustration({ active, reduceMotion }: Props) {
  const colors = useThemeColors();
  const fills = useEntrance(active, reduceMotion, FILLED.length, true);
  return (
    <View style={styles.box}>
      <View style={[styles.grid, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
          const f = FILLED.indexOf(i);
          return (
            <View key={i} style={[styles.cell, { borderColor: colors.border }]}>
              {f >= 0 ? (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    styles.cellFill,
                    { backgroundColor: colors.petal },
                    pop(fills[f]),
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
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
  grid: {
    width: GRID_COLS * (CELL + spacing.sm) + spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  cellFill: {
    borderRadius: radius.pill,
  },
});
