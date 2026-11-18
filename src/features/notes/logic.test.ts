import { NOTE_COUNTER_FROM, NOTE_MAX_LENGTH, normalizeNote, remainingText } from './logic';

describe('normalizeNote', () => {
  it('trims and keeps real text', () => {
    expect(normalizeNote('  stressed at work \n')).toBe('stressed at work');
  });

  it('turns empty or blank text into null (the note is removed)', () => {
    expect(normalizeNote('')).toBeNull();
    expect(normalizeNote('   \n ')).toBeNull();
  });

  it('caps the length at the limit (boundary)', () => {
    expect(normalizeNote('a'.repeat(NOTE_MAX_LENGTH))).toHaveLength(NOTE_MAX_LENGTH);
    expect(normalizeNote('a'.repeat(NOTE_MAX_LENGTH + 1))).toHaveLength(NOTE_MAX_LENGTH);
  });
});

describe('remainingText', () => {
  it('stays quiet until close to the limit (boundary)', () => {
    expect(remainingText('a'.repeat(NOTE_COUNTER_FROM - 1))).toBeNull();
    expect(remainingText('a'.repeat(NOTE_COUNTER_FROM))).toBe('100 characters left');
    expect(remainingText('a'.repeat(NOTE_MAX_LENGTH - 1))).toBe('1 character left');
    expect(remainingText('a'.repeat(NOTE_MAX_LENGTH))).toBe('0 characters left');
  });
});
