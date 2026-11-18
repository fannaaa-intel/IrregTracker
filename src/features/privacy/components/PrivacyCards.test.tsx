import { fireEvent, render, screen } from '@testing-library/react-native';

import { LockScreen } from '../../lock/components/LockScreen';
import { AppLockCard, YourDataCard } from './PrivacyCards';

describe('AppLockCard', () => {
  it('turns on from a labelled switch', async () => {
    const onToggle = jest.fn();
    await render(<AppLockCard enabled={false} message={null} onToggle={onToggle} />);
    expect(screen.queryByText(/hidden in your recent apps/)).toBeNull();
    await fireEvent(screen.getByLabelText('App lock'), 'valueChange', true);
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('explains what changes when on, and shows calm messages', async () => {
    await render(
      <AppLockCard enabled message="Set up a screen lock first." onToggle={jest.fn()} />,
    );
    expect(screen.getByText(/hidden in your recent apps/)).toBeTruthy();
    expect(screen.getByText('Set up a screen lock first.')).toBeTruthy();
  });
});

describe('YourDataCard', () => {
  it('offers backup, restore and delete', async () => {
    const handlers = { onSaveBackup: jest.fn(), onRestore: jest.fn(), onDeleteAll: jest.fn() };
    await render(<YourDataCard {...handlers} />);
    await fireEvent.press(screen.getByText('Save a backup'));
    await fireEvent.press(screen.getByText('Restore a backup'));
    await fireEvent.press(screen.getByText('Delete all data'));
    expect(handlers.onSaveBackup).toHaveBeenCalledTimes(1);
    expect(handlers.onRestore).toHaveBeenCalledTimes(1);
    expect(handlers.onDeleteAll).toHaveBeenCalledTimes(1);
  });
});

describe('LockScreen', () => {
  it('asks to unlock straight away, shows no data, and offers a retry', async () => {
    const onUnlock = jest.fn();
    await render(<LockScreen onUnlock={onUnlock} />);
    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Locked')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Unlock'));
    expect(onUnlock).toHaveBeenCalledTimes(2);
  });
});
