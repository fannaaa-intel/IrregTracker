import { Linking, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { MEDS_NOTE, NOT_CONTRACEPTION } from '@/features/fertility/copy';
import { spacing, typography, useThemeColors } from '@/theme';

import { useCycleReminderSettings } from '../cycle-hooks';
import { NEUTRAL_BODY } from '../cycle-logic';

type ToggleProps = {
  title: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
  heading?: boolean;
};

function ToggleRow({ title, hint, value, onChange, heading = false }: ToggleProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text
          accessibilityRole={heading ? 'header' : undefined}
          style={[heading ? typography.heading : typography.label, { color: colors.text }]}
        >
          {title}
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        accessibilityLabel={title}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

/** Settings → Reminders (period heads-up, start check, late check-ins, fertile days) and Fertile days. */
export function CycleSettingsCards() {
  const colors = useThemeColors();
  const { settings, fertileOn, blocked, setEnabled, setDetails, setFertileOn } =
    useCycleReminderSettings();
  if (settings === undefined || fertileOn === undefined) return null;

  return (
    <>
      <Card>
        <ToggleRow
          heading
          title="Reminders"
          hint="Before your likely period, when it may have started, if it's late, and before possible fertile days"
          value={settings.enabled}
          onChange={(on) => void setEnabled(on)}
        />
        {settings.enabled ? (
          <>
            <ToggleRow
              title="Show details on the lock screen"
              hint={
                settings.details
                  ? 'Reminders say what they are about.'
                  : `Off: every reminder just says "${NEUTRAL_BODY}"`
              }
              value={settings.details}
              onChange={(on) => void setDetails(on)}
            />
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Made on this phone from your own logs. Nothing is sent anywhere.
            </Text>
          </>
        ) : null}
        {blocked ? (
          <View style={styles.section}>
            <Text style={[typography.body, { color: colors.notice }]}>
              Notifications are turned off for this app. You can allow them in your phone&apos;s
              settings.
            </Text>
            <Button
              variant="quiet"
              label="Open phone settings"
              onPress={() => void Linking.openSettings()}
            />
          </View>
        ) : null}
      </Card>

      <Card>
        <ToggleRow
          heading
          title="Fertile days"
          hint="Show possible fertile days and likely ovulation on Home and the calendar"
          value={fertileOn}
          onChange={(on) => void setFertileOn(on)}
        />
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          Worked out from your own past cycles, so it&apos;s an estimate, and only shown when your
          cycles are fairly regular. {NOT_CONTRACEPTION} {MEDS_NOTE}
        </Text>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: spacing.sm,
  },
});
