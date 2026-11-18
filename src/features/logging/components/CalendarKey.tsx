import { Flower2, Heart } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { flowFill } from '../flow-style';

const MARK = spacing.xl; // 24, the column the marks sit in
const SWATCH = spacing.lg; // 16
const ICON = spacing.md + 2; // 14

type Props = {
  /** Fertile days are on and shown for this cycle. */
  showFertile: boolean;
};

/**
 * "What the marks mean", in plain words, right under the calendar. Open by default so nothing is
 * a guess; she can hide it. Every estimate says it's an estimate.
 */
export function CalendarKey({ showFertile }: Props) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(true);

  const row = (mark: ReactNode, title: string, text: string) => (
    <View key={title} style={styles.row}>
      <View style={styles.mark}>{mark}</View>
      <View style={styles.text}>
        <Text style={[typography.label, { color: colors.text }]}>{title}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{text}</Text>
      </View>
    </View>
  );

  return (
    <Card>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          What the marks mean
        </Text>
        <Button
          variant="quiet"
          label={open ? 'Hide' : 'Show'}
          accessibilityLabel={open ? 'Hide what the marks mean' : 'Show what the marks mean'}
          onPress={() => setOpen((v) => !v)}
        />
      </View>
      {open ? (
        <View style={styles.rows}>
          {row(
            <View
              style={[styles.swatch, { backgroundColor: flowFill('medium') ?? colors.petal }]}
            />,
            'Period day',
            'A day you logged bleeding. The drops under it show the flow: 1 light, 2 medium, 3 heavy.',
          )}
          {row(
            <View style={[styles.dot, { backgroundColor: colors.petal }]} />,
            'Spotting',
            'A little bleeding you logged that does not start a new cycle.',
          )}
          {row(
            <View style={[styles.swatch, styles.dashed, { borderColor: colors.petal }]} />,
            'Likely next period',
            'Your next period will probably start on one of these days. An estimate from your past cycles.',
          )}
          {showFertile
            ? row(
                <View style={[styles.swatch, { backgroundColor: colors.fertile }]} />,
                'Possible fertile days',
                'A higher chance of pregnancy. An estimate, not contraception.',
              )
            : null}
          {showFertile
            ? row(
                <Flower2 size={ICON} strokeWidth={2} color={colors.calm} />,
                'Likely ovulation',
                'Ovulation happens on just one day. It most likely falls on one of the flower days.',
              )
            : null}
          {row(
            <Heart size={ICON} strokeWidth={2} color={colors.primary} fill={colors.primary} />,
            'Sex',
            'A day you logged sex.',
          )}
          {row(
            <View style={[styles.ring, { borderColor: colors.textMuted }]} />,
            'Symptoms',
            'A day you logged how you felt, like cramps or bloating.',
          )}
          {row(
            <View style={[styles.swatch, styles.outline, { borderColor: colors.primary }]} />,
            'Today',
            'The ring around the number.',
          )}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rows: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  mark: {
    width: MARK,
    minHeight: MARK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
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
  outline: {
    borderWidth: 1.5,
  },
  dot: {
    width: spacing.sm - 2,
    height: spacing.sm - 2,
    borderRadius: radius.pill,
  },
  ring: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
});
