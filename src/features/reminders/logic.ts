// Kind notes planning (pure: no clock, no notifications API). The scheduler turns the plan into
// local notifications; nothing here touches the network (CLAUDE.md §1.1).
import { addDays, diffDays, type LocalDate } from '../../lib/date';
import { KIND_NOTES } from './phrases';

/** Times she can pick (hour of day on the phone's clock). */
export const KIND_NOTE_HOURS = [8, 12, 18, 21] as const;
export const DEFAULT_KIND_NOTE_HOUR = 8;
/** How many days are scheduled ahead; topped up each time the app opens. */
export const KIND_NOTE_DAYS_AHEAD = 14;
const ID_PREFIX = 'kind-note-';
const EPOCH: LocalDate = '2026-01-01';

export type KindNoteSettings = { enabled: boolean; hour: number };
export const DEFAULT_KIND_NOTES: KindNoteSettings = {
  enabled: false,
  hour: DEFAULT_KIND_NOTE_HOUR,
};

export type PlannedNote = { id: string; date: LocalDate; hour: number; body: string };

/** A fixed shuffle of the phrase list (seeded LCG), so the order feels random but is stable. */
function shuffledOrder(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  let seed = 20261118;
  for (let i = length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const ORDER = shuffledOrder(KIND_NOTES.length);

/** The phrase for a given day. Every phrase appears once before any repeats. */
export function phraseForDay(date: LocalDate): string {
  const n = KIND_NOTES.length;
  const index = ((diffDays(date, EPOCH) % n) + n) % n;
  return KIND_NOTES[ORDER[index]];
}

export function kindNoteId(date: LocalDate): string {
  return `${ID_PREFIX}${date}`;
}

export function isKindNoteId(id: string): boolean {
  return id.startsWith(ID_PREFIX);
}

/**
 * The notes to schedule from now on: starting today if the chosen hour hasn't passed yet,
 * otherwise tomorrow. Empty when turned off.
 */
export function planKindNotes(
  settings: KindNoteSettings,
  now: { date: LocalDate; hour: number; minute: number },
  days: number = KIND_NOTE_DAYS_AHEAD,
): PlannedNote[] {
  if (!settings.enabled) return [];
  const startsToday = now.hour < settings.hour;
  const first = startsToday ? now.date : addDays(now.date, 1);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(first, i);
    return { id: kindNoteId(date), date, hour: settings.hour, body: phraseForDay(date) };
  });
}

/** Reads stored settings defensively; anything unexpected falls back to the defaults. */
export function normalizeKindNotes(value: unknown): KindNoteSettings {
  if (typeof value !== 'object' || value === null) return DEFAULT_KIND_NOTES;
  const { enabled, hour } = value as Record<string, unknown>;
  return {
    enabled: enabled === true,
    hour: KIND_NOTE_HOURS.some((h) => h === hour) ? (hour as number) : DEFAULT_KIND_NOTE_HOUR,
  };
}
