export function validateLessonVocabularyVisibility(lessons: readonly unknown[]): string[];
export function validateVocabularyItemTypes(lessons: readonly unknown[]): string[];
export function validateExerciseEditorialQuality(exercises: readonly unknown[]): string[];
export function validateExerciseVocabularyCoverage(
  exercises: readonly unknown[],
  grammarBaseForms: readonly string[],
): string[];
