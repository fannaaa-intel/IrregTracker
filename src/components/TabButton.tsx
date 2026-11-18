import type { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { Pressable } from 'react-native';

/**
 * Tab bar button without the Android ripple (owner's request). Press feedback is a quiet
 * opacity change instead, so it still feels responsive.
 */
export function TabButton({
  children,
  style,
  onPress,
  onLongPress,
  accessibilityLabel,
  accessibilityState,
  testID,
  'aria-selected': selected,
}: BottomTabBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="tab"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState ?? { selected: selected === true }}
      testID={testID}
      style={({ pressed }) => [style, { opacity: pressed ? 0.6 : 1 }]}
    >
      {children}
    </Pressable>
  );
}
