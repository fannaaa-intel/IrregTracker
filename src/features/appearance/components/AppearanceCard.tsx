import { Moon, Smartphone, Sun, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { spacing, typography, useThemeColors } from '@/theme';

import { APPEARANCE_CHOICES, appearanceLabel, type AppearanceChoice } from '../logic';

const ICONS: Record<AppearanceChoice, LucideIcon> = {
  system: Smartphone,
  light: Sun,
  dark: Moon,
};

type Props = {
  choice: AppearanceChoice;
  onChoose: (choice: AppearanceChoice) => void;
};

/** Settings → Appearance: match the phone, or always light / always dark. */
export function AppearanceCard({ choice, onChoose }: Props) {
  const colors = useThemeColors();
  return (
    <Card>
      <Text accessibilityRole="header" style={[typography.heading, { color: colors.text }]}>
        Appearance
      </Text>
      <View accessibilityRole="radiogroup" style={styles.chips}>
        {APPEARANCE_CHOICES.map((c) => {
          const Icon = ICONS[c];
          const selected = c === choice;
          return (
            <Chip
              key={c}
              label={appearanceLabel[c]}
              selected={selected}
              accessibilityRole="radio"
              onPress={() => onChoose(c)}
              leading={
                selected ? null : <Icon size={16} strokeWidth={1.5} color={colors.textMuted} />
              }
            />
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
