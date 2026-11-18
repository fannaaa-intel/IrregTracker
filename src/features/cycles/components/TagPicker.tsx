import { StyleSheet, View } from 'react-native';

import { Chip } from '@/components/Chip';
import { spacing } from '@/theme';

import { TAG_REASONS, tagLabel, type TagReason } from '../tags';

type Props = {
  value: TagReason | null;
  onChange: (reason: TagReason | null) => void;
};

/** Single choice: no tag, or one reason the cycle may be unusual. */
export function TagPicker({ value, onChange }: Props) {
  return (
    <View accessibilityRole="radiogroup" style={styles.row}>
      <Chip
        label="None"
        accessibilityRole="radio"
        accessibilityLabel="No tag"
        selected={value === null}
        onPress={() => onChange(null)}
      />
      {TAG_REASONS.map((reason) => (
        <Chip
          key={reason}
          label={tagLabel[reason]}
          accessibilityRole="radio"
          selected={value === reason}
          onPress={() => onChange(reason)}
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
