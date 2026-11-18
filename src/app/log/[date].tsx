import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useCycleOverview, useFertileDaysOn } from '@/features/cycles/hooks';
import { useDayOvulationTest } from '@/features/fertility/hooks';
import { useDayIntimacy } from '@/features/intimacy/hooks';
import { saferSexNotes } from '@/features/intimacy/logic';
import { DayEditor } from '@/features/logging/components/DayEditor';
import { dayContext } from '@/features/logging/logic';
import { useDayNote } from '@/features/notes/hooks';
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
  const dayNote = useDayNote(date);
  const test = useDayOvulationTest(date);
  const overview = useCycleOverview(todayLocal());
  const fertileOn = useFertileDaysOn() === true;

  const [savedVersion, setSavedVersion] = useState(0);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/calendar'));
  // Every change saves at once; a short "Saved" confirms it.
  const save = (task: Promise<void>) => {
    task.then(
      () => setSavedVersion((v) => v + 1),
      () => console.warn('A day could not be saved.'),
    );
  };
  const protection = intimacy.protection;
  const estimate = fertileOn ? (overview?.fertile ?? null) : null;
  const fertile = estimate?.fertile ?? null;
  const prediction = overview?.prediction;
  const context = dayContext(date, {
    window: prediction?.state === 'window' ? prediction.window : null,
    fertile: estimate,
  });

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {flow === undefined ||
      symptoms.symptoms === undefined ||
      protection === undefined ||
      dayNote.note === undefined ||
      test.result === undefined ? null : (
        <DayEditor
          date={date}
          flow={flow}
          onSelect={(next) => save(setFlow(date, next))}
          onClear={() => save(clearDay(date))}
          onClose={close}
          symptoms={symptoms.symptoms}
          onToggleSymptom={(symptom) => save(symptoms.toggle(symptom))}
          protection={protection}
          onSetProtection={(next) => save(intimacy.set(next))}
          onClearProtection={() => save(intimacy.clear())}
          saferSexNotes={protection === null ? [] : saferSexNotes(date, protection, fertile)}
          savedVersion={savedVersion}
          note={dayNote.note}
          onSaveNote={(text) => save(dayNote.save(text))}
          context={context}
          ovulationTest={test.result}
          onSetTest={(result) => save(test.set(result))}
          onClearTest={() => save(test.clear())}
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
