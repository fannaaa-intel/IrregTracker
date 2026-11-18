import { StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { formatHour } from '@/lib/date';
import { spacing, typography, useThemeColors } from '@/theme';

import { KIND_NOTE_TIMES, type KindNoteTime } from '../logic';

type Props = {
  enabled: boolean;
  time: KindNoteTime;
  /** On, but notifications are blocked in the phone's settings. */
  blocked: boolean;
  /** Today's phrase, shown as an example. */
  example: string;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: KindNoteTime) => void;
  onOpenPhoneSettings: () => void;
};

export function timeLabel(time: KindNoteTime): string {
  return time === 'surprise' ? 'Evening surprise' : formatHour(time);
}

/** Settings → Kind notes: one gentle, discreet message a day. On by default. */
export function KindNotesCard({
  enabled,
  time,
  blocked,
  example,
  onToggle,
  onTimeChange,
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
          <Text style={[typography.label, { color: colors.text }]}>When</Text>
          <View accessibilityRole="radiogroup" style={styles.chips}>
            {KIND_NOTE_TIMES.map((t) => (
              <Chip
                key={String(t)}
                label={timeLabel(t)}
                selected={t === time}
                accessibilityRole="radio"
                onPress={() => onTimeChange(t)}
              />
            ))}
          </View>
          {time === 'surprise' ? (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              A different moment each evening, between 8 PM and midnight.
            </Text>
          ) : null}
        </View>
      ) : null}

      {blocked ? (
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
