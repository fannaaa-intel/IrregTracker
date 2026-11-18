import { fireEvent, render, screen } from '@testing-library/react-native';

import { addDays } from '@/lib/date';

import { buildHistory, regular } from '../../__fixtures__/histories';
import { buildOverview } from '../../cycles/overview';
import { deriveCycles } from '../../cycles/logic';
import { FertilityCard } from '../../fertility/components/FertilityCard';
import { LayerChips } from '../../logging/components/LayerChips';
import { CALENDAR_LAYERS } from '../../logging/filters';
import { PredictionCard } from '../../prediction/components/PredictionCard';
import { summarizeMonth } from '../logic';
import { MonthReportCard } from './MonthReportCard';

const overviewOn = (today: string) =>
  buildOverview({ days: regular.days, tags: [], confirmed: [] }, today);

describe('PredictionCard when late', () => {
  const onTime = overviewOn(regular.lastStart).prediction;
  if (onTime.state !== 'window') throw new Error('expected a window');

  it('moves the window to today and offers to log a missed start', async () => {
    const onLogMissedStart = jest.fn();
    const late = overviewOn(addDays(onTime.usual.end, 1)).prediction;
    await render(<PredictionCard prediction={late} onLogMissedStart={onLogMissedStart} />);
    expect(screen.getByText('Your period is 1 day later than the usual range')).toBeTruthy();
    expect(screen.getByText(/now starts today/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Log a start I missed' }));
    expect(onLogMissedStart).toHaveBeenCalledTimes(1);
  });

  it('shows no late text or button inside the window', async () => {
    await render(<PredictionCard prediction={onTime} onLogMissedStart={jest.fn()} />);
    expect(screen.queryByRole('button', { name: 'Log a start I missed' })).toBeNull();
  });
});

describe('FertilityCard', () => {
  it('gives ranges and always says it is not contraception', async () => {
    await render(<FertilityCard estimate={overviewOn(regular.lastStart).fertile} />);
    expect(screen.getByText(/^Likely between/)).toBeTruthy();
    expect(screen.getByText(/^Ovulation likely between/)).toBeTruthy();
    expect(screen.getByText(/isn't a form of contraception/)).toBeTruthy();
  });

  it('explains the pause while late', async () => {
    await render(<FertilityCard estimate={null} />);
    expect(screen.getByText(/come back once your next period is logged/)).toBeTruthy();
  });
});

describe('LayerChips', () => {
  it('toggles a layer and hides fertile days when they are off in Settings', async () => {
    const onToggle = jest.fn();
    await render(
      <LayerChips visible={new Set(CALENDAR_LAYERS)} onToggle={onToggle} showFertile={false} />,
    );
    expect(screen.queryByLabelText('Show fertile days on the calendar')).toBeNull();
    await fireEvent.press(screen.getByLabelText('Show sex on the calendar'));
    expect(onToggle).toHaveBeenCalledWith('sex');
  });
});

describe('MonthReportCard', () => {
  const fixture = buildHistory([28, 30]);
  const history = deriveCycles(fixture.days);

  it('shows the month in plain words with symptom bars', async () => {
    const report = summarizeMonth(
      { year: 2025, month: 2 },
      {
        days: fixture.days,
        history,
        symptoms: [{ date: '2025-02-03', type: 'cramps' }],
        intimacy: [],
      },
    );
    await render(<MonthReportCard report={report} />);
    expect(screen.getByRole('header', { name: 'February 2025 at a glance' })).toBeTruthy();
    expect(screen.getByLabelText('Cramps, 1 day')).toBeTruthy();
    expect(screen.getByText('No sex logged.')).toBeTruthy();
  });

  it('invites logging in an empty month', async () => {
    const report = summarizeMonth(
      { year: 2026, month: 7 },
      { days: [], history, symptoms: [], intimacy: [] },
    );
    await render(<MonthReportCard report={report} />);
    expect(screen.getByText(/Nothing logged this month/)).toBeTruthy();
  });
});
