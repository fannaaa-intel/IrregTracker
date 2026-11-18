// Appearance choice (pure). 'system' follows the phone; light/dark override it inside the app.
export type AppearanceChoice = 'system' | 'light' | 'dark';
export type ColorSchemeOverride = 'light' | 'dark' | 'unspecified';

export const APPEARANCE_CHOICES: readonly AppearanceChoice[] = ['system', 'light', 'dark'];

export const appearanceLabel: Record<AppearanceChoice, string> = {
  system: 'Match phone',
  light: 'Light',
  dark: 'Dark',
};

/** Stored values are read defensively; anything unexpected means "match the phone". */
export function normalizeAppearance(value: unknown): AppearanceChoice {
  return APPEARANCE_CHOICES.find((c) => c === value) ?? 'system';
}

/** What React Native's Appearance.setColorScheme expects ('unspecified' = follow the phone). */
export function toColorSchemeOverride(choice: AppearanceChoice): ColorSchemeOverride {
  return choice === 'system' ? 'unspecified' : choice;
}

/** The scheme that will actually show, given the phone's own scheme. */
export function effectiveScheme(
  choice: AppearanceChoice,
  phoneScheme: 'light' | 'dark' | null | undefined,
): 'light' | 'dark' {
  if (choice !== 'system') return choice;
  return phoneScheme === 'dark' ? 'dark' : 'light';
}

/**
 * Theme switch timing (each step ≤ 250 ms, CLAUDE.md §6.7):
 * cover = old background fades over the app, dissolve = new background fades over the old one
 * (after the new theme has drawn underneath), reveal = new background fades away.
 */
export const THEME_FADE = { cover: 200, dissolve: 220, reveal: 250 } as const;
