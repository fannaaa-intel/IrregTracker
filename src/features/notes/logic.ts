// Daily notes: one short free-text line per day ("stressed at work", "new medicine").
// Pure. Note text is health data: never log it (CLAUDE.md §1.3).

/** Long enough for a few sentences, short enough to stay a note. */
export const NOTE_MAX_LENGTH = 500;
/** Show the remaining characters once she gets close to the limit. */
export const NOTE_COUNTER_FROM = 400;

/** The text to store: trimmed and capped, or null when there's nothing left (deletes the note). */
export function normalizeNote(text: string): string | null {
  const trimmed = text.trim().slice(0, NOTE_MAX_LENGTH).trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** "120 characters left", or null while far from the limit. */
export function remainingText(text: string): string | null {
  if (text.length < NOTE_COUNTER_FROM) return null;
  const left = Math.max(NOTE_MAX_LENGTH - text.length, 0);
  return `${left} character${left === 1 ? '' : 's'} left`;
}
