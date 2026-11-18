import { Flower2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { spacing, typography, useThemeColors } from '@/theme';

import { basisText, FERTILE_PAUSED, fertileText, NOT_CONTRACEPTION, ovulationText } from '../copy';
import type { FertileEstimate } from '../logic';

type Props = {
  /** The estimate, or null while her period is late (estimates pause). */
  estimate: FertileEstimate | null;
};

/** Home: possible fertile days and likely ovulation, always as ranges, always "not contraception". */
export function FertilityCard({ estimate }: Props) {
  const colors = useThemeColors();

  return (
    <Card>
      <View style={styles.head}>
        <Flower2 size={16} strokeWidth={2} color={colors.calm} />
        <Text style={[typography.caption, { color: colors.textMuted }]}>Possible fertile days</Text>
      </View>
      {estimate === null ? (
        <Text style={[typography.body, { color: colors.textMuted }]}>{FERTILE_PAUSED}</Text>
      ) : (
        <>
          <Text style={[typography.heading, { color: colors.text }]}>{fertileText(estimate)}</Text>
          <Text style={[typography.body, { color: colors.calm }]}>{ovulationText(estimate)}</Text>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            A higher chance of pregnancy on these days. {basisText(estimate)}
          </Text>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{NOT_CONTRACEPTION}</Text>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
