import { fireEvent, render, screen } from '@testing-library/react-native';

import { addDays } from '@/lib/date';

import { latestCycleOf } from '../../__fixtures__/histories';
import { deriveCycles } from '../../cycles/logic';
import { detectFlags } from '../logic';
import { FlagCard } from './FlagCard';
import { FlagExplanation } from './FlagExplanation';

describe('FlagCard', () => {
  const fixture = latestCycleOf(36);
  const flag = detectFlags(deriveCycles(fixture.days), [], addDays(fixture.lastStart, 3))[0];

  it('shows the calm note with a why link and a labelled dismiss button', async () => {
    const onWhy = jest.fn();
    const onDismiss = jest.fn();
    await render(<FlagCard flag={flag} onWhy={onWhy} onDismiss={onDismiss} />);

    expect(screen.getByText('A longer cycle')).toBeTruthy();
    expect(screen.getByText(/^This cycle was longer than usual \(36 days\)\./)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Why am I seeing this?'));
    expect(onWhy).toHaveBeenCalledTimes(1);
    await fireEvent.press(screen.getByLabelText('Hide this note: A longer cycle'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe('FlagExplanation', () => {
  it('explains the rule, context and when to see a doctor, without diagnosing', async () => {
    const onBack = jest.fn();
    await render(<FlagExplanation type="no-period" onBack={onBack} />);

    expect(screen.getByText('About a long gap')).toBeTruthy();
    expect(screen.getByText('Why this note appeared')).toBeTruthy();
    expect(screen.getByText(/90 days or more have passed/)).toBeTruthy();
    expect(screen.getByText('When to talk to a doctor')).toBeTruthy();
    expect(screen.getByText(/can't diagnose anything/)).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
