import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Flow } from '@/theme';

import { buildMonthGrid } from '../logic';
import { CalendarMonth } from './CalendarMonth';

const MARCH_2026 = { year: 2026, month: 3 };

function renderMarch({ canGoNext = true } = {}) {
  const flows = new Map<string, Flow>([
    ['2026-03-03', 'medium'],
    ['2026-03-04', 'spotting'],
  ]);
  const grid = buildMonthGrid(MARCH_2026, {
    flows,
    window: { start: '2026-03-28', end: '2026-03-31' },
    today: '2026-03-18',
  });
  const handlers = { onDayPress: jest.fn(), onPrevMonth: jest.fn(), onNextMonth: jest.fn() };
  return {
    handlers,
    view: render(<CalendarMonth grid={grid} canGoNext={canGoNext} {...handlers} />),
  };
}

describe('CalendarMonth', () => {
  it('shows the month title and every day of the month', async () => {
    await renderMarch().view;
    expect(screen.getByText('March 2026')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /^March \d+,/ })).toHaveLength(31);
  });

  it('describes days for screen readers, not by color alone', async () => {
    await renderMarch().view;
    expect(screen.getByLabelText('March 3, period day, medium flow')).toBeTruthy();
    expect(screen.getByLabelText('March 4, spotting')).toBeTruthy();
    expect(screen.getByLabelText('March 18, today, nothing logged')).toBeTruthy();
  });

  it('opens a past day when tapped', async () => {
    const { handlers, view } = renderMarch();
    await view;
    await fireEvent.press(screen.getByLabelText('March 3, period day, medium flow'));
    expect(handlers.onDayPress).toHaveBeenCalledWith('2026-03-03');
  });

  it('does not let future days be logged', async () => {
    const { handlers, view } = renderMarch();
    await view;
    const future = screen.getByLabelText('March 28, in the likely period window');
    expect(future.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(future);
    expect(handlers.onDayPress).not.toHaveBeenCalled();
  });

  it('pages between months, and can stop paging forward', async () => {
    const { handlers, view } = renderMarch({ canGoNext: false });
    await view;
    await fireEvent.press(screen.getByLabelText('Previous month'));
    await fireEvent.press(screen.getByLabelText('Next month'));
    expect(handlers.onPrevMonth).toHaveBeenCalledTimes(1);
    expect(handlers.onNextMonth).not.toHaveBeenCalled();
  });
});
