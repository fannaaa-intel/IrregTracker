import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { buildHistory } from '../../__fixtures__/histories';
import { buildOverview } from '../../cycles/overview';
import { PatternsCard } from '../../insights/components/PatternsCard';
import { CalendarKey } from '../../logging/components/CalendarKey';
import { NoteField } from '../../notes/components/NoteField';
import { DoctorCycles } from '../../reports/components/DoctorCycles';
import { DoctorNotes } from '../../reports/components/DoctorNotes';
import { buildDoctorSummary } from '../../reports/doctor';
import { PhaseCard } from './PhaseCard';

describe('PhaseCard', () => {
  it('names the phase, says it is an estimate, and highlights it for screen readers', async () => {
    await render(<PhaseCard info={{ phase: 'luteal', estimated: true }} />);
    expect(screen.getByRole('header', { name: 'Luteal phase (estimate)' })).toBeTruthy();
    expect(screen.getByLabelText('Cycle phase: Luteal phase, an estimate.')).toBeTruthy();
  });

  it('is honest when the phase cannot be known', async () => {
    await render(<PhaseCard info={{ phase: 'unknown', estimated: true }} />);
    expect(screen.getByRole('header', { name: 'Phase unclear' })).toBeTruthy();
    expect(screen.getByText(/can't tell which phase/)).toBeTruthy();
  });
});

describe('CalendarKey', () => {
  it('explains every mark in words, and can be hidden', async () => {
    await render(<CalendarKey showFertile />);
    for (const title of ['Period day', 'Likely next period', 'Possible fertile days', 'Sex']) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.getByText(/just one day/)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Hide what the marks mean'));
    expect(screen.queryByText('Period day')).toBeNull();
  });

  it('leaves out fertile marks when none are shown', async () => {
    await render(<CalendarKey showFertile={false} />);
    expect(screen.queryByText('Possible fertile days')).toBeNull();
  });
});

describe('NoteField', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('saves on its own shortly after typing stops, and not when nothing changed', async () => {
    const onSave = jest.fn();
    await render(<NoteField initial="" onSave={onSave} />);
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(onSave).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText('Note for this day'), 'Made-up note');
    await act(async () => {
      jest.advanceTimersByTime(1000);
    });
    expect(onSave).toHaveBeenCalledWith('Made-up note');
  });
});

describe('PatternsCard', () => {
  it('invites logging before there are patterns', async () => {
    await render(<PatternsCard patterns={[]} />);
    expect(screen.getByText(/around 3/)).toBeTruthy();
  });

  it('lists patterns with a calm caveat', async () => {
    await render(<PatternsCard patterns={[{ symptom: 'cramps', offset: -1, periods: 4 }]} />);
    expect(screen.getByText('Cramps: usually about 1 day before your period starts')).toBeTruthy();
    expect(screen.getByText(/aren't a diagnosis/)).toBeTruthy();
  });
});

describe('Doctor summary', () => {
  const fixture = buildHistory([29, 31, 28]);
  const today = fixture.lastStart;
  const summary = buildDoctorSummary({
    overview: buildOverview({ days: fixture.days, tags: [], confirmed: [] }, today),
    firstLogged: fixture.days[0].date,
    symptoms: [{ date: today, type: 'cramps' }],
    notes: [{ date: today, body: 'Made-up note for the doctor.' }],
    today,
  });

  it('shows the numbers and recent cycles', async () => {
    await render(<DoctorCycles summary={summary} />);
    expect(screen.getByText('Typical cycle')).toBeTruthy();
    expect(screen.getByText('29 days (median of 3)')).toBeTruthy();
    expect(screen.getAllByText(/^Started /)).toHaveLength(3);
  });

  it('shows recent symptoms and notes, and never sex logs', async () => {
    await render(<DoctorNotes summary={summary} />);
    expect(screen.getByText(/cramps \(1\)/)).toBeTruthy();
    expect(screen.getByText('Made-up note for the doctor.')).toBeTruthy();
    expect(screen.queryByText(/sex/i)).toBeNull();
  });
});
