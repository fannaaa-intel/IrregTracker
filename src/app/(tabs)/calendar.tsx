import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { BackfillBar } from '@/features/logging/components/BackfillBar';
import { CalendarLegend } from '@/features/logging/components/CalendarLegend';
import { CalendarMonth } from '@/features/logging/components/CalendarMonth';
import { useCalendar } from '@/features/logging/hooks';
import { todayLocal } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

export default function CalendarScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const calendar = useCalendar(todayLocal());
  const backfill = calendar.mode === 'backfill';

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
        ) : null}
        <CalendarMonth
          grid={calendar.grid}
          onDayPress={onDayPress}
          onPrevMonth={calendar.goPrev}
          onNextMonth={calendar.goNext}
          canGoNext={calendar.canGoNext}
        />
        <CalendarLegend />
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
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
});
