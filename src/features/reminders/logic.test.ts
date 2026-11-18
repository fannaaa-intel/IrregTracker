import { addDays } from '../../lib/date';
import {
  DEFAULT_KIND_NOTES,
  isKindNoteId,
  KIND_NOTE_DAYS_AHEAD,
  kindNoteId,
  normalizeKindNotes,
  noteTimeFor,
  phraseForDay,
  planKindNotes,
} from './logic';
import { KIND_NOTE_TITLE, KIND_NOTES } from './phrases';

const morning = { enabled: true, time: 8 as const };

describe('noteTimeFor', () => {
  it('uses the fixed hour when one is chosen', () => {
    expect(noteTimeFor('2026-11-18', 12)).toEqual({ hour: 12, minute: 0 });
  });

  it('keeps every surprise between 8:00 PM and 11:59 PM, and stable per date', () => {
    const times = Array.from({ length: 365 }, (_, i) =>
      noteTimeFor(addDays('2026-01-01', i), 'surprise'),
    );
    for (const { hour, minute } of times) {
      expect(hour).toBeGreaterThanOrEqual(20);
      expect(hour).toBeLessThanOrEqual(23);
      expect(minute).toBeGreaterThanOrEqual(0);
      expect(minute).toBeLessThanOrEqual(59);
    }
    expect(new Set(times.map((t) => `${t.hour}:${t.minute}`)).size).toBeGreaterThan(100);
    expect(noteTimeFor('2026-12-03', 'surprise')).toEqual(noteTimeFor('2026-12-03', 'surprise'));
  });
});

describe('planKindNotes', () => {
  it('is on by default as an evening surprise', () => {
    expect(DEFAULT_KIND_NOTES).toEqual({ enabled: true, time: 'surprise' });
  });

  it('plans nothing when turned off', () => {
    const off = { ...DEFAULT_KIND_NOTES, enabled: false };
    expect(planKindNotes(off, { date: '2026-11-18', hour: 6, minute: 0 })).toEqual([]);
  });

  it("starts today only while today's time is still ahead (boundary: 7:59 vs 8:00)", () => {
    expect(planKindNotes(morning, { date: '2026-11-18', hour: 7, minute: 59 })[0].date).toBe(
      '2026-11-18',
    );
    expect(planKindNotes(morning, { date: '2026-11-18', hour: 8, minute: 0 })[0].date).toBe(
      '2026-11-19',
    );
  });

  it("compares minutes for tonight's surprise", () => {
    const tonight = noteTimeFor('2026-11-18', 'surprise');
    const before = { date: '2026-11-18', hour: tonight.hour, minute: tonight.minute - 1 };
    const at = { date: '2026-11-18', hour: tonight.hour, minute: tonight.minute };
    if (tonight.minute > 0) {
      expect(planKindNotes(DEFAULT_KIND_NOTES, before)[0].date).toBe('2026-11-18');
    }
    expect(planKindNotes(DEFAULT_KIND_NOTES, at)[0].date).toBe('2026-11-19');
  });

  it('plans one note a day, 14 days ahead, across a month end', () => {
    const plan = planKindNotes(morning, { date: '2026-11-25', hour: 20, minute: 0 });
    expect(plan).toHaveLength(KIND_NOTE_DAYS_AHEAD);
    expect(plan[0]).toMatchObject({ id: 'kind-note-2026-11-26', hour: 8, minute: 0 });
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
});

describe('kind note ids and settings', () => {
  it('recognises its own notification ids', () => {
    expect(isKindNoteId(kindNoteId('2026-11-18'))).toBe(true);
    expect(isKindNoteId('something-else')).toBe(false);
  });

  it('falls back to safe defaults for bad stored values', () => {
    expect(normalizeKindNotes(null)).toEqual(DEFAULT_KIND_NOTES);
    expect(normalizeKindNotes({ enabled: 'yes', time: 3 })).toEqual(DEFAULT_KIND_NOTES);
    expect(normalizeKindNotes({ enabled: false, time: 18 })).toEqual({ enabled: false, time: 18 });
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
