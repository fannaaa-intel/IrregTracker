import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { ScreenTitle } from '@/components/ScreenTitle';
import { SavedNote } from '@/features/logging/components/SavedNote';

import { NoteCard } from './NoteCard';
import { PhaseChip } from './PhaseChip';
import { TodayCard } from './TodayCard';

describe('TodayCard', () => {
  it('invites logging when nothing is logged', async () => {
    const onLog = jest.fn();
    await render(<TodayCard log={{ flow: null, symptoms: [], protection: null }} onLog={onLog} />);
    expect(screen.getByText(/Nothing logged yet/)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Log today' }));
    expect(onLog).toHaveBeenCalledTimes(1);
  });

  it('lists what is logged and offers to edit it', async () => {
    await render(
      <TodayCard
        log={{ flow: 'light', symptoms: ['cramps'], protection: 'protected' }}
        onLog={jest.fn()}
      />,
    );
    expect(screen.getByText('Light flow')).toBeTruthy();
    expect(screen.getByText('Cramps')).toBeTruthy();
    expect(screen.getByText('Sex, protected')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Edit today' })).toBeTruthy();
  });
});

describe('PhaseChip and NoteCard', () => {
  it('shows the phase hint text', async () => {
    await render(<PhaseChip hint={{ kind: 'soon', text: 'Period likely in 6–10 days' }} />);
    expect(screen.getByText('Period likely in 6–10 days')).toBeTruthy();
  });

  it("shows today's note", async () => {
    await render(<NoteCard phrase="Let today be soft." />);
    expect(screen.getByText("Today's note")).toBeTruthy();
    expect(screen.getByText('Let today be soft.')).toBeTruthy();
  });
});

describe('ScreenTitle', () => {
  it('is a header, with its flower hidden from screen readers', async () => {
    await render(<ScreenTitle>Calendar</ScreenTitle>);
    expect(screen.getByRole('header', { name: 'Calendar' })).toBeTruthy();
  });
});

describe('SavedNote', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('says nothing before the first save, then "Saved"', async () => {
    const view = await render(<SavedNote version={0} />);
    expect(screen.queryByText('Saved')).toBeNull();
    await view.rerender(<SavedNote version={1} />);
    await act(async () => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByText('Saved')).toBeTruthy();
  });
});
