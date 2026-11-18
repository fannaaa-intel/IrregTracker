import { Flower2 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { spacing, typography, useThemeColors } from '@/theme';

import {
  basisText,
  FERTILE_PAUSED,
  fertileText,
  irregularText,
  MEDS_NOTE,
  NOT_CONTRACEPTION,
  ovulationText,
} from '../copy';
import type { FertileStatus } from '../logic';

type Props = {
  /** Anything but 'learning' (Home hides the card while still learning). */
  status: Exclude<FertileStatus, { state: 'learning' }>;
};

/** Home: possible fertile days and likely ovulation, or a calm reason why none are shown. */
export function FertilityCard({ status }: Props) {
  const colors = useThemeColors();
  const muted = [typography.body, { color: colors.textMuted }];

  let body;
  if (status.state === 'late') {
    body = <Text style={muted}>{FERTILE_PAUSED}</Text>;
  } else if (status.state === 'irregular') {
    body = <Text style={muted}>{irregularText(status.variation)}</Text>;
  } else {
    const { estimate } = status;
    body = (
      <>
        <Text style={[typography.heading, { color: colors.text }]}>{fertileText(estimate)}</Text>
        <Text style={[typography.body, { color: colors.calm }]}>{ovulationText(estimate)}</Text>
        <Text style={muted}>A higher chance of pregnancy on these days. {basisText(estimate)}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{NOT_CONTRACEPTION}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{MEDS_NOTE}</Text>
      </>
    );
  }

  return (
    <Card>
      <View style={styles.head}>
        <Flower2 size={16} strokeWidth={2} color={colors.calm} />
        <Text style={[typography.caption, { color: colors.textMuted }]}>Possible fertile days</Text>
      </View>
      {body}
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
