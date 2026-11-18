// Kind notes planning (pure: no clock, no notifications API). The scheduler turns the plan into
// local notifications; nothing here touches the network (CLAUDE.md §1.1).
import { addDays, diffDays, type LocalDate } from '../../lib/date';
import { KIND_NOTES } from './phrases';

/** 'surprise' = a different moment each evening, 8:00 PM – 11:59 PM (same window as updates). */
export type KindNoteTime = 'surprise' | 8 | 12 | 18;
export const KIND_NOTE_TIMES: readonly KindNoteTime[] = ['surprise', 8, 12, 18];
export const SURPRISE_WINDOW = { fromHour: 20, toHour: 24 } as const;
/** How many days are scheduled ahead; topped up each time the app opens. */
export const KIND_NOTE_DAYS_AHEAD = 14;
const ID_PREFIX = 'kind-note-';
const EPOCH: LocalDate = '2026-01-01';

export type KindNoteSettings = { enabled: boolean; time: KindNoteTime };
/** On by default: the notes are meant to arrive as a surprise. She can turn them off in Settings. */
export const DEFAULT_KIND_NOTES: KindNoteSettings = { enabled: true, time: 'surprise' };

export type PlannedNote = {
  id: string;
  date: LocalDate;
  hour: number;
  minute: number;
  body: string;
};

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
const dayNumber = (date: LocalDate) => diffDays(date, EPOCH);
const mod = (a: number, n: number) => ((a % n) + n) % n;

/** The phrase for a given day. Every phrase appears once before any repeats. */
export function phraseForDay(date: LocalDate): string {
  return KIND_NOTES[ORDER[mod(dayNumber(date), KIND_NOTES.length)]];
}

/** When the note for `date` arrives. Surprise times are stable per date, so rescheduling keeps them. */
export function noteTimeFor(date: LocalDate, time: KindNoteTime): { hour: number; minute: number } {
  if (time !== 'surprise') return { hour: time, minute: 0 };
  const span = (SURPRISE_WINDOW.toHour - SURPRISE_WINDOW.fromHour) * 60;
  const offset = mod(Math.imul(dayNumber(date) + 7919, 2654435761) >>> 7, span);
  return { hour: SURPRISE_WINDOW.fromHour + Math.floor(offset / 60), minute: offset % 60 };
}

export function kindNoteId(date: LocalDate): string {
  return `${ID_PREFIX}${date}`;
}

export function isKindNoteId(id: string): boolean {
  return id.startsWith(ID_PREFIX);
}

/**
 * The notes to schedule from now on: today's if its time is still ahead, then one a day.
 * Empty when turned off.
 */
export function planKindNotes(
  settings: KindNoteSettings,
  now: { date: LocalDate; hour: number; minute: number },
  days: number = KIND_NOTE_DAYS_AHEAD,
): PlannedNote[] {
  if (!settings.enabled) return [];
  const today = noteTimeFor(now.date, settings.time);
  const stillAhead = now.hour * 60 + now.minute < today.hour * 60 + today.minute;
  const first = stillAhead ? now.date : addDays(now.date, 1);
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(first, i);
    return {
      id: kindNoteId(date),
      date,
      ...noteTimeFor(date, settings.time),
      body: phraseForDay(date),
    };
  });
}

/** Reads stored settings defensively; anything unexpected falls back to the defaults. */
export function normalizeKindNotes(value: unknown): KindNoteSettings {
  if (typeof value !== 'object' || value === null) return DEFAULT_KIND_NOTES;
  const { enabled, time } = value as Record<string, unknown>;
  return {
    enabled: typeof enabled === 'boolean' ? enabled : DEFAULT_KIND_NOTES.enabled,
    time: KIND_NOTE_TIMES.find((t) => t === time) ?? DEFAULT_KIND_NOTES.time,
  };
}
