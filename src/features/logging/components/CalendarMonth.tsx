import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { formatMonth } from '@/lib/date';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { weekdayInitials, windowSegments, type MonthGrid } from '../logic';
import { CalendarDay, DAY_CIRCLE, DAY_TOP_PADDING } from './CalendarDay';

type Props = {
  grid: MonthGrid;
  onDayPress: (date: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canGoNext: boolean;
};

export function CalendarMonth({ grid, onDayPress, onPrevMonth, onNextMonth, canGoNext }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon={ChevronLeft} accessibilityLabel="Previous month" onPress={onPrevMonth} />
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          {formatMonth(grid.month)}
        </Text>
        <IconButton
          icon={ChevronRight}
          accessibilityLabel="Next month"
          onPress={onNextMonth}
          disabled={!canGoNext}
        />
      </View>

      <View
        style={styles.week}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {weekdayInitials().map((initial, i) => (
          <Text key={i} style={[typography.caption, styles.weekday, { color: colors.textMuted }]}>
            {initial}
          </Text>
        ))}
      </View>

      {grid.weeks.map((week, row) => (
        <View key={row} style={styles.week}>
          {/* DESIGN.md §4.5: dashed band joining the predicted days, drawn behind them. */}
          {windowSegments(week).map(({ from, to }) => (
            <View
              key={from}
              pointerEvents="none"
              style={[
                styles.band,
                {
                  borderColor: colors.blush,
                  left: `${(from / 7) * 100}%`,
                  width: `${((to - from + 1) / 7) * 100}%`,
                },
              ]}
            />
          ))}
          {week.map((cell, column) =>
            cell === null ? (
              <View key={column} style={styles.empty} />
            ) : (
              <CalendarDay key={cell.date} cell={cell} onPress={onDayPress} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  week: {
    flexDirection: 'row',
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
  },
  empty: {
    flex: 1,
  },
  band: {
    position: 'absolute',
    top: DAY_TOP_PADDING,
    height: DAY_CIRCLE,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: radius.pill,
  },
});
