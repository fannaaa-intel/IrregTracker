import { fireEvent, render, screen } from '@testing-library/react-native';

import { KindNotesCard } from './KindNotesCard';

const base = {
  enabled: false,
  hour: 8,
  denied: false,
  example: 'Let today be soft.',
  onToggle: jest.fn(),
  onHourChange: jest.fn(),
  onOpenPhoneSettings: jest.fn(),
};

describe('KindNotesCard', () => {
  it('turns on from a labelled switch and shows an example note', async () => {
    const onToggle = jest.fn();
    await render(<KindNotesCard {...base} onToggle={onToggle} />);
    expect(screen.getByText('“Let today be soft.”')).toBeTruthy();
    expect(screen.queryByText('Time')).toBeNull();
    await fireEvent(screen.getByLabelText('Daily kind note'), 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('offers four times when on, with the chosen one selected', async () => {
    const onHourChange = jest.fn();
    await render(<KindNotesCard {...base} enabled hour={18} onHourChange={onHourChange} />);
    const evening = screen.getByRole('radio', { name: /6/ });
    expect(evening.props.accessibilityState).toMatchObject({ checked: true });
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    await fireEvent.press(screen.getByRole('radio', { name: /9/ }));
    expect(onHourChange).toHaveBeenCalledWith(21);
  });

  it('explains blocked notifications calmly and links to phone settings', async () => {
    const onOpenPhoneSettings = jest.fn();
    await render(<KindNotesCard {...base} denied onOpenPhoneSettings={onOpenPhoneSettings} />);
    expect(screen.getByText(/Notifications are turned off for this app/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Open phone settings'));
    expect(onOpenPhoneSettings).toHaveBeenCalledTimes(1);
  });
});
