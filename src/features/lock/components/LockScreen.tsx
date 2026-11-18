import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Blob } from '@/components/Blob';
import { Button } from '@/components/Button';
import { radius, spacing, typography, useThemeColors } from '@/theme';

type Props = {
  onUnlock: () => void;
  /** Ask straight away when the screen appears. */
  autoPrompt?: boolean;
};

/** Covers the whole app while locked. Shows nothing about her data. */
export function LockScreen({ onUnlock, autoPrompt = true }: Props) {
  const colors = useThemeColors();

  useEffect(() => {
    if (autoPrompt) onUnlock();
    // Only on first appearance; the button is there for retries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      accessibilityViewIsModal
      style={[StyleSheet.absoluteFill, styles.screen, { backgroundColor: colors.bg }]}
    >
      <Blob size={280} style={styles.blob} />
      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no">
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.dot, { backgroundColor: colors.petal }]} />
        ))}
      </View>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
        Locked
      </Text>
      <Button label="Unlock" onPress={onUnlock} />
    </View>
  );
}

const DOT = spacing.sm;

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
  blob: {
    top: -spacing.xxxl * 1.5,
    right: -spacing.xxxl * 1.5,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
});
