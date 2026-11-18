import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { spacing, useReduceMotion } from '@/theme';

import { Blob } from './Blob';

const DRIFT_MS = 10000;

type Props = {
  size: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * DESIGN.md §4.2: the soft blob, drifting very slowly back and forth behind a header (no
 * pulsing, no scaling). Stands still with Reduce motion. Purely decorative.
 */
export function DriftBlob({ size, style }: Props) {
  const reduceMotion = useReduceMotion();
  const [drift] = useState(() => new Animated.Value(0));

  useEffect(() => {
    drift.setValue(0);
    if (reduceMotion !== false) return;
    const ease = Easing.inOut(Easing.sin);
    const to = (toValue: number) =>
      Animated.timing(drift, {
        toValue,
        duration: DRIFT_MS / 2,
        easing: ease,
        useNativeDriver: true,
      });
    const loop = Animated.loop(Animated.sequence([to(1), to(0)]));
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, drift]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.wrap,
        { width: size, height: size },
        style,
        {
          transform: [
            {
              translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [0, -spacing.lg] }),
            },
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, spacing.md] }) },
          ],
        },
      ]}
    >
      <Blob size={size} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
  },
});
