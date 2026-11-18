import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { useReduceMotion, useThemeColors } from '@/theme';

import { THEME_FADE } from '../logic';
import { applyAppearance, finishFade, useFadeRequest } from '../store';

const ease = Easing.inOut(Easing.cubic);

/**
 * Smooth theme switch: covers the screen with the old background, morphs it into the new
 * background while the theme changes underneath, then reveals. Instant with Reduce motion.
 */
export function AppearanceFader() {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();
  const request = useFadeRequest();
  const [opacity] = useState(() => new Animated.Value(0));
  const [mix] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (request === null) return;
    if (reduceMotion === true) {
      applyAppearance(request.to);
      finishFade();
      return;
    }
    opacity.setValue(0);
    mix.setValue(0);
    const step = (value: Animated.Value, toValue: number, duration: number) =>
      Animated.timing(value, { toValue, duration, easing: ease, useNativeDriver: false });
    let rest: Animated.CompositeAnimation | null = null;
    const cover = step(opacity, 1, THEME_FADE.cover);
    cover.start(({ finished }) => {
      if (!finished) return;
      applyAppearance(request.to);
      rest = Animated.sequence([
        step(mix, 1, THEME_FADE.morph),
        step(opacity, 0, THEME_FADE.reveal),
      ]);
      rest.start(() => finishFade());
    });
    return () => {
      cover.stop();
      rest?.stop();
    };
  }, [request, reduceMotion, opacity, mix]);

  if (request === null) return null;
  const backgroundColor = mix.interpolate({
    inputRange: [0, 1],
    outputRange: [request.fromBg, colors.bg],
  });

  return (
    <Animated.View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { opacity, backgroundColor }]}
    />
  );
}
