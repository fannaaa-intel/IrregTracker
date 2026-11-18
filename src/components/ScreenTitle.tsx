import { StyleSheet, Text, View } from 'react-native';

import { spacing, typography, useThemeColors } from '@/theme';

import { Flower } from './Ornaments';

/** A screen's title with a small blush flower beside it (DESIGN.md §4.8). */
export function ScreenTitle({ children }: { children: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.row}>
      <Text accessibilityRole="header" style={[typography.title, { color: colors.text }]}>
        {children}
      </Text>
      <Flower size={spacing.lg + 2} color={colors.blush} centerColor={colors.petal} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
