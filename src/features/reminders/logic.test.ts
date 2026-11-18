import { addDays } from '../../lib/date';
import {
  DEFAULT_KIND_NOTES,
  isKindNoteId,
  KIND_NOTE_DAYS_AHEAD,
  kindNoteId,
  normalizeKindNotes,
  phraseForDay,
  planKindNotes,
} from './logic';
import { KIND_NOTE_TITLE, KIND_NOTES } from './phrases';

const on = { enabled: true, hour: 8 };

describe('planKindNotes', () => {
  it('plans nothing when turned off', () => {
    expect(planKindNotes(DEFAULT_KIND_NOTES, { date: '2026-11-18', hour: 6, minute: 0 })).toEqual(
      [],
    );
  });

  it('starts today when the chosen hour is still ahead (boundary: 7:59 vs 8:00)', () => {
    expect(planKindNotes(on, { date: '2026-11-18', hour: 7, minute: 59 })[0].date).toBe(
      '2026-11-18',
    );
    expect(planKindNotes(on, { date: '2026-11-18', hour: 8, minute: 0 })[0].date).toBe(
      '2026-11-19',
    );
  });

  it('plans one note a day, 14 days ahead, across a month end', () => {
    const plan = planKindNotes(on, { date: '2026-11-25', hour: 20, minute: 0 });
    expect(plan).toHaveLength(KIND_NOTE_DAYS_AHEAD);
    expect(plan[0]).toMatchObject({ id: 'kind-note-2026-11-26', date: '2026-11-26', hour: 8 });
    expect(plan[13].date).toBe('2026-12-09');
  });
});

describe('phraseForDay', () => {
  it('never repeats on two days in a row and uses every phrase once per round', () => {
    const start = '2026-11-18';
    const round = Array.from({ length: KIND_NOTES.length }, (_, i) =>
      phraseForDay(addDays(start, i)),
    );
    expect(new Set(round).size).toBe(KIND_NOTES.length);
    for (let i = 1; i < round.length + 5; i++) {
      expect(phraseForDay(addDays(start, i))).not.toBe(phraseForDay(addDays(start, i - 1)));
    }
  });

  it('is stable for a given day', () => {
    expect(phraseForDay('2026-12-03')).toBe(phraseForDay('2026-12-03'));
  });
});

describe('kind note ids and settings', () => {
  it('recognises its own notification ids', () => {
    expect(isKindNoteId(kindNoteId('2026-11-18'))).toBe(true);
    expect(isKindNoteId('something-else')).toBe(false);
  });

  it('falls back to safe defaults for bad stored values', () => {
    expect(normalizeKindNotes(null)).toEqual(DEFAULT_KIND_NOTES);
    expect(normalizeKindNotes({ enabled: 'yes', hour: 3 })).toEqual(DEFAULT_KIND_NOTES);
    expect(normalizeKindNotes({ enabled: true, hour: 21 })).toEqual({ enabled: true, hour: 21 });
  });
});

describe('phrases', () => {
  it('stay calm, discreet and gender-neutral', () => {
    for (const text of [KIND_NOTE_TITLE, ...KIND_NOTES]) {
      expect(text).not.toMatch(/!/);
      expect(text).not.toMatch(
        /period|cycle|bleed|cramp|pms|ovulat|fertil|pregnan|\bshe\b|\bher\b|boyfriend|husband|\bshould\b/i,
      );
    }
  });

  it('has no duplicates', () => {
    expect(new Set(KIND_NOTES).size).toBe(KIND_NOTES.length);
  });
});
