import { ChevronLeft, Leaf } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { spacing, typography, useThemeColors } from '@/theme';

import { FLAG_DISCLAIMER, flagExplanation } from '../copy';
import type { FlagType } from '../logic';

type Props = {
  type: FlagType;
  onBack: () => void;
};

/** "Why am I seeing this?": what the note looked at, common context, and when a doctor can help. */
export function FlagExplanation({ type, onBack }: Props) {
  const colors = useThemeColors();
  const { title, why, context, next } = flagExplanation[type];

  const section = (heading: string, body: string) => (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
        {heading}
      </Text>
      <Text style={[typography.body, { color: colors.text }]}>{body}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <IconButton icon={ChevronLeft} accessibilityLabel="Back" onPress={onBack} />
      </View>
      <View style={styles.titleRow}>
        <Leaf size={22} strokeWidth={1.5} color={colors.notice} />
        <Text
          accessibilityRole="header"
          style={[typography.title, styles.title, { color: colors.text }]}
        >
          {title}
        </Text>
      </View>
      <Card>
        {section('Why this note appeared', why)}
        {section('Good to know', context)}
        {section('When to talk to a doctor', next)}
      </Card>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{FLAG_DISCLAIMER}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  top: {
    marginLeft: -spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  section: {
    gap: spacing.xs,
  },
});
