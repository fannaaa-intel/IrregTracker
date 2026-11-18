import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, PanResponder, View } from 'react-native';

import { motion, spacing, useReduceMotion } from '@/theme';

/** A sideways drag this far (in points) changes the month. */
const SWIPE_DISTANCE = spacing.xxxl;
const SLIDE = spacing.xl;

type Props = {
  /** year * 12 + month: changes whenever the shown month changes. */
  monthKey: number;
  onPrev: () => void;
  onNext: () => void;
  canGoNext: boolean;
  children: ReactNode;
};

/**
 * Swipe left for the next month, right for the previous one (the arrows still work). The new
 * month slides in softly (≤ 250 ms), or just appears with Reduce motion on (DESIGN.md §6).
 */
export function MonthSwiper({ monthKey, onPrev, onNext, canGoNext, children }: Props) {
  const reduceMotion = useReduceMotion() === true;
  const [opacity] = useState(() => new Animated.Value(1));
  const [shift] = useState(() => new Animated.Value(0));
  const previousKey = useRef(monthKey);

  useEffect(() => {
    const direction = Math.sign(monthKey - previousKey.current);
    previousKey.current = monthKey;
    if (direction === 0 || reduceMotion) return;
    opacity.setValue(0);
    shift.setValue(direction * SLIDE);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: motion.sheet, useNativeDriver: true }),
      Animated.timing(shift, { toValue: 0, duration: motion.sheet, useNativeDriver: true }),
    ]).start();
  }, [monthKey, reduceMotion, opacity, shift]);

  // Rebuilt only when the callbacks change; nothing re-renders mid-swipe, so a drag never
  // switches handlers halfway.
  const responder = useMemo(
    () =>
      PanResponder.create({
        // Only clearly sideways drags: vertical scrolling and taps on days keep working.
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > spacing.lg && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderRelease: (_, g) => {
          if (g.dx <= -SWIPE_DISTANCE && canGoNext) onNext();
          else if (g.dx >= SWIPE_DISTANCE) onPrev();
        },
      }),
    [onPrev, onNext, canGoNext],
  );

  return (
    <View {...responder.panHandlers}>
      <Animated.View style={{ opacity, transform: [{ translateX: shift }] }}>
        {children}
      </Animated.View>
    </View>
  );
}
