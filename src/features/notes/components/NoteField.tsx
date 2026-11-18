import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { radius, spacing, typography, useThemeColors } from '@/theme';

import { NOTE_MAX_LENGTH, normalizeNote, remainingText } from '../logic';

/** Saves this long after she stops typing, and again when the field loses focus. */
const SAVE_DELAY_MS = 800;

type Props = {
  /** The saved note ('' when none). */
  initial: string;
  onSave: (text: string) => void;
};

/** A soft multi-line box for the day's note. No save button: it keeps itself. */
export function NoteField({ initial, onSave }: Props) {
  const colors = useThemeColors();
  const [text, setText] = useState(initial);
  const [focused, setFocused] = useState(false);
  const lastSaved = useRef(normalizeNote(initial));

  const saveIfChanged = (value: string) => {
    const next = normalizeNote(value);
    if (next === lastSaved.current) return;
    lastSaved.current = next;
    onSave(value);
  };

  useEffect(() => {
    const timer = setTimeout(() => saveIfChanged(text), SAVE_DELAY_MS);
    return () => clearTimeout(timer);
    // Only the text should restart the timer; saveIfChanged reads the latest props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const remaining = remainingText(text);

  return (
    <View style={styles.wrap}>
      <TextInput
        value={text}
        onChangeText={setText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          saveIfChanged(text);
        }}
        multiline
        maxLength={NOTE_MAX_LENGTH}
        placeholder="Anything worth remembering about today"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Note for this day"
        textAlignVertical="top"
        style={[
          typography.body,
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.surface,
            borderColor: focused ? colors.primary : colors.border,
          },
        ]}
      />
      {remaining !== null ? (
        <Text style={[typography.caption, styles.counter, { color: colors.textMuted }]}>
          {remaining}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    minHeight: spacing.xxxl * 2,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  counter: {
    alignSelf: 'flex-end',
  },
});
