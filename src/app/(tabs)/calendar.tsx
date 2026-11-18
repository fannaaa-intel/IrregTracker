import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { BackfillBar } from '@/features/logging/components/BackfillBar';
import { CalendarMonth } from '@/features/logging/components/CalendarMonth';
import { LayerChips } from '@/features/logging/components/LayerChips';
import { MonthSwiper } from '@/features/logging/components/MonthSwiper';
import { useCalendar } from '@/features/logging/hooks';
import { MonthReportCard } from '@/features/reports/components/MonthReportCard';
import { todayLocal } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

export default function CalendarScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const calendar = useCalendar(todayLocal());
  const backfill = calendar.mode === 'backfill';
  // Onboarding opens the calendar with ?backfill=1 to start straight in multi-select mode.
  const params = useLocalSearchParams<{ backfill?: string }>();
  const { startBackfill } = calendar;
  useEffect(() => {
    if (params.backfill !== '1') return;
    startBackfill();
    router.setParams({ backfill: undefined });
  }, [params.backfill, startBackfill, router]);

  const onDayPress = (date: string) => {
    if (backfill) calendar.toggleSelected(date);
    else router.push({ pathname: '/log/[date]', params: { date } });
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
            Calendar
          </Text>
          {backfill ? null : (
            <Button variant="quiet" label="Add past periods" onPress={calendar.startBackfill} />
          )}
        </View>
        {backfill ? (
          <Text style={[typography.body, { color: colors.textMuted }]}>
            Tap each day you had your period. You can move between months.
          </Text>
        ) : (
          <LayerChips
            visible={calendar.visible}
            onToggle={calendar.toggleLayer}
            showFertile={calendar.showFertile}
          />
        )}
        <MonthSwiper
          monthKey={calendar.monthKey}
          onPrev={calendar.goPrev}
          onNext={calendar.goNext}
          canGoNext={calendar.canGoNext}
        >
          <CalendarMonth
            grid={calendar.grid}
            onDayPress={onDayPress}
            onPrevMonth={calendar.goPrev}
            onNextMonth={calendar.goNext}
            canGoNext={calendar.canGoNext}
          />
        </MonthSwiper>
        {backfill ? null : (
          <Text style={[typography.caption, styles.hint, { color: colors.textMuted }]}>
            Swipe to change month. Today has a ring. Tap any past day to log your period, how you
            feel, or sex.
          </Text>
        )}
        {!backfill && calendar.report !== null ? (
          <MonthReportCard report={calendar.report} />
        ) : null}
      </ScrollView>
      {backfill ? (
        <BackfillBar
          selectedCount={calendar.selectedCount}
          flow={calendar.backfillFlow}
          onFlowChange={calendar.setBackfillFlow}
          onSave={calendar.saveBackfill}
          onCancel={calendar.cancelBackfill}
        />
      ) : null}
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  hint: {
    textAlign: 'center',
  },
});
