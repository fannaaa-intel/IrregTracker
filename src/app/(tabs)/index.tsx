import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DriftBlob } from '@/components/DriftBlob';
import { FadeIn } from '@/components/FadeIn';
import { Flower } from '@/components/Ornaments';
import { PetalDots } from '@/components/PetalDots';
import { CycleRing } from '@/features/cycles/components/CycleRing';
import { useCycleOverview, useFertileDaysOn } from '@/features/cycles/hooks';
import { ringModel } from '@/features/cycles/summary';
import { FertilityCard } from '@/features/fertility/components/FertilityCard';
import { FlagCard } from '@/features/flags/components/FlagCard';
import { useFlagCard } from '@/features/flags/hooks';
import { NoteCard } from '@/features/home/components/NoteCard';
import { PhaseChip } from '@/features/home/components/PhaseChip';
import { TodayCard } from '@/features/home/components/TodayCard';
import { useTodayLog } from '@/features/home/hooks';
import { greetingFor, phaseHint } from '@/features/home/logic';
import { useOnboardingState } from '@/features/onboarding/hooks';
import { PredictionCard } from '@/features/prediction/components/PredictionCard';
import { phraseForDay } from '@/features/reminders/logic';
import { format, localHour, todayLocal } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const today = todayLocal();
  const overview = useCycleOverview(today);
  const { flag, dismiss } = useFlagCard(overview, today);
  const onboarding = useOnboardingState();
  const fertileOn = useFertileDaysOn() === true;
  const todayLog = useTodayLog(today);

  const logToday = () => router.push({ pathname: '/log/[date]', params: { date: today } });
  const open = overview?.history.open ?? null;
  const prediction = overview?.prediction;
  const isLate = prediction?.state === 'window' && prediction.daysLate > 0;
  // Shown with an estimate, or (late) to explain why estimates paused. Hidden while learning.
  const showFertile = fertileOn && (overview?.fertile != null || isLate);
  const hint =
    overview === undefined
      ? null
      : phaseHint({
          today,
          prediction: overview.prediction,
          open,
          fertile: fertileOn ? overview.fertile : null,
        });
  const ring =
    overview !== undefined && open !== null
      ? ringModel(open, overview.prediction, today, overview.summary?.typical ?? null)
      : null;

  if (onboarding === 'loading') return null;
  if (onboarding === 'needed') return <Redirect href="/onboarding" />;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <DriftBlob size={260} style={styles.blob} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeIn style={styles.header}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {format(today, { month: 'long', withWeekday: true })}
          </Text>
          <View style={styles.titleRow}>
            <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
              {greetingFor(localHour())}
            </Text>
            <Flower size={spacing.xl} color={colors.blush} centerColor={colors.petal} />
          </View>
        </FadeIn>

        {overview === undefined ? null : open === null ? (
          <FadeIn index={1}>
            <Card>
              <Text style={[typography.heading, { color: colors.text }]}>Nothing logged yet</Text>
              <Text style={[typography.body, { color: colors.textMuted }]}>
                Log today, or add your last few periods so predictions can start sooner.
              </Text>
              <Button label="Log today" onPress={logToday} />
              <Button
                variant="quiet"
                label="Add past periods"
                onPress={() => router.navigate('/calendar')}
              />
            </Card>
          </FadeIn>
        ) : (
          <>
            {ring !== null ? (
              <FadeIn index={1} style={styles.ringBlock}>
                <CycleRing model={ring} />
                {hint !== null ? <PhaseChip hint={hint} /> : null}
              </FadeIn>
            ) : null}
            <FadeIn index={2}>
              <PredictionCard
                prediction={overview.prediction}
                onLogMissedStart={() => router.navigate('/calendar')}
              />
            </FadeIn>
            {todayLog !== undefined ? (
              <FadeIn index={3}>
                <TodayCard log={todayLog} onLog={logToday} />
              </FadeIn>
            ) : null}
            {showFertile ? (
              <FadeIn index={4}>
                <FertilityCard estimate={overview.fertile} />
              </FadeIn>
            ) : null}
            {flag !== null ? (
              <FadeIn index={5}>
                <FlagCard
                  flag={flag}
                  onWhy={() =>
                    router.push({ pathname: '/flag/[type]', params: { type: flag.type } })
                  }
                  onDismiss={() => void dismiss(flag.id)}
                />
              </FadeIn>
            ) : null}
          </>
        )}
        <FadeIn index={6}>
          <NoteCard phrase={phraseForDay(today)} />
        </FadeIn>
        <PetalDots />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  blob: {
    top: -spacing.xxxl * 1.5,
    right: -spacing.xxxl * 1.5,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ringBlock: {
    gap: spacing.lg,
  },
});
