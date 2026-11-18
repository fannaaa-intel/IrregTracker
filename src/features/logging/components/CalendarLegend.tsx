import { StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

import { flowFill } from '../flow-style';

const SWATCH = spacing.md + spacing.xs / 2; // 14
const DOT = spacing.xs + spacing.xs / 2; // 6

export function CalendarLegend() {
  const colors = useThemeColors();
  const label = [typography.caption, { color: colors.textMuted }];

  return (
    <View style={styles.row}>
      <View style={styles.item}>
        <View style={[styles.swatch, { backgroundColor: flowFill('medium') ?? colors.petal }]} />
        <Text style={label}>Period</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.dot, { backgroundColor: colors.petal }]} />
        <Text style={label}>Spotting</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.dashed, { borderColor: colors.blush }]} />
        <Text style={label}>Likely window</Text>
      </View>
      <View style={styles.item}>
        <View style={[styles.swatch, styles.ring, { borderColor: colors.primary }]} />
        <Text style={label}>Today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
    borderWidth: 1.5,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
});
