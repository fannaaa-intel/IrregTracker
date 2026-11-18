import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemeColors } from '@/theme';

import { useAppLockGate } from '../hooks';
import { LockScreen } from './LockScreen';

/**
 * Wraps the app inside the database provider. The app stays mounted underneath (so navigation
 * isn't lost) but is hidden from touch and screen readers while locked.
 */
export function AppLockGate({ children }: { children: ReactNode }) {
  const colors = useThemeColors();
  const { state, unlock } = useAppLockGate();
  const covered = state !== 'open';

  return (
    <View style={styles.fill}>
      <View
        style={styles.fill}
        pointerEvents={covered ? 'none' : 'auto'}
        importantForAccessibility={covered ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={covered}
      >
        {children}
      </View>
      {state === 'checking' ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      ) : null}
      {state === 'locked' ? <LockScreen onUnlock={() => void unlock()} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
