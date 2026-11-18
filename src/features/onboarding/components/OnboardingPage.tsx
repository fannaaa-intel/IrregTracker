import type { ComponentType } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

import { spacing, typography, useThemeColors } from '@/theme';

import type { OnboardingCard } from '../logic';
import type { IllustrationProps } from './Illustrations';
import { useEntrance } from './illustration-motion';

type Props = {
  card: OnboardingCard;
  Picture: ComponentType<IllustrationProps>;
  active: boolean;
  reduceMotion: boolean;
  width: number;
  /** Sideways drift of the picture while swiping (follows the finger). */
  drift: Animated.AnimatedInterpolation<number>;
};

/** One welcome card: a living picture, then the title, text and note rising in one by one. */
export function OnboardingPage({ card, Picture, active, reduceMotion, width, drift }: Props) {
  const colors = useThemeColors();
  const [title, body, note] = useEntrance(active, reduceMotion, 3);
  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <ScrollView
      style={{ width }}
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
      importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
      accessibilityElementsHidden={!active}
    >
      <Animated.View style={[styles.picture, { transform: [{ translateX: drift }] }]}>
        <Picture active={active} reduceMotion={reduceMotion} />
      </Animated.View>
      <View style={styles.text}>
        <Animated.Text
          accessibilityRole="header"
          style={[typography.title, styles.center, { color: colors.text }, rise(title)]}
        >
          {card.title}
        </Animated.Text>
        <Animated.Text style={[typography.body, styles.center, { color: colors.text }, rise(body)]}>
          {card.body}
        </Animated.Text>
        {card.note !== undefined ? (
          <Animated.Text
            style={[typography.caption, styles.center, { color: colors.textMuted }, rise(note)]}
          >
            {card.note}
          </Animated.Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Centred when it fits; scrolls on small phones or with large text instead of cramping.
  page: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  picture: {
    alignItems: 'center',
  },
  text: {
    gap: spacing.md,
    maxWidth: 420,
  },
  center: {
    textAlign: 'center',
  },
});
