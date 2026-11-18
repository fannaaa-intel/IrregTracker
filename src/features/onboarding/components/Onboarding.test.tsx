import { fireEvent, render, screen } from '@testing-library/react-native';

import { Onboarding } from './Onboarding';

describe('Onboarding', () => {
  it('walks through the four cards and ends on backfill', async () => {
    const onFinish = jest.fn();
    await render(<Onboarding onFinish={onFinish} />);

    expect(screen.getByText('A calm place for your cycle')).toBeTruthy();
    expect(screen.getByLabelText('Step 1 of 4')).toBeTruthy();
    // Cards off screen are hidden from screen readers until swiped to.
    expect(screen.queryByText('Notice how you feel')).toBeNull();

    await fireEvent.press(screen.getByText('Next'));
    expect(screen.getByText('Notice how you feel')).toBeTruthy();

    await fireEvent.press(screen.getByText('Back'));
    expect(screen.getByText('A calm place for your cycle')).toBeTruthy();

    await fireEvent.press(screen.getByText('Next'));
    await fireEvent.press(screen.getByText('Next'));
    expect(screen.getByText('Private by design')).toBeTruthy();
    await fireEvent.press(screen.getByText('Next'));
    expect(screen.getByText('Add your last few periods')).toBeTruthy();
    expect(screen.getByLabelText('Step 4 of 4')).toBeTruthy();

    await fireEvent.press(screen.getByText('Add past periods'));
    expect(onFinish).toHaveBeenCalledWith(true);
  });

  it('can be skipped from the first card or declined at the end', async () => {
    const onFinish = jest.fn();
    await render(<Onboarding onFinish={onFinish} />);
    await fireEvent.press(screen.getByLabelText('Skip the introduction'));
    expect(onFinish).toHaveBeenCalledWith(false);
  });
});
