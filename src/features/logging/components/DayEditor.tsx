import { Heart, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { IntimacyPicker } from '@/features/intimacy/components/IntimacyPicker';
import type { Protection } from '@/features/intimacy/logic';
import { SymptomPicker } from '@/features/symptoms/components/SymptomPicker';
import type { Symptom } from '@/features/symptoms/logic';
import { format, type LocalDate } from '@/lib/date';
import { spacing, typography, useThemeColors, type Flow } from '@/theme';

import { FlowPicker } from './FlowPicker';

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
};

/** Day editor body (PLAN.md §7): every tap saves at once; Done closes. */
export function DayEditor({
  date,
  flow,
  onSelect,
  onClear,
  onClose,
  symptoms = [],
  onToggleSymptom = () => undefined,
  protection = null,
  onSetProtection = () => undefined,
  onClearProtection = () => undefined,
  saferSexNotes = [],
}: Props) {
  const colors = useThemeColors();

  const section = (title: string, hint: string, body: ReactNode, icon?: ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        {icon}
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      <Text style={[typography.body, { color: colors.textMuted }]}>{hint}</Text>
      {body}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={[typography.title, styles.title, { color: colors.text }]}
        >
          {format(date, { month: 'long', withWeekday: true })}
        </Text>
        <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
      </View>

      {section(
        'Flow',
        flow === null ? 'Tap a flow to log this day.' : 'Tap another flow to change it.',
        <>
          <FlowPicker value={flow} onChange={onSelect} />
          {flow !== null ? (
            <View style={styles.clear}>
              <Button variant="quiet" label="Not a period day" onPress={onClear} />
            </View>
          ) : null}
        </>,
      )}

      {section(
        'How you feel',
        'Tap anything you noticed today. Tap again to remove it.',
        <SymptomPicker value={symptoms} onToggle={onToggleSymptom} />,
      )}

      {section(
        'Sex',
        'Only you can see this. It stays encrypted on this phone.',
        <IntimacyPicker
          value={protection}
          onChange={onSetProtection}
          onClear={onClearProtection}
          notes={saferSexNotes}
        />,
        <Heart size={18} strokeWidth={1.5} color={colors.primary} fill={colors.primary} />,
      )}

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
  title: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clear: {
    alignItems: 'flex-start',
  },
});
