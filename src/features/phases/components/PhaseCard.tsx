import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { PHASES, phaseName, phaseShort, phaseText, type PhaseInfo } from '../logic';

const BAR = spacing.sm; // 8

/**
 * Home: the four phases as soft segments with today's highlighted, and what it means in plain
 * words. Says "estimate" for anything but logged period days, and "unclear" when it can't know.
 */
export function PhaseCard({ info }: { info: PhaseInfo }) {
  const colors = useThemeColors();
  const title = `${phaseName[info.phase]}${info.estimated && info.phase !== 'unknown' ? ' (estimate)' : ''}`;
  const spoken =
    info.phase === 'unknown'
      ? 'Cycle phase unclear.'
      : `Cycle phase: ${phaseName[info.phase]}${info.estimated ? ', an estimate' : ''}.`;

  return (
    <Card>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Where you are in your cycle
      </Text>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
        {title}
      </Text>

      <View style={styles.track} accessible accessibilityLabel={spoken}>
        {PHASES.map((phase) => {
          const current = phase === info.phase;
          const fill = current
            ? phase === 'ovulation'
              ? colors.calm
              : colors.petal
            : colors.surfaceTint;
          return (
            <View key={phase} style={styles.segment}>
              <View style={[styles.bar, { backgroundColor: fill }]} />
              <Text
                numberOfLines={1}
                style={[
                  typography.caption,
                  styles.label,
                  { color: current ? colors.text : colors.textMuted },
                  current ? styles.current : null,
                ]}
              >
                {phaseShort[phase]}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[typography.body, { color: colors.textMuted }]}>{phaseText[info.phase]}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    gap: spacing.xs,
  },
  bar: {
    height: BAR,
    borderRadius: radius.pill,
  },
  label: {
    textAlign: 'center',
  },
  current: {
    fontFamily: typography.label.fontFamily,
  },
});
