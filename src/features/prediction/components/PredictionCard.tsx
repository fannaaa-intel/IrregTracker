import { Text } from 'react-native';

import { Card } from '@/components/Card';
import { typography, useThemeColors } from '@/theme';

import { lateText, learningText, windowText } from '../copy';
import type { Prediction } from '../logic';
import { ConfidenceChip } from './ConfidenceChip';

/** Next-period window + confidence, or "still learning". Never a single date (CLAUDE.md §2.1). */
export function PredictionCard({ prediction }: { prediction: Prediction }) {
  const colors = useThemeColors();

  if (prediction.state === 'learning') {
    return (
      <Card>
        <Text style={[typography.heading, { color: colors.text }]}>Next period</Text>
        <Text style={[typography.body, { color: colors.textMuted }]}>
          {learningText(prediction)}
        </Text>
      </Card>
    );
  }

  const late = lateText(prediction);
  return (
    <Card>
      <Text style={[typography.caption, { color: colors.textMuted }]}>Next period</Text>
      <Text style={[typography.heading, { color: colors.text }]}>{windowText(prediction)}</Text>
      <ConfidenceChip confidence={prediction.confidence} />
      {late !== null ? (
        <Text style={[typography.body, { color: colors.notice }]}>{late}</Text>
      ) : null}
      <Text style={[typography.caption, { color: colors.textMuted }]}>
        Based on your last {prediction.cyclesCounted} cycles.
      </Text>
    </Card>
  );
}
