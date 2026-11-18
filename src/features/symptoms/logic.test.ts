import { isSymptom, SYMPTOMS, symptomLabel, symptomList, toggleSymptom } from './logic';

describe('symptoms', () => {
  it('lists the ones she asked for first', () => {
    expect(SYMPTOMS.slice(0, 3)).toEqual(['cramps', 'back-pain', 'bloating']);
    expect(SYMPTOMS.every((s) => symptomLabel[s].length > 0)).toBe(true);
  });

  it('toggles on and off and keeps display order', () => {
    const one = toggleSymptom([], 'bloating');
    const two = toggleSymptom(one, 'cramps');
    expect(two).toEqual(['cramps', 'bloating']);
    expect(toggleSymptom(two, 'cramps')).toEqual(['bloating']);
  });

  it('recognises only known types', () => {
    expect(isSymptom('cramps')).toBe(true);
    expect(isSymptom('something-else')).toBe(false);
  });

  it('reads as a natural list', () => {
    expect(symptomList([])).toBe('');
    expect(symptomList(['cramps'])).toBe('cramps');
    expect(symptomList(['cramps', 'bloating'])).toBe('cramps and bloating');
    expect(symptomList(['cramps', 'back-pain', 'acne'])).toBe('cramps, back pain and acne');
  });
});
