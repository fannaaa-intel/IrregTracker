import { ChevronRight, Tag } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { format } from '@/lib/date';
import { spacing, touchTarget, typography, useThemeColors } from '@/theme';

import { tagLabel, type TagReason } from '../tags';

type Props = {
  start: string;
  /** Closed cycles have a length; the current cycle has a day number instead. */
  length: number | null;
  day: number | null;
  periodLength: number;
  tag: TagReason | null;
  needsConfirmation: boolean;
  onPress: () => void;
};

export function CycleRow({
  start,
  length,
  day,
  periodLength,
  tag,
  needsConfirmation,
  onPress,
}: Props) {
  const colors = useThemeColors();
  const title = length === null ? 'Current cycle' : `${length} days`;
  const detail = [
    `Started ${format(start, { withYear: true })}`,
    length === null && day !== null ? `day ${day}` : null,
    `period ${periodLength} ${periodLength === 1 ? 'day' : 'days'}`,
  ]
    .filter(Boolean)
    .join(' · ');
  const spoken = [
    title,
    detail,
    tag === null ? null : `tagged ${tagLabel[tag]}`,
    needsConfirmation ? 'needs a check' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityHint="Opens cycle details"
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={styles.text}>
        <Text style={[typography.heading, styles.number, { color: colors.text }]}>{title}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{detail}</Text>
        {needsConfirmation ? (
          <Text style={[typography.caption, { color: colors.notice }]}>
            Very short. Tap to check it.
          </Text>
        ) : null}
      </View>
      {tag !== null ? (
        <View style={styles.tag}>
          <Tag size={14} strokeWidth={1.5} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>{tagLabel[tag]}</Text>
        </View>
      ) : null}
      <ChevronRight size={20} strokeWidth={1.5} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget + spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  number: {
    fontVariant: ['tabular-nums'],
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
