import { fireEvent, render, screen } from '@testing-library/react-native';

import { KindNotesCard } from './KindNotesCard';

const base = {
  enabled: true,
  time: 'surprise' as const,
  blocked: false,
  example: 'Let today be soft.',
  onToggle: jest.fn(),
  onTimeChange: jest.fn(),
  onOpenPhoneSettings: jest.fn(),
};

describe('KindNotesCard', () => {
  it('shows the evening surprise selected by default, with an example note', async () => {
    await render(<KindNotesCard {...base} />);
    expect(screen.getByText('“Let today be soft.”')).toBeTruthy();
    expect(
      screen.getByRole('radio', { name: 'Evening surprise' }).props.accessibilityState,
    ).toMatchObject({
      checked: true,
    });
    expect(screen.getByText(/between 8 PM and midnight/)).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('lets her pick a fixed time or turn the notes off', async () => {
    const onTimeChange = jest.fn();
    const onToggle = jest.fn();
    await render(<KindNotesCard {...base} onTimeChange={onTimeChange} onToggle={onToggle} />);
    await fireEvent.press(screen.getByRole('radio', { name: /6/ }));
    expect(onTimeChange).toHaveBeenCalledWith(18);
    await fireEvent(screen.getByLabelText('Daily kind note'), 'valueChange', false);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('hides the times when off', async () => {
    await render(<KindNotesCard {...base} enabled={false} />);
    expect(screen.queryByRole('radio')).toBeNull();
  });

  it('explains blocked notifications calmly and links to phone settings', async () => {
    const onOpenPhoneSettings = jest.fn();
    await render(<KindNotesCard {...base} blocked onOpenPhoneSettings={onOpenPhoneSettings} />);
    expect(screen.getByText(/Notifications are turned off for this app/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Open phone settings'));
    expect(onOpenPhoneSettings).toHaveBeenCalledTimes(1);
  });
});
