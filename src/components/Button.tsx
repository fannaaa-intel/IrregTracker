import { Pressable, StyleSheet, Text } from 'react-native';

import { radius, spacing, touchTarget, typography, useThemeColors } from '@/theme';

const BUTTON_HEIGHT = touchTarget + spacing.sm; // 52, per DESIGN.md §5

type Props = {
  label: string;
  onPress: () => void;
  /** 'primary' = filled pink, 'quiet' = text only. */
  variant?: 'primary' | 'quiet';
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
}: Props) {
  const colors = useThemeColors();
  const primary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        primary ? { backgroundColor: colors.primary } : null,
        // A soft press: slightly dimmer and a touch smaller, no ripple (DESIGN.md §6).
        {
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text style={[typography.label, { color: primary ? colors.onPrimary : colors.primary }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
});
