import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { spacing } from '@/theme';

import { TEST_RESULTS, testResultLabel, type TestResult } from '../tests';

type Props = {
  value: TestResult | null;
  onChange: (result: TestResult) => void;
  onClear: () => void;
};

/** Optional: the result of an ovulation (LH) test strip taken that day. */
export function OvulationTestPicker({ value, onChange, onClear }: Props) {
  return (
    <View style={styles.wrap}>
      <View accessibilityRole="radiogroup" style={styles.row}>
        {TEST_RESULTS.map((result) => (
          <Chip
            key={result}
            label={testResultLabel[result]}
            accessibilityRole="radio"
            accessibilityLabel={`Ovulation test, ${testResultLabel[result].toLowerCase()}`}
            selected={value === result}
            onPress={() => onChange(result)}
          />
        ))}
      </View>
      {value !== null ? (
        <View style={styles.clear}>
          <Button variant="quiet" label="Remove test" onPress={onClear} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  clear: {
    alignItems: 'flex-start',
  },
});
