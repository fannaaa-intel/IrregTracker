import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

// Motion helpers for the welcome pictures. Entrances are ≤ 250 ms (CLAUDE.md §6.7); the ambient
// loops are very slow drifts (DESIGN.md §4.2) and stop completely with Reduce motion.

const ease = Easing.out(Easing.cubic);
const soft = Easing.inOut(Easing.sin);

/** `count` values that rise 0 → 1 one after another whenever `active` turns on. */
export function useEntrance(active: boolean, reduceMotion: boolean, count: number, native = true) {
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
      70,
      values.map((v) =>
        Animated.timing(v, { toValue: 1, duration: 220, easing: ease, useNativeDriver: native }),
      ),
    );
    anim.start();
    return () => anim.stop();
  }, [active, reduceMotion, values, native]);
  return values;
}

/**
 * A slow, endless value while `active`: 'spin' goes 0 → 1 and starts over (for rotation),
 * 'breathe' goes 0 → 1 → 0 (for floating and pulsing). Stays at 0 with Reduce motion.
 */
export function useAmbient(
  active: boolean,
  reduceMotion: boolean,
  {
    duration,
    mode,
    native = true,
  }: { duration: number; mode: 'spin' | 'breathe'; native?: boolean },
) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    value.setValue(0);
    if (!active || reduceMotion) return;
    const step = (toValue: number, time: number, easing = soft) =>
      Animated.timing(value, { toValue, duration: time, easing, useNativeDriver: native });
    const loop = Animated.loop(
      mode === 'spin'
        ? step(1, duration, Easing.linear)
        : Animated.sequence([step(1, duration / 2), step(0, duration / 2)]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, reduceMotion, value, duration, mode, native]);
  return value;
}

/** Fades in and grows from 60 %. */
export const pop = (v: Animated.Value) => ({
  opacity: v,
  transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
});

/** Floats up and down by `distance` points as a 'breathe' value moves. */
export const float = (v: Animated.Value, distance: number) => ({
  transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, distance] }) }],
});

/** A full turn as a 'spin' value moves. */
export const turn = (v: Animated.Value) => ({
  transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
});
