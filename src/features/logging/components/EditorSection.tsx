import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { radius, spacing, typography, useThemeColors } from '@/theme';

const ICON_BADGE = spacing.xxl; // 32

type Props = {
  title: string;
  hint: string;
  icon: LucideIcon;
  /** Fill the icon (the heart). */
  filled?: boolean;
  children: ReactNode;
};

/** One part of the day editor: a soft card with its own icon, title and a short hint. */
export function EditorSection({ title, hint, icon: Icon, filled = false, children }: Props) {
  const colors = useThemeColors();
  return (
    <Card style={styles.section}>
      <View style={styles.head}>
        <View style={[styles.badge, { backgroundColor: colors.surfaceTint }]}>
          <Icon
            size={spacing.lg + 2}
            strokeWidth={1.75}
            color={colors.primary}
            fill={filled ? colors.primary : 'none'}
          />
        </View>
        <View style={styles.headText}>
          <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
            {title}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text>
        </View>
      </View>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.lg,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    width: ICON_BADGE,
    height: ICON_BADGE,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {
    flex: 1,
    gap: 2,
  },
});
