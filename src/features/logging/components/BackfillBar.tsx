import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { radius, spacing, typography, useThemeColors, type Flow } from '@/theme';

import { FlowPicker } from './FlowPicker';

type Props = {
  selectedCount: number;
  flow: Flow;
  onFlowChange: (flow: Flow) => void;
  onSave: () => void;
  onCancel: () => void;
};

/** Bottom sheet for backfill mode: pick one flow, then save every selected day at once. */
export function BackfillBar({ selectedCount, flow, onFlowChange, onSave, onCancel }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const dayWord = selectedCount === 1 ? 'day' : 'days';

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          paddingBottom: spacing.lg + insets.bottom,
        },
      ]}
    >
      <Text accessibilityLiveRegion="polite" style={[typography.heading, { color: colors.text }]}>
        {selectedCount === 0
          ? 'Select the days you had your period'
          : `${selectedCount} ${dayWord} selected`}
      </Text>
      <FlowPicker value={flow} onChange={onFlowChange} />
      <View style={styles.actions}>
        <Button variant="quiet" label="Cancel" onPress={onCancel} />
        <Button
          label={selectedCount === 0 ? 'Save' : `Save ${selectedCount} ${dayWord}`}
          onPress={onSave}
          disabled={selectedCount === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
