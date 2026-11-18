// Appearance state. The choice is a display preference (not health data), kept in SecureStore
// because it can be read synchronously before the first frame, so there's no flash on launch.
import * as SecureStore from 'expo-secure-store';
import { useSyncExternalStore } from 'react';
import { Appearance } from 'react-native';

import { normalizeAppearance, toColorSchemeOverride, type AppearanceChoice } from './logic';

const KEY = 'appearance';

/** A requested change, played by <AppearanceFader>; `fromBg` is the background before it. */
export type FadeRequest = { id: number; to: AppearanceChoice; fromBg: string };

let choice: AppearanceChoice = 'system';
let fade: FadeRequest | null = null;
let nextId = 1;
/** The phone's own scheme at launch, before any override (the native splash uses it). */
let phoneSchemeAtLaunch: 'light' | 'dark' | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of [...listeners]) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Called once at module load of the root layout, before anything renders. */
export function applyStoredAppearance(): void {
  const scheme = Appearance.getColorScheme();
  phoneSchemeAtLaunch = scheme === 'dark' || scheme === 'light' ? scheme : null;
  try {
    choice = normalizeAppearance(SecureStore.getItem(KEY));
  } catch {
    choice = 'system';
  }
  if (choice !== 'system') Appearance.setColorScheme(toColorSchemeOverride(choice));
}

export function getPhoneSchemeAtLaunch(): 'light' | 'dark' | null {
  return phoneSchemeAtLaunch;
}

/** Switches now (no animation); used by the fader and when motion is reduced. */
export function applyAppearance(next: AppearanceChoice): void {
  choice = next;
  Appearance.setColorScheme(toColorSchemeOverride(next));
  try {
    if (next === 'system') SecureStore.deleteItemAsync(KEY).catch(() => undefined);
    else SecureStore.setItem(KEY, next);
  } catch {
    // Not saved: the app still switches now and falls back to the phone's setting next launch.
  }
  emit();
}

/** Asks the fader to cross-fade to `next`. */
export function requestAppearance(next: AppearanceChoice, fromBg: string): void {
  if (next === choice) return;
  fade = { id: nextId++, to: next, fromBg };
  emit();
}

export function finishFade(): void {
  fade = null;
  emit();
}

export function useAppearanceChoice(): AppearanceChoice {
  return useSyncExternalStore(subscribe, () => choice);
}

export function useFadeRequest(): FadeRequest | null {
  return useSyncExternalStore(subscribe, () => fade);
}
