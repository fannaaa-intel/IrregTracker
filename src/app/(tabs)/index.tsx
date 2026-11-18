import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Blob } from '@/components/Blob';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CycleRing } from '@/features/cycles/components/CycleRing';
import { useCycleOverview, useFertileDaysOn } from '@/features/cycles/hooks';
import { ringModel } from '@/features/cycles/summary';
import { FertilityCard } from '@/features/fertility/components/FertilityCard';
import { FlagCard } from '@/features/flags/components/FlagCard';
import { useFlagCard } from '@/features/flags/hooks';
import { useOnboardingState } from '@/features/onboarding/hooks';
import { PredictionCard } from '@/features/prediction/components/PredictionCard';
import { format, todayLocal } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const today = todayLocal();
  const overview = useCycleOverview(today);
  const { flag, dismiss } = useFlagCard(overview, today);
  const onboarding = useOnboardingState();
  const fertileOn = useFertileDaysOn() === true;

  const logToday = () => router.push({ pathname: '/log/[date]', params: { date: today } });
  const open = overview?.history.open ?? null;
  const prediction = overview?.prediction;
  const isLate = prediction?.state === 'window' && prediction.daysLate > 0;
  // Shown with an estimate, or (late) to explain why estimates paused. Hidden while learning.
  const showFertile = fertileOn && (overview?.fertile != null || isLate);
  const ring =
    overview !== undefined && open !== null
      ? ringModel(open, overview.prediction, today, overview.summary?.typical ?? null)
      : null;

  if (onboarding === 'loading') return null;
  if (onboarding === 'needed') return <Redirect href="/onboarding" />;

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <Blob size={260} style={styles.blob} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {format(today, { month: 'long', withWeekday: true })}
          </Text>
          <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
            Your cycle
          </Text>
        </View>

        {overview === undefined ? null : open === null ? (
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
        ) : (
          <>
            {ring !== null ? <CycleRing model={ring} /> : null}
            <PredictionCard
              prediction={overview.prediction}
              onLogMissedStart={() => router.navigate('/calendar')}
            />
            <Button label="Log today" onPress={logToday} />
            {showFertile ? <FertilityCard estimate={overview.fertile} /> : null}
            {flag !== null ? (
              <FlagCard
                flag={flag}
                onWhy={() => router.push({ pathname: '/flag/[type]', params: { type: flag.type } })}
                onDismiss={() => void dismiss(flag.id)}
              />
            ) : null}
          </>
        )}
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
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.xs,
  },
});
