import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Blob } from '@/components/Blob';
import {
  darkColors,
  lightColors,
  radius,
  spacing,
  typography,
  useReduceMotion,
  useThemeColors,
} from '@/theme';

import { getPhoneSchemeAtLaunch } from '../../appearance/store';
import { OPENING_NAME, OPENING_TAGLINE, openingTimeline, type Step } from '../timeline';
import { OpeningRing, RING_SIZE, rise } from './OpeningRing';

const DOT = 6;
const BLOB = 280;

type Props = { onDone: () => void };

const easeOut = Easing.out(Easing.cubic);
const timing = (value: Animated.Value, step: Step, native = true) =>
  Animated.timing(value, {
    toValue: 1,
    delay: step.delay,
    duration: step.duration,
    easing: easeOut,
    useNativeDriver: native,
  });

/**
 * Opening animation (DESIGN.md §4, §6): picks up from the native splash frame, blooms two soft
 * blobs, draws the cycle ring around the logo, lifts the name and four petal dots into place, then
 * fades into the app. Decorative only: hidden from screen readers, and a quick fade with Reduce
 * motion on.
 */
export function OpeningOverlay({ onDone }: Props) {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();
  // Animated values live in state (created once), so render never reads a ref.
  const [v] = useState(() => ({
    bloom: new Animated.Value(0),
    ring: new Animated.Value(0),
    window: new Animated.Value(0),
    name: new Animated.Value(0),
    tagline: new Animated.Value(0),
    dots: [0, 1, 2, 3].map(() => new Animated.Value(0)),
    exit: new Animated.Value(0),
    bgMix: new Animated.Value(0),
  }));
  // The native splash follows the phone's theme; ease from it into the app's chosen theme.
  const splashBg = getPhoneSchemeAtLaunch() === 'dark' ? darkColors.bg : lightColors.bg;

  useEffect(() => {
    if (reduceMotion === null) return;
    const t = openingTimeline(reduceMotion);
    const animation = Animated.parallel([
      timing(v.bgMix, { delay: 0, duration: 200 }, false),
      ...(reduceMotion
        ? []
        : [
            timing(v.bloom, t.bloom),
            timing(v.ring, t.ring, false),
            timing(v.window, t.window, false),
            timing(v.name, t.name),
            timing(v.tagline, t.tagline),
            ...t.dots.map((step, i) => timing(v.dots[i], step)),
          ]),
      timing(v.exit, t.exit),
    ]);
    const start = setTimeout(() => {
      animation.start(({ finished }) => {
        if (finished) onDone();
      });
    }, t.hold);
    return () => {
      clearTimeout(start);
      animation.stop();
    };
  }, [reduceMotion, v, onDone]);

  const fadeOut = v.exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const lift = v.exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const bloom = {
    opacity: v.bloom,
    transform: [{ scale: v.bloom.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
  };
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, styles.center, { opacity: fadeOut }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: v.bgMix.interpolate({
              inputRange: [0, 1],
              outputRange: [splashBg, colors.bg],
            }),
          },
        ]}
      />
      <Animated.View style={[styles.blobTop, bloom]}>
        <Blob size={BLOB} style={styles.blobInner} />
      </Animated.View>
      <Animated.View style={[styles.blobBottom, bloom]}>
        <Blob size={BLOB * 0.8} style={styles.blobInner} />
      </Animated.View>

      <OpeningRing ring={v.ring} window={v.window} lift={lift} />

      <View style={styles.below}>
        <Animated.Text
          style={[typography.title, styles.text, { color: colors.text }, rise(v.name)]}
        >
          {OPENING_NAME}
        </Animated.Text>
        <Animated.Text
          style={[typography.body, styles.text, { color: colors.textMuted }, rise(v.tagline)]}
        >
          {OPENING_TAGLINE}
        </Animated.Text>
        <View style={styles.dots}>
          {v.dots.map((value, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { backgroundColor: colors.petal }, rise(value, spacing.xs)]}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobTop: {
    position: 'absolute',
    top: -BLOB * 0.35,
    right: -BLOB * 0.35,
    width: BLOB,
    height: BLOB,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -BLOB * 0.3,
    left: -BLOB * 0.3,
    width: BLOB * 0.8,
    height: BLOB * 0.8,
  },
  blobInner: {
    top: 0,
    left: 0,
  },
  below: {
    position: 'absolute',
    top: '50%',
    left: spacing.xl,
    right: spacing.xl,
    marginTop: RING_SIZE / 2 + spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  text: {
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
});
