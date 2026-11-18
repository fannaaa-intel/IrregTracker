import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Flow } from '@/theme';

import { BackfillBar } from './BackfillBar';
import { DayEditor } from './DayEditor';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderEditor(flow: Flow | null) {
  const handlers = { onSelect: jest.fn(), onClear: jest.fn(), onClose: jest.fn() };
  return { handlers, view: render(<DayEditor date="2026-12-03" flow={flow} {...handlers} />) };
}

describe('DayEditor', () => {
  it('names the day and offers the four flows', async () => {
    await renderEditor(null).view;
    expect(screen.getByRole('header', { name: /December 3/ })).toBeTruthy();
    for (const name of ['Spotting flow', 'Light flow', 'Medium flow', 'Heavy flow']) {
      expect(screen.getByRole('radio', { name })).toBeTruthy();
    }
  });

  it('saves a flow with one tap', async () => {
    const { handlers, view } = renderEditor(null);
    await view;
    await fireEvent.press(screen.getByRole('radio', { name: 'Heavy flow' }));
    expect(handlers.onSelect).toHaveBeenCalledWith('heavy');
  });

  it('shows the logged flow as checked', async () => {
    await renderEditor('light').view;
    expect(
      screen.getByRole('radio', { name: 'Light flow' }).props.accessibilityState,
    ).toMatchObject({
      checked: true,
    });
    expect(
      screen.getByRole('radio', { name: 'Medium flow' }).props.accessibilityState,
    ).toMatchObject({
      checked: false,
    });
  });

  it('offers "Not a period day" only for a logged day', async () => {
    await renderEditor(null).view;
    expect(screen.queryByRole('button', { name: 'Not a period day' })).toBeNull();

    const { handlers, view } = renderEditor('medium');
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Not a period day' }));
    expect(handlers.onClear).toHaveBeenCalledTimes(1);
  });

  it('closes without saving', async () => {
    const { handlers, view } = renderEditor(null);
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(handlers.onClose).toHaveBeenCalledTimes(1);
    expect(handlers.onSelect).not.toHaveBeenCalled();
  });
});

describe('BackfillBar', () => {
  function renderBar(selectedCount: number) {
    const handlers = { onFlowChange: jest.fn(), onSave: jest.fn(), onCancel: jest.fn() };
    const view = render(<BackfillBar selectedCount={selectedCount} flow="medium" {...handlers} />);
    return { handlers, view };
  }

  it('cannot save until a day is selected', async () => {
    const { handlers, view } = renderBar(0);
    await view;
    const save = screen.getByRole('button', { name: 'Save' });
    expect(save.props.accessibilityState).toMatchObject({ disabled: true });
    await fireEvent.press(save);
    expect(handlers.onSave).not.toHaveBeenCalled();
  });

  it('saves all selected days with the chosen flow', async () => {
    const { handlers, view } = renderBar(3);
    await view;
    expect(screen.getByText('3 days selected')).toBeTruthy();
    await fireEvent.press(screen.getByRole('radio', { name: 'Light flow' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Save 3 days' }));
    expect(handlers.onFlowChange).toHaveBeenCalledWith('light');
    expect(handlers.onSave).toHaveBeenCalledTimes(1);
  });
});
