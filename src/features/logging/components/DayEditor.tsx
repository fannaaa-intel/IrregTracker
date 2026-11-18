import { Droplet, FlaskConical, Heart, NotebookPen, Sparkles, X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { OvulationTestPicker } from '@/features/fertility/components/OvulationTestPicker';
import type { TestResult } from '@/features/fertility/tests';
import { IntimacyPicker } from '@/features/intimacy/components/IntimacyPicker';
import type { Protection } from '@/features/intimacy/logic';
import { NoteField } from '@/features/notes/components/NoteField';
import { SymptomPicker } from '@/features/symptoms/components/SymptomPicker';
import type { Symptom } from '@/features/symptoms/logic';
import { format, type LocalDate } from '@/lib/date';
import { spacing, typography, useThemeColors, type Flow } from '@/theme';

import { DayContextNote } from './DayContextNote';
import { EditorSection } from './EditorSection';
import { FlowPicker } from './FlowPicker';
import { SavedNote } from './SavedNote';

type Props = {
  date: LocalDate;
  /** The flow already logged that day, or null. */
  flow: Flow | null;
  onSelect: (flow: Flow) => void;
  onClear: () => void;
  onClose: () => void;
  symptoms?: readonly Symptom[];
  onToggleSymptom?: (symptom: Symptom) => void;
  protection?: Protection | null;
  onSetProtection?: (protection: Protection) => void;
  onClearProtection?: () => void;
  saferSexNotes?: readonly string[];
  /** Goes up after every save, to show a short "Saved". */
  savedVersion?: number;
  /** The day's note ('' when none); undefined hides the section. */
  note?: string;
  onSaveNote?: (text: string) => void;
  /** What the calendar's estimates say about this day (dayContext). */
  context?: readonly string[];
  /** Optional ovulation (LH) test result; undefined hides the section. */
  ovulationTest?: TestResult | null;
  onSetTest?: (result: TestResult) => void;
  onClearTest?: () => void;
};

const noop = () => undefined;

/** Day editor body (PLAN.md §7): every tap saves at once; Done closes. */
export function DayEditor({
  date,
  flow,
  onSelect,
  onClear,
  onClose,
  symptoms = [],
  onToggleSymptom = noop,
  protection = null,
  onSetProtection = noop,
  onClearProtection = noop,
  saferSexNotes = [],
  savedVersion = 0,
  note,
  onSaveNote = noop,
  context = [],
  ovulationTest,
  onSetTest = noop,
  onClearTest = noop,
}: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={[typography.title, styles.title, { color: colors.text }]}
        >
          {format(date, { month: 'long', withWeekday: true })}
        </Text>
        <View style={styles.headerEnd}>
          <SavedNote version={savedVersion} />
          <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
        </View>
      </View>
      <DayContextNote lines={context} />

      <EditorSection
        title="Flow"
        hint={flow === null ? 'Tap a flow to log this day.' : 'Tap another flow to change it.'}
        icon={Droplet}
      >
        <FlowPicker value={flow} onChange={onSelect} />
        {flow !== null ? (
          <View style={styles.clear}>
            <Button variant="quiet" label="Not a period day" onPress={onClear} />
          </View>
        ) : null}
      </EditorSection>

      <EditorSection
        title="How you feel"
        hint="Tap anything you noticed today. Tap again to remove it."
        icon={Sparkles}
      >
        <SymptomPicker value={symptoms} onToggle={onToggleSymptom} />
      </EditorSection>

      <EditorSection
        title="Sex"
        hint="Only you can see this. It stays encrypted on this phone."
        icon={Heart}
        filled
      >
        <IntimacyPicker
          value={protection}
          onChange={onSetProtection}
          onClear={onClearProtection}
          notes={saferSexNotes}
        />
      </EditorSection>

      {note !== undefined ? (
        <EditorSection
          title="Note"
          hint="A few words for future you, or for a doctor. Saved as you type."
          icon={NotebookPen}
        >
          <NoteField initial={note} onSave={onSaveNote} />
        </EditorSection>
      ) : null}

      {ovulationTest !== undefined ? (
        <EditorSection
          title="Ovulation test (optional)"
          hint="Only if you use ovulation (LH) test strips. A positive test helps the app estimate this cycle."
          icon={FlaskConical}
        >
          <OvulationTestPicker value={ovulationTest} onChange={onSetTest} onClear={onClearTest} />
        </EditorSection>
      ) : null}

      <Button label="Done" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  clear: {
    alignItems: 'flex-start',
  },
});
