import { Flower2, Heart } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget, typography, useThemeColors } from '@/theme';

import { flowFill, onFlowText } from '../flow-style';
import { dayLabel, type DayCell } from '../logic';
import { FlowMark } from './FlowMark';

// DESIGN.md §5: 44×44 circle; period = filled flow color; today = 1.5px primary ring;
// spotting = dot under the number. Added Nov 18: heart = sex logged (top-right of the circle),
// flower = likely ovulation, small ring = symptoms logged. All also in the accessibility label.
export const DAY_CIRCLE = touchTarget;
const ICON = spacing.md; // 12
const RING = spacing.sm - 1; // 7
export const DAY_TOP_PADDING = spacing.xs;

type Props = {
  cell: DayCell;
  onPress: (date: string) => void;
};

export function CalendarDay({ cell, onPress }: Props) {
  const colors = useThemeColors();
  const fill = cell.flow === null ? null : flowFill(cell.flow);
  const numberColor =
    (cell.flow === null ? null : onFlowText(cell.flow)) ??
    (cell.isFuture ? colors.textMuted : colors.text);

  return (
    <Pressable
      onPress={() => onPress(cell.date)}
      disabled={cell.isFuture}
      accessibilityRole="button"
      accessibilityLabel={dayLabel(cell)}
      accessibilityState={{ disabled: cell.isFuture, selected: cell.selected }}
      style={({ pressed }) => [styles.cell, { opacity: pressed ? 0.7 : 1 }]}
    >
      <View
        style={[
          styles.circle,
          fill !== null ? { backgroundColor: fill } : null,
          cell.selected && fill === null ? { backgroundColor: colors.surfaceTint } : null,
          cell.isToday ? { borderWidth: 1.5, borderColor: colors.primary } : null,
          cell.selected ? { borderWidth: 2, borderColor: colors.primaryDeep } : null,
        ]}
      >
        <Text
          maxFontSizeMultiplier={1.4}
          style={[typography.body, styles.number, { color: numberColor }]}
        >
          {cell.dayOfMonth}
        </Text>
        {cell.hasIntimacy === true ? (
          <View style={styles.heart} accessibilityElementsHidden>
            <Heart size={ICON} strokeWidth={2} color={colors.primary} fill={colors.primary} />
          </View>
        ) : null}
      </View>
      <View style={styles.marks} accessibilityElementsHidden>
        <FlowMark flow={cell.flow} selected={cell.selected} />
        {cell.fertility === 'ovulation' && cell.flow === null && !cell.selected ? (
          <Flower2 size={ICON - 2} strokeWidth={2} color={colors.calm} />
        ) : null}
        {cell.hasSymptoms === true && !cell.selected ? (
          <View style={[styles.ring, { borderColor: colors.textMuted }]} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingTop: DAY_TOP_PADDING,
    paddingBottom: spacing.xs,
    gap: 2,
  },
  circle: {
    width: DAY_CIRCLE,
    height: DAY_CIRCLE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontVariant: ['tabular-nums'],
  },
  heart: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  marks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 1.5,
  },
});
