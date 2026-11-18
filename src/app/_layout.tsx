// Per-weight imports so only the three weights we use are bundled (not all 18 files).
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { DatabaseErrorScreen } from '@/components/DatabaseErrorScreen';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { useOpenDatabase } from '@/db/use-open-database';
import { useThemeColors } from '@/theme';

// Keep the splash screen up until fonts are loaded and the encrypted DB has opened (or failed).
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });
  const dbState = useOpenDatabase();
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const fontsReady = fontsLoaded || fontError !== null;
  const ready = fontsReady && dbState.status !== 'opening';

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
        <DatabaseErrorScreen kind={dbState.kind} />
      ) : (
        <DatabaseProvider db={dbState.db}>
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="log/[date]" options={{ presentation: 'modal' }} />
          </Stack>
        </DatabaseProvider>
      )}
    </ThemeProvider>
  );
}
