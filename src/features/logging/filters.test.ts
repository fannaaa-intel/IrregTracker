import type { Flow } from '../../theme';
import { applyLayers, CALENDAR_LAYERS, toggleLayer, type LayerInput } from './filters';

const input: LayerInput = {
  flows: new Map<string, Flow>([['2026-11-03', 'medium']]),
  window: { start: '2026-11-28', end: '2026-12-04' },
  fertile: {
    fertile: { start: '2026-11-12', end: '2026-11-20' },
    ovulation: { start: '2026-11-14', end: '2026-11-18' },
  },
  intimacy: new Set(['2026-11-10']),
  symptoms: new Set(['2026-11-03']),
};

describe('applyLayers', () => {
  it('keeps everything with all layers on', () => {
    expect(applyLayers(input, new Set(CALENDAR_LAYERS))).toEqual(input);
  });

  it('hides each layer on its own', () => {
    const only = (hidden: (typeof CALENDAR_LAYERS)[number]) =>
      applyLayers(input, new Set(CALENDAR_LAYERS.filter((l) => l !== hidden)));
    expect(only('period').flows.size).toBe(0);
    expect(only('predicted').window).toBeNull();
    expect(only('fertile').fertile).toBeNull();
    expect(only('sex').intimacy.size).toBe(0);
    expect(only('symptoms').symptoms.size).toBe(0);
    expect(only('sex').flows).toBe(input.flows);
  });
});

describe('toggleLayer', () => {
  it('turns a layer off and back on', () => {
    const off = toggleLayer(new Set(CALENDAR_LAYERS), 'sex');
    expect(off.has('sex')).toBe(false);
    expect(toggleLayer(off, 'sex').has('sex')).toBe(true);
  });
});
