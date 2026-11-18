import { contrastRatio, WCAG_AA_TEXT } from '../../lib/contrast';
import type { Flow } from '../../theme';
import { dropletCount, flowFill, onFlowText } from './flow-style';

const filled: Flow[] = ['light', 'medium', 'heavy'];

describe('flow styles', () => {
  it.each(filled)('day numbers on the %s fill meet WCAG AA', (flow) => {
    const fill = flowFill(flow);
    const text = onFlowText(flow);
    expect(fill).not.toBeNull();
    expect(text).not.toBeNull();
    expect(contrastRatio(text ?? '', fill ?? '')).toBeGreaterThanOrEqual(WCAG_AA_TEXT);
  });

  it('spotting has no fill, so it uses the normal text color', () => {
    expect(flowFill('spotting')).toBeNull();
    expect(onFlowText('spotting')).toBeNull();
  });

  it('marks flows with 0–3 droplets so meaning is not color alone', () => {
    expect((['spotting', 'light', 'medium', 'heavy'] as Flow[]).map(dropletCount)).toEqual([
      0, 1, 2, 3,
    ]);
  });
});
