import { Leaf, X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing, touchTarget, typography, useThemeColors } from '@/theme';

import { flagMessage, flagTitle } from '../copy';
import type { HealthFlag } from '../logic';

type Props = {
  flag: HealthFlag;
  onWhy: () => void;
  onDismiss: () => void;
};

/** DESIGN.md §5 FlagCard: noticeBg, notice text, leaf icon, quiet "why" link, dismiss. Never red. */
export function FlagCard({ flag, onWhy, onDismiss }: Props) {
  const colors = useThemeColors();
  const title = flagTitle[flag.type];

  return (
    <View accessibilityRole="summary" style={[styles.card, { backgroundColor: colors.noticeBg }]}>
      <View style={styles.head}>
        <Leaf size={22} strokeWidth={1.5} color={colors.notice} />
        <Text
          accessibilityRole="header"
          style={[typography.heading, styles.title, { color: colors.notice }]}
        >
          {title}
        </Text>
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={`Hide this note: ${title}`}
          hitSlop={spacing.sm}
          style={({ pressed }) => [styles.close, { opacity: pressed ? 0.6 : 1 }]}
        >
          <X size={20} strokeWidth={1.5} color={colors.notice} />
        </Pressable>
      </View>
      <Text style={[typography.body, { color: colors.notice }]}>{flagMessage(flag)}</Text>
      <Pressable
        onPress={onWhy}
        accessibilityRole="link"
        accessibilityLabel="Why am I seeing this?"
        style={({ pressed }) => [styles.link, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={[typography.label, styles.underline, { color: colors.notice }]}>
          Why am I seeing this?
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
  },
  close: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.md,
    marginVertical: -spacing.md,
  },
  link: {
    minHeight: touchTarget,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
