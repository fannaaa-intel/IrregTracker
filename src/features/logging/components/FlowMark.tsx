import { Check, Droplet } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { spacing, useThemeColors, type Flow } from '@/theme';

import { dropletCount } from '../flow-style';

// DESIGN.md §4.4: 1–3 droplets for flow, a small dot for spotting.
const MARK = spacing.sm + spacing.xs / 2; // 10
const DOT = spacing.xs + spacing.xs / 2; // 6

type Props = {
  flow: Flow | null;
  /** Backfill mode: a check replaces the flow mark on selected days. */
  selected?: boolean;
};

/** Decorative: the meaning is also in the day's accessibility label. */
export function FlowMark({ flow, selected = false }: Props) {
  const colors = useThemeColors();

  let content = null;
  if (selected) {
    content = <Check size={MARK} strokeWidth={2.5} color={colors.primaryDeep} />;
  } else if (flow === 'spotting') {
    content = <View style={[styles.dot, { backgroundColor: colors.petal }]} />;
  } else if (flow !== null) {
    content = Array.from({ length: dropletCount(flow) }, (_, i) => (
      <Droplet key={i} size={MARK} strokeWidth={1.5} color={colors.petal} fill={colors.petal} />
    ));
  }

  return (
    <View
      style={styles.row}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MARK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
  },
});
