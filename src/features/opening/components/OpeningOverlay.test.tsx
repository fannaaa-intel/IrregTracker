import { act, render } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { OpeningOverlay } from './OpeningOverlay';

describe('OpeningOverlay', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.each([
    ['full animation', false],
    ['Reduce motion', true],
  ])('finishes and hands over to the app (%s)', async (_, reduce) => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduce);
    const onDone = jest.fn();
    await render(<OpeningOverlay onDone={onDone} />);
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('is hidden from screen readers and never blocks touches', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
    const { toJSON } = await render(<OpeningOverlay onDone={jest.fn()} />);
    const root = toJSON() as { props: Record<string, unknown> };
    expect(root.props.pointerEvents).toBe('none');
    expect(root.props.importantForAccessibility).toBe('no-hide-descendants');
  });
});
