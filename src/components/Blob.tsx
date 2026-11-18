import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useThemeColors } from '@/theme';

type Props = {
  size: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * DESIGN.md §4.2: a soft organic shape in `blush`, partly off-screen behind a header.
 * Static (no drift), so it needs no Reduce Motion handling. Purely decorative.
 */
export function Blob({ size, style }: Props) {
  const colors = useThemeColors();
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.blob, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Path
          d="M151 39c22 19 35 51 28 80s-33 54-64 60-64-7-82-31-20-58-4-84 45-41 72-43 28-1 50 18z"
          fill={colors.blush}
          opacity={0.5}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
