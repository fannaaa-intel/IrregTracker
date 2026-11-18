import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { BackupError } from '../crypto';
import type { BackupData } from '../format';
import { BackupExport } from './BackupExport';
import { BackupRestore } from './BackupRestore';

const STAMP = '2026-11-18T00:00:00.000Z';
const data: BackupData = {
  schemaVersion: 1,
  periodDays: [
    { date: '2026-10-01', flow: 'medium', createdAt: STAMP, updatedAt: STAMP },
    { date: '2026-10-29', flow: 'light', createdAt: STAMP, updatedAt: STAMP },
  ],
  cycleTags: [],
  settings: [],
};

describe('BackupExport', () => {
  it('only enables Create backup for a long enough, matching passphrase', async () => {
    const onExport = jest.fn().mockResolvedValue(undefined);
    await render(<BackupExport onExport={onExport} onDone={jest.fn()} />);
    await fireEvent.changeText(screen.getByLabelText('Passphrase'), 'short');
    await fireEvent.changeText(screen.getByLabelText('Repeat passphrase'), 'short');
    expect(screen.getByText('Use at least 8 characters.')).toBeTruthy();
    expect(screen.getByLabelText('Create backup').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.changeText(screen.getByLabelText('Passphrase'), 'long enough');
    await fireEvent.changeText(screen.getByLabelText('Repeat passphrase'), 'long enough');
    await fireEvent.press(screen.getByLabelText('Create backup'));
    expect(onExport).toHaveBeenCalledWith('long enough');
    await waitFor(() => expect(screen.getByText('Backup ready')).toBeTruthy());
  });
});

describe('BackupRestore', () => {
  it('shows a preview and only replaces data after confirming', async () => {
    const onRestore = jest.fn().mockResolvedValue(undefined);
    await render(
      <BackupRestore
        onPickFile={jest.fn().mockResolvedValue('file text')}
        onOpen={jest.fn().mockResolvedValue(data)}
        onRestore={onRestore}
        onDone={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByText('Choose backup file'));
    await fireEvent.changeText(await screen.findByLabelText('Backup passphrase'), 'long enough');
    await fireEvent.press(screen.getByText('Open backup'));

    expect(await screen.findByText(/^2 period days from /)).toBeTruthy();
    expect(screen.getByText('Restoring replaces everything that is in the app now.')).toBeTruthy();
    expect(onRestore).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('Replace my data'));
    expect(onRestore).toHaveBeenCalledWith(data);
    expect(await screen.findByText('Restored')).toBeTruthy();
  });

  it('explains a wrong passphrase calmly and lets her try again', async () => {
    await render(
      <BackupRestore
        onPickFile={jest.fn().mockResolvedValue('file text')}
        onOpen={jest.fn().mockRejectedValue(new BackupError('wrong-passphrase'))}
        onRestore={jest.fn()}
        onDone={jest.fn()}
      />,
    );
    await fireEvent.press(screen.getByText('Choose backup file'));
    await fireEvent.changeText(await screen.findByLabelText('Backup passphrase'), 'nope nope');
    await fireEvent.press(screen.getByText('Open backup'));
    expect(await screen.findByText(/doesn't open this backup/)).toBeTruthy();
    expect(screen.getByText('Open backup')).toBeTruthy();
  });
});
