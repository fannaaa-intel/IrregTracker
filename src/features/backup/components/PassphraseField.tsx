import { StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, touchTarget, typography, useThemeColors } from '@/theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable?: boolean;
};

/** A hidden-text field for backup passphrases. Never pre-filled, never saved. */
export function PassphraseField({ label, value, onChangeText, editable = true }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.field}>
      <Text style={[typography.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="off"
        importantForAutofill="no"
        accessibilityLabel={label}
        style={[
          typography.body,
          styles.input,
          { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  input: {
    minHeight: touchTarget + spacing.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
