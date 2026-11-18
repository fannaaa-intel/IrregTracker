import {
  CalendarClock,
  CircleDot,
  Droplet,
  Flower2,
  Sparkles,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FadeIn } from '@/components/FadeIn';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import type { PhaseHint } from '../logic';

const ICON: Record<PhaseHint['kind'], LucideIcon> = {
  period: Droplet,
  soon: CalendarClock,
  'any-day': CalendarClock,
  late: CalendarClock,
  ovulation: Flower2,
  fertile: Flower2,
  learning: Sparkles,
  cycle: CircleDot,
};

/** A small pill under the ring that changes with the cycle. It eases in whenever it changes. */
export function PhaseChip({ hint }: { hint: PhaseHint }) {
  const colors = useThemeColors();
  const fertile = hint.kind === 'fertile' || hint.kind === 'ovulation';
  const Icon = ICON[hint.kind];
  const fg = fertile ? colors.calm : colors.primaryDeep;

  return (
    <FadeIn key={hint.text} style={styles.wrap}>
      <View
        style={[styles.chip, { backgroundColor: fertile ? colors.fertile : colors.surfaceTint }]}
      >
        <Icon size={spacing.lg} strokeWidth={1.75} color={fg} />
        <Text style={[typography.label, styles.text, { color: fg }]}>{hint.text}</Text>
      </View>
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    maxWidth: '100%',
  },
  text: {
    flexShrink: 1,
  },
});
