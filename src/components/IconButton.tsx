import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';

import { radius, touchTarget, useThemeColors } from '@/theme';

// DESIGN.md §4.6: line icons, stroke 1.5, size 22.
const ICON_SIZE = 22;
const ICON_STROKE = 1.5;

type Props = {
  icon: LucideIcon;
  /** Required: icon-only buttons need a spoken name (CLAUDE.md §6.5). */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

export function IconButton({ icon: Icon, accessibilityLabel, onPress, disabled = false }: Props) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.button, { opacity: disabled ? 0.35 : pressed ? 0.6 : 1 }]}
    >
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
});
