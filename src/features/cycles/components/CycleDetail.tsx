import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { addDays, format } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import type { Period } from '../logic';
import type { TagReason } from '../tags';
import { TagPicker } from './TagPicker';

export type CycleDetailProps = {
  start: string;
  /** Null for the current (open) cycle. */
  nextStart: string | null;
  length: number | null;
  day: number | null;
  period: Period;
  tag: { reason: TagReason; exclude: boolean } | null;
  needsConfirmation: boolean;
  onBack: () => void;
  onTagChange: (reason: TagReason | null) => void;
  onExcludeChange: (exclude: boolean) => void;
  onConfirmShort: () => void;
  onOpenCalendar: () => void;
};

export function CycleDetail(props: CycleDetailProps) {
  const { start, nextStart, length, day, period, tag, needsConfirmation } = props;
  const colors = useThemeColors();
  const body = [typography.body, { color: colors.textMuted }];
  const range =
    nextStart === null
      ? `${format(start, { withYear: true })} – today`
      : `${format(start, { withYear: true })} – ${format(addDays(nextStart, -1), { withYear: true })}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={props.onBack} />
        <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
          {length === null ? 'Current cycle' : `${length}-day cycle`}
        </Text>
      </View>

      <Card>
        <Text style={[typography.body, { color: colors.text }]}>{range}</Text>
        <Text style={body}>
          {length === null ? `Day ${day ?? 1} so far` : `Cycle length: ${length} days`}
        </Text>
        <Text style={body}>
          Period: {period.length} {period.length === 1 ? 'day' : 'days'} ({format(period.start)} –{' '}
          {format(period.end)})
        </Text>
      </Card>

      {needsConfirmation ? (
        <View style={[styles.notice, { backgroundColor: colors.noticeBg }]}>
          <Text style={[typography.heading, { color: colors.notice }]}>Is this right?</Text>
          <Text style={[typography.body, { color: colors.notice }]}>
            This cycle is only {length} days. Very short cycles are often a logging slip, so it
            isn&apos;t counted yet.
          </Text>
          <View style={styles.actions}>
            <Button label="Yes, it's right" onPress={props.onConfirmShort} />
            <Button variant="quiet" label="Check the calendar" onPress={props.onOpenCalendar} />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text }]}>Tag this cycle</Text>
        <Text style={body}>Something that may have changed its timing.</Text>
        <TagPicker value={tag?.reason ?? null} onChange={props.onTagChange} />
      </View>

      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={[typography.body, { color: colors.text }]}>Leave out of predictions</Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {tag === null ? 'Pick a tag first.' : 'Your stats and likely window ignore this cycle.'}
          </Text>
        </View>
        <Switch
          accessibilityLabel="Leave out of predictions"
          value={tag?.exclude ?? false}
          disabled={tag === null}
          onValueChange={props.onExcludeChange}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.surface}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: -spacing.md,
  },
  notice: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: spacing.xl,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  section: {
    gap: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  switchText: {
    flex: 1,
    gap: 2,
  },
});
