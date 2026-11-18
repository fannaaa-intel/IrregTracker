// Calendar filters (her feedback): choose which marks the calendar shows. Pure.
import type { LocalDate } from '../../lib/date';
import type { Flow } from '../../theme';
import type { DateWindow, FertileDays } from './logic';

export type CalendarLayer = 'period' | 'predicted' | 'fertile' | 'sex' | 'symptoms';

export const CALENDAR_LAYERS: readonly CalendarLayer[] = [
  'period',
  'predicted',
  'fertile',
  'sex',
  'symptoms',
];

export const layerLabel: Record<CalendarLayer, string> = {
  period: 'Period',
  predicted: 'Likely period',
  fertile: 'Fertile days',
  sex: 'Sex',
  symptoms: 'Symptoms',
};

export type LayerInput = {
  flows: ReadonlyMap<LocalDate, Flow>;
  window: DateWindow | null;
  fertile: FertileDays | null;
  intimacy: ReadonlySet<LocalDate>;
  symptoms: ReadonlySet<LocalDate>;
};

/** Hides every layer that isn't in `visible`. */
export function applyLayers(input: LayerInput, visible: ReadonlySet<CalendarLayer>): LayerInput {
  return {
    flows: visible.has('period') ? input.flows : new Map(),
    window: visible.has('predicted') ? input.window : null,
    fertile: visible.has('fertile') ? input.fertile : null,
    intimacy: visible.has('sex') ? input.intimacy : new Set(),
    symptoms: visible.has('symptoms') ? input.symptoms : new Set(),
  };
}

export function toggleLayer(
  visible: ReadonlySet<CalendarLayer>,
  layer: CalendarLayer,
): Set<CalendarLayer> {
  const next = new Set(visible);
  if (next.has(layer)) next.delete(layer);
  else next.add(layer);
  return next;
}
