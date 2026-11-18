import { useRef, useState, type ComponentRef, type ComponentType } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { Blob } from '@/components/Blob';
import { Button } from '@/components/Button';
import { spacing, useReduceMotion } from '@/theme';

import { ONBOARDING_CARDS, type OnboardingCard } from '../logic';
import { useAmbient } from './illustration-motion';
import { CycleIllustration, PrivacyIllustration, type IllustrationProps } from './Illustrations';
import { CalendarIllustration, TrackIllustration } from './MoreIllustrations';
import { OnboardingPage } from './OnboardingPage';
import { PagerDots } from './PagerDots';

type Props = {
  /** `backfill` = she chose to add past periods now. */
  onFinish: (backfill: boolean) => void;
};

const ILLUSTRATION: Record<OnboardingCard['key'], ComponentType<IllustrationProps>> = {
  welcome: CycleIllustration,
  track: TrackIllustration,
  privacy: PrivacyIllustration,
  backfill: CalendarIllustration,
};

/**
 * PLAN.md §7 welcome: swipeable cards (or Next / Back). Two soft blobs drift slowly behind
 * everything, pictures follow the finger and keep a calm movement, text rises in on each card,
 * and a petal pill slides between the dots. Everything stands still with Reduce motion.
 */
export function Onboarding({ onFinish }: Props) {
  const reduceMotion = useReduceMotion() === true;
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [scrollX] = useState(() => new Animated.Value(0));
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const drift = useAmbient(true, reduceMotion, { duration: 9000, mode: 'breathe' });
  const last = index === ONBOARDING_CARDS.length - 1;

  const goTo = (i: number) => {
    setIndex(i);
    scroller.current?.scrollTo({ x: i * width, animated: !reduceMotion });
  };
  const onSettled = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const span = Math.max(1, (ONBOARDING_CARDS.length - 1) * width);
  const parallax = (distance: number) =>
    scrollX.interpolate({
      inputRange: [0, span],
      outputRange: [0, distance],
      extrapolate: 'clamp',
    });
  const sway = (x: number, y: number) => [
    { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: [0, x] }) },
    { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [0, y] }) },
  ];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.blobTop,
          {
            transform: [
              { translateX: parallax(-spacing.xxxl * 2) },
              ...sway(spacing.lg, spacing.md),
            ],
          },
        ]}
      >
        <Blob size={320} />
      </Animated.View>
      <Animated.View
        style={[
          styles.blobBottom,
          {
            transform: [{ translateX: parallax(spacing.xxxl) }, ...sway(-spacing.md, -spacing.lg)],
          },
        ]}
      >
        <Blob size={220} />
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
        {ONBOARDING_CARDS.map((card, i) => (
          <OnboardingPage
            key={card.key}
            card={card}
            Picture={ILLUSTRATION[card.key]}
            active={i === index}
            reduceMotion={reduceMotion}
            width={width}
            drift={scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: reduceMotion ? [0, 0, 0] : [width * 0.3, 0, -width * 0.3],
              extrapolate: 'clamp',
            })}
          />
        ))}
      </Animated.ScrollView>

      <PagerDots
        count={ONBOARDING_CARDS.length}
        scrollX={scrollX}
        width={width}
        label={`Step ${index + 1} of ${ONBOARDING_CARDS.length}`}
      />

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
  blobTop: {
    position: 'absolute',
    top: -spacing.xxxl * 2,
    left: -spacing.xxxl * 1.5,
    width: 320,
    height: 320,
  },
  blobBottom: {
    position: 'absolute',
    bottom: spacing.xxxl * 2,
    right: -spacing.xxxl * 1.5,
    width: 220,
    height: 220,
  },
  pager: {
    flex: 1,
  },
  actions: {
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
});
