import { Lesson } from '../lesson.models';

export function collectKnownVocabulary(lessons: Lesson[]): Set<string> {
  return new Set(
    lessons.flatMap((lesson) =>
      [
        ...lesson.introducedVocabulary,
        ...lesson.reusedVocabulary,
        ...lesson.suppliedVocabulary,
      ].map((item) => item.finnish),
    ),
  );
}

export function validateVocabularyVisibility(lesson: Lesson, knownVocabulary: Set<string>): void {
  const declaredHere = new Set(
    [...lesson.introducedVocabulary, ...lesson.reusedVocabulary, ...lesson.suppliedVocabulary].map(
      (item) => normalizeFinnish(item.finnish),
    ),
  );
  const workedExamples = lesson.examples.map((example) => example.finnish).join('\n');
  const uncoveredWorkedExamples = [
    ...lesson.introducedVocabulary,
    ...lesson.reusedVocabulary,
    ...lesson.suppliedVocabulary,
  ]
    .filter((item) => item.type === 'fixed-expression')
    .reduce((text, item) => maskItem(text, item.finnish), workedExamples);

  for (const item of knownVocabulary) {
    if (!declaredHere.has(normalizeFinnish(item)) && containsItem(uncoveredWorkedExamples, item)) {
      throw new Error(
        `Lesson ${lesson.id} uses vocabulary ${item} in a worked example without classifying it.`,
      );
    }
  }

  const teachingText = collectStrings({
    title: lesson.title,
    summary: lesson.summary,
    objectives: lesson.objectives,
    sections: lesson.sections,
    examples: lesson.examples,
    commonMistakes: lesson.commonMistakes,
    practiceExercises: lesson.practiceExercises,
  }).join('\n');
  for (const item of lesson.suppliedVocabulary) {
    if (!containsItem(teachingText, item.finnish) || !containsItem(teachingText, item.english)) {
      throw new Error(
        `Lesson ${lesson.id} supplies vocabulary ${item.finnish} without showing its Finnish form and English meaning in teaching.`,
      );
    }
  }
}

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value !== null && typeof value === 'object') {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

function containsItem(text: string, item: string): boolean {
  return itemPattern(item).test(text);
}

function maskItem(text: string, item: string): string {
  return text.replace(itemPattern(item, true), ' ');
}

function itemPattern(item: string, global = false): RegExp {
  const escaped = item.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, global ? 'giu' : 'iu');
}

function normalizeFinnish(value: string): string {
  return value.trim().toLocaleLowerCase('fi-FI');
}
