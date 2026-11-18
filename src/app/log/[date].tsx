import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { DayEditor } from '@/features/logging/components/DayEditor';
import { useDayFlow, useLogging } from '@/features/logging/hooks';
import { diffDays, isLocalDate, todayLocal } from '@/lib/date';
import { spacing, useThemeColors, type Flow } from '@/theme';

/** Day editor modal (PLAN.md §7). Opened from the calendar with a 'YYYY-MM-DD' date. */
export default function DayEditorScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const valid = typeof date === 'string' && isLocalDate(date) && diffDays(date, todayLocal()) <= 0;

  // Only past and present days can be logged; anything else goes back to the calendar.
  if (!valid) return <Redirect href="/calendar" />;
  return <DayEditorForDate date={date} />;
}

function DayEditorForDate({ date }: { date: string }) {
  const colors = useThemeColors();
  const router = useRouter();
  const flow = useDayFlow(date);
  const { setFlow, clearDay } = useLogging();

  const close = () => (router.canGoBack() ? router.back() : router.replace('/calendar'));
  const select = async (next: Flow) => {
    await setFlow(date, next);
    close();
  };
  const clear = async () => {
    await clearDay(date);
    close();
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {flow === undefined ? null : (
        <DayEditor date={date} flow={flow} onSelect={select} onClear={clear} onClose={close} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
  },
});
