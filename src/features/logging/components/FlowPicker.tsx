import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { spacing, type Flow } from '@/theme';

import { FLOWS, flowLabel } from '../logic';
import { FlowMark } from './FlowMark';

type Props = {
  value: Flow | null;
  onChange: (flow: Flow) => void;
};

/** Single-choice flow chips: spotting / light / medium / heavy, each with its droplet mark. */
export function FlowPicker({ value, onChange }: Props) {
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      {FLOWS.map((flow) => (
        <Chip
          key={flow}
          label={flowLabel[flow]}
          accessibilityRole="radio"
          accessibilityLabel={`${flowLabel[flow]} flow`}
          selected={value === flow}
          onPress={() => onChange(flow)}
          leading={<FlowMark flow={flow} />}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
