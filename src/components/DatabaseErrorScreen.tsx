import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DbErrorKind } from '@/db/errors';
import { spacing, typography, useThemeColors } from '@/theme';

const copy: Record<DbErrorKind, { title: string; body: string }> = {
  'not-encrypted': {
    title: "Storage couldn't be secured",
    body: "This phone couldn't turn on encrypted storage, so Cycle Tracker stopped before saving anything. Your data is never stored unencrypted.",
  },
  key: {
    title: "Storage couldn't be unlocked",
    body: "Cycle Tracker couldn't unlock its encrypted storage. Nothing has been deleted. Try closing and reopening the app.",
  },
  schema: {
    title: 'This data needs a newer version',
    body: 'Your data was saved by a newer version of Cycle Tracker. Please update the app to open it. Nothing has been changed.',
  },
  unknown: {
    title: 'Something went wrong',
    body: "Cycle Tracker couldn't open its storage. Nothing has been deleted. Try closing and reopening the app.",
  },
};

type Props = {
  kind: DbErrorKind;
};

// Shown instead of the app when the encrypted database can't be opened. The app never falls
// back to unencrypted storage (CLAUDE.md §1.2).
export function DatabaseErrorScreen({ kind }: Props) {
  const colors = useThemeColors();
  const { title, body } = copy[kind];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[typography.body, styles.body, { color: colors.textMuted }]}>{body}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  body: {
    marginTop: spacing.md,
  },
});
