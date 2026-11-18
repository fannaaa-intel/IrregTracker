import { useRef, useState, type ComponentRef, type ComponentType } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Blob } from '@/components/Blob';
import { Button } from '@/components/Button';
import { radius, spacing, typography, useReduceMotion, useThemeColors } from '@/theme';

import { ONBOARDING_CARDS, type OnboardingCard } from '../logic';
import { CalendarIllustration, CycleIllustration, PrivacyIllustration } from './Illustrations';

type Props = {
  /** `backfill` = she chose to add past periods now. */
  onFinish: (backfill: boolean) => void;
};

const ILLUSTRATION: Record<
  OnboardingCard['key'],
  ComponentType<{ active: boolean; reduceMotion: boolean }>
> = {
  welcome: CycleIllustration,
  privacy: PrivacyIllustration,
  backfill: CalendarIllustration,
};

const DOT = 8;

/**
 * PLAN.md §7 welcome: three swipeable cards (or Next / Back). Pictures drift with the swipe,
 * text cross-fades, dots follow the finger, and each picture plays a short entrance.
 */
export function Onboarding({ onFinish }: Props) {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion() === true;
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [scrollX] = useState(() => new Animated.Value(0));
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const last = index === ONBOARDING_CARDS.length - 1;
  const stepText = `Step ${index + 1} of ${ONBOARDING_CARDS.length}`;

  const goTo = (i: number) => {
    setIndex(i);
    scroller.current?.scrollTo({ x: i * width, animated: !reduceMotion });
  };
  const onSettled = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const around = (i: number) => [(i - 1) * width, i * width, (i + 1) * width];
  const span = Math.max(1, (ONBOARDING_CARDS.length - 1) * width);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.blob,
          {
            transform: [
              {
                translateX: scrollX.interpolate({
                  inputRange: [0, span],
                  outputRange: [0, -spacing.xxxl * 2],
                  extrapolate: 'clamp',
                }),
              },
            ],
          },
        ]}
      >
        <Blob size={320} />
      </Animated.View>

      <Animated.ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
        })}
        onMomentumScrollEnd={onSettled}
        style={styles.pager}
      >
        {ONBOARDING_CARDS.map((card, i) => {
          const Picture = ILLUSTRATION[card.key];
          const range = around(i);
          const drift = scrollX.interpolate({
            inputRange: range,
            outputRange: reduceMotion ? [0, 0, 0] : [width * 0.3, 0, -width * 0.3],
            extrapolate: 'clamp',
          });
          const fade = scrollX.interpolate({
            inputRange: range,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });
          const current = i === index;
          return (
            <View
              key={card.key}
              style={[styles.page, { width }]}
              importantForAccessibility={current ? 'auto' : 'no-hide-descendants'}
              accessibilityElementsHidden={!current}
            >
              <Animated.View style={[styles.picture, { transform: [{ translateX: drift }] }]}>
                <Picture active={current} reduceMotion={reduceMotion} />
              </Animated.View>
              <Animated.View style={[styles.text, { opacity: fade }]}>
                <Text
                  accessibilityRole="header"
                  style={[typography.title, styles.center, { color: colors.text }]}
                >
                  {card.title}
                </Text>
                <Text style={[typography.body, styles.center, { color: colors.text }]}>
                  {card.body}
                </Text>
                {card.note !== undefined ? (
                  <Text style={[typography.body, styles.center, { color: colors.textMuted }]}>
                    {card.note}
                  </Text>
                ) : null}
              </Animated.View>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View accessible accessibilityLabel={stepText} style={styles.dots}>
        {ONBOARDING_CARDS.map((card, i) => {
          const range = around(i);
          return (
            <Animated.View
              key={card.key}
              style={[
                styles.dot,
                {
                  backgroundColor: colors.petal,
                  opacity: scrollX.interpolate({
                    inputRange: range,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                  }),
                  transform: [
                    {
                      scale: scrollX.interpolate({
                        inputRange: range,
                        outputRange: [1, 1.5, 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.actions}>
        {last ? (
          <>
            <Button label="Add past periods" onPress={() => onFinish(true)} />
            <Button variant="quiet" label="Not now" onPress={() => onFinish(false)} />
          </>
        ) : (
          <>
            <Button label="Next" onPress={() => goTo(index + 1)} />
            {index > 0 ? (
              <Button variant="quiet" label="Back" onPress={() => goTo(index - 1)} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.lg,
  },
  blob: {
    position: 'absolute',
    top: -spacing.xxxl * 2,
    left: -spacing.xxxl * 1.5,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xl,
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
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.pill,
  },
  actions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
