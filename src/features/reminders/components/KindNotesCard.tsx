import { StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { formatHour } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import { KIND_NOTE_HOURS } from '../logic';

type Props = {
  enabled: boolean;
  hour: number;
  /** Notifications are blocked in the phone's settings. */
  denied: boolean;
  /** Today's phrase, shown as an example. */
  example: string;
  onToggle: (enabled: boolean) => void;
  onHourChange: (hour: number) => void;
  onOpenPhoneSettings: () => void;
};

/** Settings → Kind notes: one gentle, discreet message a day at a time she picks. */
export function KindNotesCard({
  enabled,
  hour,
  denied,
  example,
  onToggle,
  onHourChange,
  onOpenPhoneSettings,
}: Props) {
  const colors = useThemeColors();

  return (
    <Card>
      <View style={styles.head}>
        <View style={styles.headText}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            Kind notes
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            A short, gentle message once a day
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          accessibilityLabel="Daily kind note"
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.surface}
        />
      </View>

      {enabled ? (
        <View style={styles.section}>
          <Text style={[typography.label, { color: colors.text }]}>Time</Text>
          <View accessibilityRole="radiogroup" style={styles.chips}>
            {KIND_NOTE_HOURS.map((h) => (
              <Chip
                key={h}
                label={formatHour(h)}
                selected={h === hour}
                accessibilityRole="radio"
                onPress={() => onHourChange(h)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {denied ? (
        <View style={styles.section}>
          <Text style={[typography.body, { color: colors.notice }]}>
            Notifications are turned off for this app. You can allow them in your phone&apos;s
            settings.
          </Text>
          <Button variant="quiet" label="Open phone settings" onPress={onOpenPhoneSettings} />
        </View>
      ) : null}

      <Text style={[typography.body, { color: colors.textMuted }]}>&ldquo;{example}&rdquo;</Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Notes never mention your cycle, so they stay private on your lock screen. They&apos;re made
        on this phone. Nothing is sent anywhere.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headText: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
