import { Flower2, Heart } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

import { ILLUSTRATION_SIZE, illustrationStyles, type IllustrationProps } from './Illustrations';
import { float, pop, useAmbient, useEntrance } from './illustration-motion';

const SIZE = ILLUSTRATION_SIZE;

/** Card 2: a few things she can log float gently, like soft notes on a page. */
export function TrackIllustration({ active, reduceMotion }: IllustrationProps) {
  const colors = useThemeColors();
  const items = useEntrance(active, reduceMotion, 4);
  const drift = useAmbient(active, reduceMotion, { duration: 3600, mode: 'breathe' });

  const pill = (content: ReactNode, i: number, place: object, distance: number) => (
    <Animated.View key={i} style={[styles.item, place, pop(items[i])]}>
      <Animated.View
        style={[
          styles.pill,
          { backgroundColor: colors.surface, borderColor: colors.border },
          float(drift, distance),
        ]}
      >
        {content}
      </Animated.View>
    </Animated.View>
  );
  const label = (text: string) => (
    <Text style={[typography.label, { color: colors.primaryDeep }]}>{text}</Text>
  );

  return (
    <View style={illustrationStyles.box}>
      <View style={[styles.glow, { backgroundColor: colors.surfaceTint }]} />
      {pill(label('Cramps'), 0, { top: spacing.lg, left: 0 }, -spacing.sm)}
      {pill(
        <Heart size={16} strokeWidth={2} color={colors.primary} fill={colors.primary} />,
        1,
        { top: spacing.xxl, right: spacing.xs },
        spacing.sm,
      )}
      {pill(label('Bloating'), 2, { bottom: spacing.xxl, right: 0 }, -spacing.xs)}
      {pill(
        <Flower2 size={16} strokeWidth={2} color={colors.calm} />,
        3,
        { bottom: spacing.lg, left: spacing.lg },
        spacing.xs + 2,
      )}
    </View>
  );
}

const GRID_COLS = 5;
const GRID_ROWS = 3;
const FILLED = [5, 6, 7, 8]; // a few period days in the middle row
const CELL = 22;

/** Card 4: a mini calendar where a few days fill in, again and again, like adding past periods. */
export function CalendarIllustration({ active, reduceMotion }: IllustrationProps) {
  const colors = useThemeColors();
  const [fills] = useState(() => FILLED.map(() => new Animated.Value(0)));

  useEffect(() => {
    if (!active) {
      fills.forEach((v) => v.setValue(0));
      return;
    }
    if (reduceMotion) {
      fills.forEach((v) => v.setValue(1));
      return;
    }
    const to = (v: Animated.Value, value: number) =>
      Animated.timing(v, {
        toValue: value,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
    // Fill one by one, rest, clear softly, rest, repeat.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.stagger(
          160,
          fills.map((v) => to(v, 1)),
        ),
        Animated.delay(1400),
        Animated.parallel(fills.map((v) => to(v, 0))),
        Animated.delay(500),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, reduceMotion, fills]);

  return (
    <View style={illustrationStyles.box}>
      <View style={[styles.grid, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        {Array.from({ length: GRID_COLS * GRID_ROWS }, (_, i) => {
          const f = FILLED.indexOf(i);
          return (
            <View key={i} style={[styles.cell, { borderColor: colors.border }]}>
              {f >= 0 ? (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    styles.cellFill,
                    { backgroundColor: colors.petal },
                    pop(fills[f]),
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    width: SIZE * 0.6,
    height: SIZE * 0.6,
    borderRadius: radius.pill,
  },
  item: {
    position: 'absolute',
  },
  pill: {
    minHeight: spacing.xxl,
    minWidth: spacing.xxl,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: GRID_COLS * (CELL + spacing.sm) + spacing.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  cellFill: {
    borderRadius: radius.pill,
  },
});
