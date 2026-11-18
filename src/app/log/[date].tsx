import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { useCycleOverview, useFertileDaysOn } from '@/features/cycles/hooks';
import { useDayIntimacy } from '@/features/intimacy/hooks';
import { saferSexNotes } from '@/features/intimacy/logic';
import { DayEditor } from '@/features/logging/components/DayEditor';
import { useDayFlow, useLogging } from '@/features/logging/hooks';
import { useDaySymptoms } from '@/features/symptoms/hooks';
import { diffDays, isLocalDate, todayLocal } from '@/lib/date';
import { spacing, useThemeColors } from '@/theme';

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
  const symptoms = useDaySymptoms(date);
  const intimacy = useDayIntimacy(date);
  const overview = useCycleOverview(todayLocal());
  const fertileOn = useFertileDaysOn() === true;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/calendar'));
  const protection = intimacy.protection;
  const fertile = fertileOn ? (overview?.fertile?.fertile ?? null) : null;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {flow === undefined || symptoms.symptoms === undefined || protection === undefined ? null : (
        <DayEditor
          date={date}
          flow={flow}
          onSelect={(next) => void setFlow(date, next)}
          onClear={() => void clearDay(date)}
          onClose={close}
          symptoms={symptoms.symptoms}
          onToggleSymptom={(symptom) => void symptoms.toggle(symptom)}
          protection={protection}
          onSetProtection={(next) => void intimacy.set(next)}
          onClearProtection={() => void intimacy.clear()}
          saferSexNotes={protection === null ? [] : saferSexNotes(date, protection, fertile)}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
