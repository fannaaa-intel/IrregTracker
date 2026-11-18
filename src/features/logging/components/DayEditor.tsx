import { X } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
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
};

/** Day editor body (PLAN.md §7): one tap on a flow saves it. */
export function DayEditor({ date, flow, onSelect, onClear, onClose }: Props) {
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
        <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
      </View>

      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text }]}>Flow</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          {flow === null ? 'Tap a flow to log this day.' : 'Tap another flow to change it.'}
        </Text>
        <FlowPicker value={flow} onChange={onSelect} />
      </View>

      {flow !== null ? (
        <View style={styles.clear}>
          <Button variant="quiet" label="Not a period day" onPress={onClear} />
        </View>
      ) : null}
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
  clear: {
    alignItems: 'flex-start',
  },
});
