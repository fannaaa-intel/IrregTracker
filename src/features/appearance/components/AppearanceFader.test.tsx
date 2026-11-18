import { act, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Appearance, Text } from 'react-native';

import { requestAppearance, useAppearanceChoice, useFadeRequest } from '../store';
import { AppearanceFader } from './AppearanceFader';

function Probe() {
  const choice = useAppearanceChoice();
  const fade = useFadeRequest();
  return <Text>{`${choice}|${fade === null ? 'idle' : 'fading'}`}</Text>;
}

describe('AppearanceFader', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Appearance, 'setColorScheme').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.each([
    ['with animation', false],
    ['with Reduce motion', true],
  ])('switches the theme and finishes (%s)', async (_, reduce) => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(reduce);
    await render(
      <>
        <AppearanceFader />
        <Probe />
      </>,
    );
    const target = reduce ? 'light' : 'dark';
    await act(async () => {
      requestAppearance(target, '#FFF8FA');
    });
    if (!reduce) {
      // A second tap mid-switch is ignored, so the transition never restarts halfway.
      await act(async () => {
        requestAppearance('system', '#FFF8FA');
      });
    }
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(Appearance.setColorScheme).toHaveBeenCalledWith(target);
    expect(Appearance.setColorScheme).not.toHaveBeenCalledWith('unspecified');
    expect(screen.getByText(`${target}|idle`)).toBeTruthy();
  });
});
