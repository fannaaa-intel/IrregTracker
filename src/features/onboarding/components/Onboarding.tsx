import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Blob } from '@/components/Blob';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { ONBOARDING_CARDS } from '../logic';

type Props = {
  /** `backfill` = she chose to add past periods now. */
  onFinish: (backfill: boolean) => void;
};

/** PLAN.md §7: what it does, the privacy promise, then "add your last few periods". */
export function Onboarding({ onFinish }: Props) {
  const colors = useThemeColors();
  const [index, setIndex] = useState(0);
  const card = ONBOARDING_CARDS[index];
  const last = index === ONBOARDING_CARDS.length - 1;
  const stepText = `Step ${index + 1} of ${ONBOARDING_CARDS.length}`;

  return (
    <View style={styles.container}>
      <Blob size={300} style={styles.blob} />
      <View style={styles.middle}>
        <View accessible accessibilityLabel={stepText} style={styles.dots}>
          {ONBOARDING_CARDS.map((item, i) => (
            <View
              key={item.key}
              style={[
                styles.dot,
                i === index
                  ? [styles.dotActive, { backgroundColor: colors.petal }]
                  : { backgroundColor: colors.border },
              ]}
            />
          ))}
        </View>
        <Card style={styles.card}>
          <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
            {card.title}
          </Text>
          <Text style={[typography.body, { color: colors.text }]}>{card.body}</Text>
          {card.note !== undefined ? (
            <Text style={[typography.body, { color: colors.textMuted }]}>{card.note}</Text>
          ) : null}
        </Card>
        <Text style={[typography.caption, styles.center, { color: colors.textMuted }]}>
          {stepText}
        </Text>
      </View>

      <View style={styles.actions}>
        {last ? (
          <>
            <Button label="Add past periods" onPress={() => onFinish(true)} />
            <Button variant="quiet" label="Not now" onPress={() => onFinish(false)} />
          </>
        ) : (
          <>
            <Button label="Next" onPress={() => setIndex(index + 1)} />
            {index > 0 ? (
              <Button variant="quiet" label="Back" onPress={() => setIndex(index - 1)} />
            ) : (
              <Button
                variant="quiet"
                label="Skip"
                accessibilityLabel="Skip the introduction"
                onPress={() => onFinish(false)}
              />
            )}
          </>
        )}
      </View>
    </View>
  );
}

const DOT = spacing.sm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  blob: {
    top: -spacing.xxxl * 2,
    left: -spacing.xxxl * 2,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
  dotActive: {
    width: DOT * 3,
  },
  card: {
    gap: spacing.lg,
    padding: spacing.xl,
  },
  center: {
    textAlign: 'center',
  },
  actions: {
    gap: spacing.sm,
  },
});
