import { Check } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, touchTarget, typography, useThemeColors } from '@/theme';

const CHIP_HEIGHT = touchTarget - spacing.sm; // 36, per DESIGN.md §5
const HIT_SLOP = { top: spacing.xs, bottom: spacing.xs }; // brings the target to 44

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 'radio' inside a single-choice group (e.g. flow), 'button' otherwise. */
  accessibilityRole?: 'radio' | 'button';
  accessibilityLabel?: string;
  /** Optional mark before the label, such as droplets. */
  leading?: ReactNode;
};

export function Chip({
  label,
  selected,
  onPress,
  accessibilityRole = 'button',
  accessibilityLabel,
  leading,
}: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={accessibilityRole === 'radio' ? { checked: selected } : { selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.surfaceTint : colors.surface,
          borderColor: selected ? colors.surfaceTint : colors.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      {selected ? <Check size={16} strokeWidth={1.5} color={colors.primaryDeep} /> : null}
      {leading}
      <Text style={[typography.label, { color: selected ? colors.primaryDeep : colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: CHIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
});
