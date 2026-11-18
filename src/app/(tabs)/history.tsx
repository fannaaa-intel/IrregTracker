import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { CycleBarChart } from '@/features/cycles/components/CycleBarChart';
import { CycleRow } from '@/features/cycles/components/CycleRow';
import { StatsRow } from '@/features/cycles/components/StatsRow';
import { useCycleOverview } from '@/features/cycles/hooks';
import { countedCycles } from '@/features/cycles/logic';
import { todayLocal } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

export default function HistoryScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const overview = useCycleOverview(todayLocal());

  const openCycle = (start: string) =>
    router.push({ pathname: '/cycle/[id]', params: { id: start } });

  let body = null;
  if (overview !== undefined) {
    const { history, tags, summary, day } = overview;
    const tagByStart = new Map(tags.map((tag) => [tag.cycleStart, tag.reason]));
    const counted = new Set(countedCycles(history.closed, tags).map((cycle) => cycle.start));
    const notCounted = new Set(
      history.closed.filter((cycle) => !counted.has(cycle.start)).map((cycle) => cycle.start),
    );

    body =
      history.closed.length === 0 ? (
        <Card>
          <Text style={[typography.heading, { color: colors.text }]}>No cycles yet</Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Your history appears once two periods are logged. Add past periods from the calendar to
            get started.
          </Text>
        </Card>
      ) : (
        <>
          {summary !== null ? <StatsRow summary={summary} /> : null}
          <Card>
            <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
              Cycle lengths
            </Text>
            <CycleBarChart
              cycles={history.closed}
              notCounted={notCounted}
              typical={summary?.typical ?? null}
            />
          </Card>
          <View>
            <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
              Cycles
            </Text>
            {history.open !== null ? (
              <CycleRow
                start={history.open.start}
                length={null}
                day={day}
                periodLength={history.open.period.length}
                tag={tagByStart.get(history.open.start) ?? null}
                needsConfirmation={false}
                onPress={() => openCycle(history.open!.start)}
              />
            ) : null}
            {history.closed.map((cycle) => (
              <CycleRow
                key={cycle.start}
                start={cycle.start}
                length={cycle.length}
                day={null}
                periodLength={cycle.period.length}
                tag={tagByStart.get(cycle.start) ?? null}
                needsConfirmation={cycle.needsConfirmation}
                onPress={() => openCycle(cycle.start)}
              />
            ))}
          </View>
        </>
      );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
          History
        </Text>
        {body}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
});
