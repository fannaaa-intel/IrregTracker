import type { TagReason } from '../../db/repositories/cycle-tag-repo';

export type { TagReason } from '../../db/repositories/cycle-tag-repo';

export const TAG_REASONS: readonly TagReason[] = [
  'illness',
  'travel',
  'stress',
  'medication',
  'other',
];

export const tagLabel: Record<TagReason, string> = {
  illness: 'Illness',
  travel: 'Travel',
  stress: 'Stress',
  medication: 'Medication',
  other: 'Other',
};
