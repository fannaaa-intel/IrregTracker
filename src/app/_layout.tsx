// Per-weight imports so only the three weights we use are bundled (not all 18 files).
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { DatabaseErrorScreen } from '@/components/DatabaseErrorScreen';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { useOpenDatabase } from '@/db/use-open-database';
import { AppearanceFader } from '@/features/appearance/components/AppearanceFader';
import { applyStoredAppearance } from '@/features/appearance/store';
import { AppLockGate } from '@/features/lock/components/AppLockGate';
import { OpeningOverlay } from '@/features/opening/components/OpeningOverlay';
import { CycleRemindersSync } from '@/features/reminders/components/CycleRemindersSync';
import { KindNotesSync } from '@/features/reminders/components/KindNotesSync';
import { UpdateBanner } from '@/features/updates/components/UpdateBanner';
import { UpdateRow } from '@/features/updates/components/UpdateRow';
import { useAutoUpdateCheck, useRecoveryUpdateCheck } from '@/features/updates/hooks';
import { useReduceMotion, useThemeColors } from '@/theme';

// Keep the splash screen up until fonts are loaded and the encrypted DB has opened (or failed).
SplashScreen.preventAutoHideAsync();
// Light / dark choice applies before the first frame, so the app never flashes the wrong theme.
applyStoredAppearance();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const dbState = useOpenDatabase();
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();
  useAutoUpdateCheck();
  useRecoveryUpdateCheck(dbState.status === 'error');
  const fontsReady = fontsLoaded || fontError !== null;
  const ready = fontsReady && dbState.status !== 'opening';
  // The opening animation covers the app from the moment the native splash hides.
  const [opening, setOpening] = useState(true);
  const endOpening = useCallback(() => setOpening(false), []);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!fontsReady || dbState.status === 'opening') {
    return null;
  }

  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {dbState.status === 'error' ? (
        <DatabaseErrorScreen kind={dbState.kind}>
          <UpdateRow />
        </DatabaseErrorScreen>
      ) : (
        <DatabaseProvider db={dbState.db}>
          <AppLockGate>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                // Screens rise and fade in softly, matching the opening animation.
                animation: reduceMotion === true ? 'none' : 'fade_from_bottom',
                animationDuration: 250,
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="log/[date]" options={{ presentation: 'modal' }} />
              <Stack.Screen name="cycle/[id]" />
              <Stack.Screen name="flag/[type]" />
              <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
              <Stack.Screen name="backup/export" />
              <Stack.Screen name="backup/restore" />
            </Stack>
            <UpdateBanner />
          </AppLockGate>
          <KindNotesSync />
          <CycleRemindersSync />
        </DatabaseProvider>
      )}
      {opening ? <OpeningOverlay onDone={endOpening} /> : null}
      <AppearanceFader />
    </ThemeProvider>
  );
}
