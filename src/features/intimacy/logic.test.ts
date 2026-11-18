import {
  EMERGENCY_TIP,
  FERTILE_DAY_NOTE,
  isProtection,
  SAFER_SEX_TIP,
  saferSexNotes,
} from './logic';

const fertile = { start: '2026-11-03', end: '2026-11-12' };

describe('saferSexNotes', () => {
  it('always ends with the condom tip', () => {
    expect(saferSexNotes('2026-11-20', 'protected', fertile)).toEqual([SAFER_SEX_TIP]);
  });

  it('adds the emergency contraception note when unprotected', () => {
    expect(saferSexNotes('2026-11-20', 'unprotected', fertile)).toEqual([
      EMERGENCY_TIP,
      SAFER_SEX_TIP,
    ]);
    expect(saferSexNotes('2026-11-20', 'unprotected', null)).toEqual([
      EMERGENCY_TIP,
      SAFER_SEX_TIP,
    ]);
  });

  it('mentions possible fertile days only inside them (both ends)', () => {
    expect(saferSexNotes('2026-11-02', 'unprotected', fertile)[0]).toBe(EMERGENCY_TIP);
    expect(saferSexNotes('2026-11-03', 'unprotected', fertile)[0]).toBe(FERTILE_DAY_NOTE);
    expect(saferSexNotes('2026-11-12', 'unprotected', fertile)[0]).toBe(FERTILE_DAY_NOTE);
    expect(saferSexNotes('2026-11-13', 'unprotected', fertile)[0]).toBe(EMERGENCY_TIP);
  });

  it('stays calm: no exclamation marks, no blame words', () => {
    for (const text of [SAFER_SEX_TIP, EMERGENCY_TIP, FERTILE_DAY_NOTE]) {
      expect(text).not.toMatch(/!|should have|risky|careless/i);
    }
  });

  it('recognises only known protection values', () => {
    expect(isProtection('protected')).toBe(true);
    expect(isProtection('maybe')).toBe(false);
  });
});
