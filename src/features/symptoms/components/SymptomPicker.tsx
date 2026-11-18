import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { spacing } from '@/theme';

import { SYMPTOMS, symptomLabel, type Symptom } from '../logic';

type Props = {
  value: readonly Symptom[];
  onToggle: (symptom: Symptom) => void;
};

/** Multi-select symptom chips: one tap logs it, another tap removes it. */
export function SymptomPicker({ value, onToggle }: Props) {
  return (
    <View style={styles.row}>
      {SYMPTOMS.map((symptom) => (
        <Chip
          key={symptom}
          label={symptomLabel[symptom]}
          selected={value.includes(symptom)}
          onPress={() => onToggle(symptom)}
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
