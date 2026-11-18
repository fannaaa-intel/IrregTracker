import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

import { useReduceMotion, useThemeColors } from '@/theme';

import { THEME_FADE } from '../logic';
import { applyAppearance, finishFade, useFadeRequest } from '../store';

// Material "standard" curve: gentle start, soft landing.
const ease = Easing.bezier(0.4, 0, 0.2, 1);

const fadeTo = (value: Animated.Value, toValue: number, duration: number) =>
  Animated.timing(value, { toValue, duration, easing: ease, useNativeDriver: true });

/** Runs `then` after the next two frames, i.e. once the re-render has been drawn. */
function afterPaint(then: () => void): () => void {
  let second = 0;
  const first = requestAnimationFrame(() => {
    second = requestAnimationFrame(then);
  });
  return () => {
    cancelAnimationFrame(first);
    cancelAnimationFrame(second);
  };
}

/**
 * Smooth light/dark switch. Two flat layers, animated only by opacity on the native thread
 * (so the theme re-render can't make it stutter):
 *   1. the old background fades over the app
 *   2. the theme switches underneath; once it has drawn, the new background dissolves over the old
 *   3. the new background fades away, revealing the app in its new theme
 * Instant with Reduce motion.
 */
export function AppearanceFader() {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();
  const request = useFadeRequest();
  const [oldLayer] = useState(() => new Animated.Value(0));
  const [newLayer] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (request === null) return;
    if (reduceMotion === true) {
      applyAppearance(request.to);
      finishFade();
      return;
    }
    oldLayer.setValue(0);
    newLayer.setValue(0);
    const running: Animated.CompositeAnimation[] = [];
    let cancelPaint: (() => void) | null = null;
    const play = (anim: Animated.CompositeAnimation, next: () => void) => {
      running.push(anim);
      anim.start(({ finished }) => {
        if (finished) next();
      });
    };

    play(fadeTo(oldLayer, 1, THEME_FADE.cover), () => {
      applyAppearance(request.to);
      cancelPaint = afterPaint(() =>
        play(fadeTo(newLayer, 1, THEME_FADE.dissolve), () => {
          oldLayer.setValue(0);
          play(fadeTo(newLayer, 0, THEME_FADE.reveal), finishFade);
        }),
      );
    });

    return () => {
      running.forEach((anim) => anim.stop());
      cancelPaint?.();
    };
  }, [request, reduceMotion, oldLayer, newLayer]);

  if (request === null) return null;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, { backgroundColor: request.fromBg, opacity: oldLayer }]}
      />
      <Animated.View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg, opacity: newLayer }]}
      />
    </>
  );
}
