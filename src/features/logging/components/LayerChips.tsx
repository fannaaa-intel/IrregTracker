import { Flower2, Heart } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { flowFill } from '../flow-style';
import { CALENDAR_LAYERS, layerLabel, type CalendarLayer } from '../filters';

const SWATCH = spacing.md; // 12
const ICON = spacing.md; // 12

type Props = {
  visible: ReadonlySet<CalendarLayer>;
  onToggle: (layer: CalendarLayer) => void;
  /** Fertile days are turned on in Settings. */
  showFertile: boolean;
};

/**
 * Filters and legend in one: each chip shows the mark it stands for, and tapping it hides or
 * shows that mark on the calendar. Scrolls sideways on narrow phones instead of crowding.
 */
export function LayerChips({ visible, onToggle, showFertile }: Props) {
  const colors = useThemeColors();

  const mark: Record<CalendarLayer, ReactNode> = {
    period: (
      <View style={[styles.swatch, { backgroundColor: flowFill('medium') ?? colors.petal }]} />
    ),
    predicted: <View style={[styles.swatch, styles.dashed, { borderColor: colors.petal }]} />,
    fertile: <Flower2 size={ICON} strokeWidth={2} color={colors.calm} />,
    sex: <Heart size={ICON} strokeWidth={2} color={colors.primary} fill={colors.primary} />,
    symptoms: <View style={[styles.ring, { borderColor: colors.textMuted }]} />,
  };
  const layers = CALENDAR_LAYERS.filter((layer) => layer !== 'fertile' || showFertile);

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Show on calendar. Tap to hide or show.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {layers.map((layer) => (
          <Chip
            key={layer}
            label={layerLabel[layer]}
            accessibilityLabel={`Show ${layerLabel[layer].toLowerCase()} on the calendar`}
            selected={visible.has(layer)}
            onPress={() => onToggle(layer)}
            leading={mark[layer]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  swatch: {
    width: SWATCH,
    height: SWATCH,
    borderRadius: radius.pill,
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  ring: {
    width: SWATCH - 4,
    height: SWATCH - 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
});
