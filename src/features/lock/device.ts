// Device side of the app lock: fingerprint / face / phone PIN, and hiding the app in recents.
import * as LocalAuthentication from 'expo-local-authentication';
import * as ScreenCapture from 'expo-screen-capture';
import { Platform } from 'react-native';

const PROTECT_KEY = 'app-lock';

/** True when the phone has any screen lock (PIN, pattern, password or biometrics). */
export async function lockAvailable(): Promise<boolean> {
  const level = await LocalAuthentication.getEnrolledLevelAsync();
  return level >= LocalAuthentication.SecurityLevel.SECRET;
}

/** Shows the phone's own unlock prompt. Falls back to the phone PIN if biometrics fail. */
export async function authenticate(promptMessage: string): Promise<boolean> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return result.success;
}

/**
 * While the lock is on, hide the app's content in the recent-apps screen
 * (Android: FLAG_SECURE, which also blocks screenshots; iOS: a blur over the snapshot).
 */
export async function protectAppSwitcher(on: boolean): Promise<void> {
  if (on) {
    await ScreenCapture.preventScreenCaptureAsync(PROTECT_KEY);
    if (Platform.OS === 'ios') await ScreenCapture.enableAppSwitcherProtectionAsync(1);
  } else {
    await ScreenCapture.allowScreenCaptureAsync(PROTECT_KEY);
    if (Platform.OS === 'ios') await ScreenCapture.disableAppSwitcherProtectionAsync();
  }
}
