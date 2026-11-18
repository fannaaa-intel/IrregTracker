import { fireEvent, render, screen } from '@testing-library/react-native';

import { addDays } from '@/lib/date';

import { buildHistory, regular } from '../../__fixtures__/histories';
import { predictNextPeriod } from '../../prediction/logic';
import { PredictionCard } from '../../prediction/components/PredictionCard';
import { deriveCycles } from '../logic';
import { ringModel } from '../summary';
import { CycleBarChart } from './CycleBarChart';
import { CycleDetail, type CycleDetailProps } from './CycleDetail';
import { CycleRing } from './CycleRing';

describe('Home parts', () => {
  const history = deriveCycles(regular.days);

  it('reads the ring as a day count with the usual range', async () => {
    const today = addDays(regular.lastStart, 17);
    const model = ringModel(history.open!, predictNextPeriod(history, [], today), today, 28)!;
    await render(<CycleRing model={model} />);
    expect(
      screen.getByLabelText('Day 18 of your cycle. Cycles usually last 26 to 30 days.'),
    ).toBeTruthy();
  });

  it('shows a window and confidence, with no late note inside the window', async () => {
    const onTime = predictNextPeriod(history, [], regular.lastStart);
    await render(<PredictionCard prediction={onTime} />);
    expect(screen.getByText(/^Likely between /)).toBeTruthy();
    expect(screen.getByLabelText('High confidence')).toBeTruthy();
    expect(screen.queryByText(/later than the usual range/)).toBeNull();
  });

  it('shows a calm late note past the window', async () => {
    const late = predictNextPeriod(history, [], addDays(regular.lastStart, 33));
    await render(<PredictionCard prediction={late} />);
    expect(screen.getByText('Your period is 3 days later than the usual range')).toBeTruthy();
  });
});

describe('CycleBarChart', () => {
  const history = deriveCycles(buildHistory([28, 31, 26]).days);

  it('summarizes every bar for screen readers', async () => {
    await render(<CycleBarChart cycles={history.closed} notCounted={new Set()} typical={28} />);
    expect(
      screen.getByLabelText('Cycle lengths, oldest to newest: 28, 31, 26 days. Typical 28 days.'),
    ).toBeTruthy();
  });

  it('starts on the newest cycle and marks cycles that are not counted', async () => {
    const newest = history.closed[0];
    await render(
      <CycleBarChart cycles={history.closed} notCounted={new Set([newest.start])} typical={28} />,
    );
    expect(screen.getByText(/· 26 days · not counted$/)).toBeTruthy();
  });
});

describe('CycleDetail', () => {
  const base: CycleDetailProps = {
    start: '2026-03-01',
    nextStart: '2026-03-29',
    length: 28,
    day: null,
    period: { start: '2026-03-01', end: '2026-03-05', length: 5 },
    tag: null,
    needsConfirmation: false,
    onBack: jest.fn(),
    onTagChange: jest.fn(),
    onExcludeChange: jest.fn(),
    onConfirmShort: jest.fn(),
    onOpenCalendar: jest.fn(),
  };

  it('shows the dates and lengths', async () => {
    await render(<CycleDetail {...base} />);
    expect(screen.getByRole('header', { name: '28-day cycle' })).toBeTruthy();
    expect(screen.getByText('Mar 1, 2026 – Mar 28, 2026')).toBeTruthy();
    expect(screen.getByText('Period: 5 days (Mar 1 – Mar 5)')).toBeTruthy();
  });

  it('tags a cycle and can only leave it out once tagged', async () => {
    const onTagChange = jest.fn();
    await render(<CycleDetail {...base} onTagChange={onTagChange} />);
    expect(screen.getByLabelText('Leave out of predictions').props.disabled).toBe(true);
    await fireEvent.press(screen.getByRole('radio', { name: 'Travel' }));
    expect(onTagChange).toHaveBeenCalledWith('travel');
  });

  it('lets a tagged cycle be included again', async () => {
    const onExcludeChange = jest.fn();
    await render(
      <CycleDetail
        {...base}
        tag={{ reason: 'illness', exclude: true }}
        onExcludeChange={onExcludeChange}
      />,
    );
    const toggle = screen.getByLabelText('Leave out of predictions');
    expect(toggle.props.value).toBe(true);
    await fireEvent(toggle, 'valueChange', false);
    expect(onExcludeChange).toHaveBeenCalledWith(false);
  });

  it('asks before counting a very short cycle', async () => {
    const onConfirmShort = jest.fn();
    await render(
      <CycleDetail {...base} length={7} needsConfirmation onConfirmShort={onConfirmShort} />,
    );
    expect(screen.getByText('Is this right?')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: "Yes, it's right" }));
    expect(onConfirmShort).toHaveBeenCalledTimes(1);
  });
});
