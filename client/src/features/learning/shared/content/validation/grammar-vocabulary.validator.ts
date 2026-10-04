import { Exercise } from '../exercise.models';
import { Lesson } from '../lesson.models';

export function validateGrammarBaseForms(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    value.some(
      (word) =>
        typeof word !== 'string' || !word.trim() || word !== word.trim() || /\s/u.test(word),
    ) ||
    new Set(value.map(normalize)).size !== value.length
  ) {
    throw new Error('The exercise pack must declare unique one-word grammar base forms.');
  }
  return value;
}

export function collectGrammarForms(
  exercises: readonly Exercise[],
  grammarBaseForms: readonly string[],
): Set<string> {
  const bases = new Set(grammarBaseForms.map(normalize));
  const forms = new Set(bases);
  for (const exercise of exercises) {
    for (const part of exercise.sentenceExplanation?.parts ?? []) {
      const baseWords = part.baseForm
        .toLocaleLowerCase('fi-FI')
        .split(/[\s+,;/]+/u)
        .filter(Boolean);
      const surfaceWords = part.finnish.toLocaleLowerCase('fi-FI').match(/[\p{L}\p{N}]+/gu) ?? [];
      // Only explicit one-to-one relationships establish a grammar surface.
      if (baseWords.length !== surfaceWords.length) continue;
      for (const [index, base] of baseWords.entries()) {
        if (bases.has(base)) forms.add(surfaceWords[index]);
      }
    }
  }
  return forms;
}

export function validateGrammarVocabulary(
  lessons: readonly Lesson[],
  exercises: readonly Exercise[],
  grammarBaseForms: readonly string[],
): void {
  const forms = collectGrammarForms(exercises, grammarBaseForms);
  for (const lesson of lessons) {
    for (const category of [
      'introducedVocabulary',
      'reusedVocabulary',
      'suppliedVocabulary',
    ] as const) {
      for (const item of lesson[category]) {
        if (forms.has(normalize(item.finnish))) {
          throw new Error(
            `${lesson.id}: grammar form ${item.finnish} must not appear in ${category}`,
          );
        }
      }
    }
  }
  for (const exercise of exercises) {
    for (const word of exercise.vocabulary) {
      if (forms.has(normalize(word))) {
        throw new Error(`${exercise.id}: grammar form ${word} must not appear in vocabulary`);
      }
    }
  }
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('fi-FI');
}
