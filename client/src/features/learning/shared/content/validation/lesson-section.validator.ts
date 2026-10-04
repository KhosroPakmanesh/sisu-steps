import { Lesson } from '../lesson.models';

export function validateLessonSectionResponsibilities(lesson: Lesson): void {
  const vocabulary = [
    ...lesson.introducedVocabulary,
    ...lesson.reusedVocabulary,
    ...lesson.suppliedVocabulary,
  ];
  for (const section of lesson.sections) {
    const repeatedWords = new Set<string>();
    for (const line of [...section.paragraphs, ...section.keyPoints]) {
      const pair = line.split(/\s+[—–-]\s+/u);
      if (pair.length !== 2) continue;
      for (const item of vocabulary) {
        if (
          normalizeEntry(pair[0]) === normalizeEntry(item.finnish) &&
          normalizeEntry(pair[1]) === normalizeEntry(item.english)
        ) {
          repeatedWords.add(item.finnish);
        }
      }
    }
    // Two distinct lexical entries establish a list; contextual sentences and form maps differ.
    if (repeatedWords.size >= 2) {
      throw new Error(
        `Lesson ${lesson.id} repeats its vocabulary list in grammar section ${section.title}.`,
      );
    }
  }
}

function normalizeEntry(value: string): string {
  return value
    .split(';')[0]
    .trim()
    .replace(/[.!?]+$/u, '')
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase('fi-FI');
}
