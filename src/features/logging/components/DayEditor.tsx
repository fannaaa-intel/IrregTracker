import { Droplet, Heart, Sparkles, X, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { IntimacyPicker } from '@/features/intimacy/components/IntimacyPicker';
import type { Protection } from '@/features/intimacy/logic';
import { SymptomPicker } from '@/features/symptoms/components/SymptomPicker';
import type { Symptom } from '@/features/symptoms/logic';
import { format, type LocalDate } from '@/lib/date';
import { radius, spacing, typography, useThemeColors, type Flow } from '@/theme';

import { FlowPicker } from './FlowPicker';
import { SavedNote } from './SavedNote';

const ICON_BADGE = spacing.xxl; // 32

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
  savedVersion = 0,
}: Props) {
  const colors = useThemeColors();

  // Each part of the day is a soft card with its own icon, so the screen reads in calm blocks.
  const section = (
    title: string,
    hint: string,
    body: ReactNode,
    Icon: LucideIcon,
    fill = false,
  ) => (
    <Card style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceTint }]}>
          <Icon
            size={spacing.lg + 2}
            strokeWidth={1.75}
            color={colors.primary}
            fill={fill ? colors.primary : 'none'}
          />
        </View>
        <View style={styles.headText}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text>
        </View>
      </View>
      {body}
    </Card>
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
        <View style={styles.headerEnd}>
          <SavedNote version={savedVersion} />
          <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
        </View>
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
        Droplet,
      )}

      {section(
        'How you feel',
        'Tap anything you noticed today. Tap again to remove it.',
        <SymptomPicker value={symptoms} onToggle={onToggleSymptom} />,
        Sparkles,
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
        Heart,
        true,
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
  headerEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  section: {
    gap: spacing.lg,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: ICON_BADGE,
    height: ICON_BADGE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  clear: {
    alignItems: 'flex-start',
  },
});
