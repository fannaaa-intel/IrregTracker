// Daily symptoms (her feedback: "cramps, back pain, bloating etc."). Pure.
// The list follows the most common period and premenstrual symptoms (docs/HEALTH_RULES.md).
// Logging a symptom is just a note for her: the app never interprets or diagnoses it.

export type Symptom =
  | 'cramps'
  | 'back-pain'
  | 'bloating'
  | 'headache'
  | 'tender-breasts'
  | 'acne'
  | 'tired'
  | 'mood-changes'
  | 'nausea'
  | 'cravings'
  | 'trouble-sleeping'
  | 'digestion';

/** Display order: the ones she named first. */
export const SYMPTOMS: readonly Symptom[] = [
  'cramps',
  'back-pain',
  'bloating',
  'headache',
  'tender-breasts',
  'acne',
  'tired',
  'mood-changes',
  'nausea',
  'cravings',
  'trouble-sleeping',
  'digestion',
];

export const symptomLabel: Record<Symptom, string> = {
  cramps: 'Cramps',
  'back-pain': 'Back pain',
  bloating: 'Bloating',
  headache: 'Headache',
  'tender-breasts': 'Tender breasts',
  acne: 'Acne',
  tired: 'Tired',
  'mood-changes': 'Mood changes',
  nausea: 'Nausea',
  cravings: 'Cravings',
  'trouble-sleeping': 'Trouble sleeping',
  digestion: 'Upset stomach',
};

export function isSymptom(value: string): value is Symptom {
  return (SYMPTOMS as readonly string[]).includes(value);
}

/** Adds the symptom if missing, removes it if present. Keeps display order. */
export function toggleSymptom(current: readonly Symptom[], symptom: Symptom): Symptom[] {
  const next = new Set(current);
  if (next.has(symptom)) next.delete(symptom);
  else next.add(symptom);
  return SYMPTOMS.filter((s) => next.has(s));
}

/** Screen-reader / summary text, e.g. "cramps and bloating" or "cramps, bloating and acne". */
export function symptomList(symptoms: readonly Symptom[]): string {
  const words = symptoms.map((s) => symptomLabel[s].toLowerCase());
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}
