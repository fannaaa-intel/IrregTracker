import { Check } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { motion, radius, spacing, typography, useReduceMotion, useThemeColors } from '@/theme';

const SHOW_MS = 1400;

/**
 * A small "Saved" that fades in after each change, then quietly fades away, so she knows every
 * tap was kept. `version` goes up after each save; 0 shows nothing. Announced to screen readers.
 */
export function SavedNote({ version }: { version: number }) {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion() === true;
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (version === 0) return;
    const fade = (toValue: number, delay = 0) =>
      Animated.timing(opacity, {
        toValue,
        delay,
        duration: reduceMotion ? 0 : motion.press,
        useNativeDriver: true,
      });
    const anim = Animated.sequence([fade(1), fade(0, SHOW_MS)]);
    anim.start();
    return () => anim.stop();
  }, [version, opacity, reduceMotion]);

  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={[styles.note, { backgroundColor: colors.surfaceTint, opacity }]}
    >
      <Check size={spacing.lg} strokeWidth={2} color={colors.calm} />
      <Text style={[typography.label, { color: colors.calm }]}>{version === 0 ? '' : 'Saved'}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
});
