import { useEffect, useState } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import splashImage from '@/assets/images/splash-icon.png';
import { darkColors, lightColors, radius, spacing, useReduceMotion, useThemeColors } from '@/theme';

import { getPhoneSchemeAtLaunch } from '../../appearance/store';

import { openingTimeline, SPLASH_IMAGE_SIZE, type Step } from '../timeline';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const RING_SIZE = SPLASH_IMAGE_SIZE + spacing.xxxl;
const RING_STROKE = 1.5;
const RING_R = (RING_SIZE - RING_STROKE) / 2;
const RING_LENGTH = 2 * Math.PI * RING_R;
const DOT = 6;

type Props = { onDone: () => void };

const easeOut = Easing.out(Easing.cubic);
const timing = (value: Animated.Value, to: number, step: Step, native = true) =>
  Animated.timing(value, {
    toValue: to,
    delay: step.delay,
    duration: step.duration,
    easing: easeOut,
    useNativeDriver: native,
  });

/**
 * Opening animation (DESIGN.md §4, §6): picks up from the native splash frame, draws a petal ring
 * around the logo, shows four petal dots, then fades into the app. Decorative only: hidden from
 * screen readers, and reduced to a quick fade when the phone asks for less motion.
 */
export function OpeningOverlay({ onDone }: Props) {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();
  // Animated values live in state (created once), so render never reads a ref.
  const [ring] = useState(() => new Animated.Value(0));
  const [dots] = useState(() => [0, 1, 2, 3].map(() => new Animated.Value(0)));
  const [exit] = useState(() => new Animated.Value(0));
  const [bgMix] = useState(() => new Animated.Value(0));
  // The native splash follows the phone's theme; ease from it into the app's chosen theme.
  const splashBg = getPhoneSchemeAtLaunch() === 'dark' ? darkColors.bg : lightColors.bg;

  useEffect(() => {
    if (reduceMotion === null) return;
    const t = openingTimeline(reduceMotion);
    const animation = Animated.parallel([
      timing(bgMix, 1, { delay: 0, duration: 200 }, false),
      ...(reduceMotion ? [] : [timing(ring, 1, t.ring, false)]),
      ...t.dots.map((step, i) => timing(dots[i], 1, step)),
      timing(exit, 1, t.exit),
    ]);
    // Hold the splash frame while the app's first render settles, so the ring draws smoothly.
    const start = setTimeout(() => {
      animation.start(({ finished }) => {
        if (finished) onDone();
      });
    }, t.hold);
    return () => {
      clearTimeout(start);
      animation.stop();
    };
  }, [reduceMotion, ring, dots, exit, bgMix, onDone]);

  const fadeOut = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const lift = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });
  const dash = ring.interpolate({ inputRange: [0, 1], outputRange: [RING_LENGTH, 0] });

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
            backgroundColor: bgMix.interpolate({
              inputRange: [0, 1],
              outputRange: [splashBg, colors.bg],
            }),
          },
        ]}
      />
      <Animated.View style={[styles.center, { transform: [{ scale: lift }] }]}>
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ring}>
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_R}
            stroke={colors.petal}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${RING_LENGTH} ${RING_LENGTH}`}
            strokeDashoffset={dash}
            rotation={-90}
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
        <Image source={splashImage} style={styles.logo} />
      </Animated.View>
      <View style={styles.dots}>
        {dots.map((value, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: colors.petal,
                opacity: value,
                transform: [
                  { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [4, 0] }) },
                ],
              },
            ]}
          />
        ))}
      </View>
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
  dots: {
    position: 'absolute',
    top: '50%',
    marginTop: RING_SIZE / 2 + spacing.xl,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
});
