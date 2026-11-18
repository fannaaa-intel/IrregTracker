import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CycleDetail } from '@/features/cycles/components/CycleDetail';
import { useCycleActions, useCycleOverview } from '@/features/cycles/hooks';
import { todayLocal } from '@/lib/date';
import { spacing, useThemeColors } from '@/theme';

/** Cycle detail + tagging (PLAN.md §7). `id` is the cycle's start date. */
export default function CycleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const router = useRouter();
  const overview = useCycleOverview(todayLocal());
  const actions = useCycleActions();

  if (overview === undefined) return null;
  const { history, tags, day } = overview;
  const closed = history.closed.find((cycle) => cycle.start === id);
  const open = history.open?.start === id ? history.open : null;
  // The cycle can disappear if its days were edited; go back to History then.
  if (closed === undefined && open === null) return <Redirect href="/history" />;

  const start = closed?.start ?? open!.start;
  const stored = tags.find((tag) => tag.cycleStart === start);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/history'));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <CycleDetail
          start={start}
          nextStart={closed?.nextStart ?? null}
          length={closed?.length ?? null}
          day={closed === undefined ? day : null}
          period={closed?.period ?? open!.period}
          tag={stored === undefined ? null : { reason: stored.reason, exclude: stored.exclude }}
          needsConfirmation={closed?.needsConfirmation ?? false}
          onBack={back}
          onTagChange={(reason) =>
            reason === null
              ? actions.removeTag(start)
              : actions.setTag(start, reason, stored?.exclude ?? true)
          }
          onExcludeChange={(exclude) => {
            if (stored !== undefined) actions.setTag(start, stored.reason, exclude);
          }}
          onConfirmShort={() => actions.confirmShortCycle(start)}
          onOpenCalendar={() => router.navigate('/calendar')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
