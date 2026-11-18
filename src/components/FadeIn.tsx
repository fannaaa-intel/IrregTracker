import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

import { motion, spacing, useReduceMotion } from '@/theme';

const STAGGER = 60;

type Props = {
  children: ReactNode;
  /** Position in the screen's list: each one starts a little after the previous. */
  index?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Content rises softly into place the first time a screen opens (250 ms, DESIGN.md §6).
 * With Reduce motion on, it's simply there.
 */
export function FadeIn({ children, index = 0, style }: Props) {
  const reduceMotion = useReduceMotion();
  const [value] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduceMotion === null) return;
    if (reduceMotion) {
      value.setValue(1);
      return;
    }
    const anim = Animated.timing(value, {
      toValue: 1,
      duration: motion.sheet,
      delay: index * STAGGER,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, value, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: value,
          transform: [
            { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [spacing.md, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
