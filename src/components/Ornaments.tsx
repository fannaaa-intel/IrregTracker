import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

// Soft feminine accents (owner request, Nov 18, 2026; DESIGN.md §4.8): a five-petal flower and
// a four-point sparkle, drawn as simple shapes. Used sparingly, one or two per screen, and
// always decorative: hidden from screen readers, never carrying meaning on their own.

type Props = {
  size: number;
  color: string;
  /** Flower only: the centre dot. Defaults to `color`. */
  centerColor?: string;
  opacity?: number;
  style?: StyleProp<ViewStyle>;
};

function Decorative({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={style}
    >
      {children}
    </View>
  );
}

/** Five rounded petals around a small centre. */
export function Flower({ size, color, centerColor, opacity = 1, style }: Props) {
  return (
    <Decorative style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
        <G origin="12, 12">
          {[0, 72, 144, 216, 288].map((angle) => (
            <Ellipse
              key={angle}
              cx={12}
              cy={6.5}
              rx={3.6}
              ry={5}
              fill={color}
              opacity={0.85}
              rotation={angle}
              origin="12, 12"
            />
          ))}
        </G>
        <Circle cx={12} cy={12} r={2.6} fill={centerColor ?? color} />
      </Svg>
    </Decorative>
  );
}

/** A soft four-point sparkle. */
export function Sparkle({ size, color, opacity = 1, style }: Props) {
  return (
    <Decorative style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
        <Path
          d="M12 0C12.9 7.2 16.8 11.1 24 12C16.8 12.9 12.9 16.8 12 24C11.1 16.8 7.2 12.9 0 12C7.2 11.1 11.1 7.2 12 0Z"
          fill={color}
        />
      </Svg>
    </Decorative>
  );
}
