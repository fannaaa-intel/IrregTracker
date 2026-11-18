import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { radius, spacing, typography, useThemeColors } from '@/theme';

import { PROTECTIONS, protectionLabel, type Protection } from '../logic';

type Props = {
  value: Protection | null;
  onChange: (protection: Protection) => void;
  onClear: () => void;
  /** Calm safer-sex notes to show once something is logged (from saferSexNotes). */
  notes: readonly string[];
};

/** Sex log: protected / unprotected, then gentle safer-sex notes. Shown as a heart on the calendar. */
export function IntimacyPicker({ value, onChange, onClear, notes }: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.container}>
      <View accessibilityRole="radiogroup" style={styles.row}>
        {PROTECTIONS.map((protection) => (
          <Chip
            key={protection}
            label={protectionLabel[protection]}
            accessibilityRole="radio"
            accessibilityLabel={`Sex, ${protectionLabel[protection].toLowerCase()}`}
            selected={value === protection}
            onPress={() => onChange(protection)}
          />
        ))}
      </View>

      {value !== null ? (
        <>
          <View style={[styles.notes, { backgroundColor: colors.surfaceTint }]}>
            {notes.map((note) => (
              <Text key={note} style={[typography.body, { color: colors.text }]}>
                {note}
              </Text>
            ))}
          </View>
          <View style={styles.clear}>
            <Button variant="quiet" label="Remove from this day" onPress={onClear} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  notes: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  clear: {
    alignItems: 'flex-start',
  },
});
