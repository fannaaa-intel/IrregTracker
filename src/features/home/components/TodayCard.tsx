import { Droplet, Heart, Sparkles, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { todayLines, type TodayLog } from '../logic';

const ICON = spacing.lg; // 16
const BADGE = spacing.xxl; // 32

type Props = {
  log: TodayLog;
  onLog: () => void;
};

/** Home: what's logged today at a glance, and one button to log or edit it. */
export function TodayCard({ log, onLog }: Props) {
  const colors = useThemeColors();
  const lines = todayLines(log);
  const icons: { Icon: LucideIcon; on: boolean; label: string }[] = [
    { Icon: Droplet, on: log.flow !== null, label: 'Flow' },
    { Icon: Sparkles, on: log.symptoms.length > 0, label: 'Symptoms' },
    { Icon: Heart, on: log.protection !== null, label: 'Sex' },
  ];

  return (
    <Card>
      <View style={styles.head}>
        <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
          Today
        </Text>
        <View style={styles.badges} accessibilityElementsHidden>
          {icons.map(({ Icon, on, label }) => (
            <View
              key={label}
              style={[
                styles.badge,
                {
                  backgroundColor: on ? colors.surfaceTint : 'transparent',
                  borderColor: colors.border,
                },
              ]}
            >
              <Icon
                size={ICON}
                strokeWidth={1.5}
                color={on ? colors.primary : colors.textMuted}
                fill={on && Icon !== Sparkles ? colors.primary : 'none'}
              />
            </View>
          ))}
        </View>
      </View>

      {lines.length === 0 ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>
          Nothing logged yet. Add your flow, how you feel, or sex in one place.
        </Text>
      ) : (
        <View style={styles.lines}>
          {lines.map((line) => (
            <Text key={line} style={[typography.body, { color: colors.text }]}>
              {line}
            </Text>
          ))}
        </View>
      )}

      <Button label={lines.length === 0 ? 'Log today' : 'Edit today'} onPress={onLog} />
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lines: {
    gap: spacing.xs,
  },
});
