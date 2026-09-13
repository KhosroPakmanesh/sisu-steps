import { Lesson, VocabularyItem } from '../content.models';
import { validateExercise } from './exercise.validator';
import {
  collectKnownVocabulary,
  validateVocabularyVisibility,
} from './lesson-vocabulary.validator';
import { hasText, isRecord, validateStage } from './validation-primitives';

export function validateLessons(lessons: unknown[], seenIds: Set<string>): Lesson[] {
  const lessonIds = new Set<string>();
  const availableSkills = new Set<string>();
  const validated: Lesson[] = [];
  const shapedLessons = lessons.map(validateLessonShape);
  const knownVocabulary = collectKnownVocabulary(shapedLessons);

  for (const lesson of shapedLessons) {
    validateStage(lesson as unknown as Record<string, unknown>, `Lesson ${lesson.id}`);
    if (lesson.stage === 'focused' && lesson.introducedVocabulary.length > 10) {
      throw new Error(`Focused lesson ${lesson.id} introduces more than ten words.`);
    }
    if (lesson.prerequisiteSkills.some((skill) => !availableSkills.has(skill))) {
      throw new Error(
        `Lesson ${lesson.id} uses a prerequisite skill that has not been introduced.`,
      );
    }
    if (lessonIds.has(lesson.id)) throw new Error(`Duplicate lesson id: ${lesson.id}`);
    lessonIds.add(lesson.id);
    const prerequisiteVocabulary = vocabularyForSkills(lesson.prerequisiteSkills, validated);
    validateVocabulary(lesson, prerequisiteVocabulary);
    validateTeachingContent(lesson);
    validateVocabularyVisibility(lesson, knownVocabulary);
    validatePractice(lesson, seenIds);
    lesson.targetSkills.forEach((skill) => availableSkills.add(skill));
    validated.push(lesson);
  }
  return validated;
}

function validateLessonShape(value: unknown): Lesson {
  if (
    !isRecord(value) ||
    !hasText(value['id']) ||
    !hasText(value['version']) ||
    !hasText(value['title']) ||
    !hasText(value['summary']) ||
    !Array.isArray(value['objectives']) ||
    value['objectives'].length === 0 ||
    !value['objectives'].every(hasText) ||
    !Array.isArray(value['sections']) ||
    value['sections'].length === 0 ||
    !Array.isArray(value['examples']) ||
    value['examples'].length === 0 ||
    !Array.isArray(value['commonMistakes']) ||
    value['commonMistakes'].length === 0 ||
    !value['commonMistakes'].every(hasText) ||
    !Array.isArray(value['practiceExercises']) ||
    value['practiceExercises'].length < 2 ||
    value['practiceExercises'].length > 5 ||
    !Array.isArray(value['introducedVocabulary']) ||
    value['introducedVocabulary'].some((item) => !isVocabularyItem(item)) ||
    !Array.isArray(value['reusedVocabulary']) ||
    value['reusedVocabulary'].some((item) => !isVocabularyItem(item)) ||
    !Array.isArray(value['suppliedVocabulary']) ||
    value['suppliedVocabulary'].some((item) => !isVocabularyItem(item))
  ) {
    throw new Error('A lesson is missing required teaching information.');
  }
  return value as unknown as Lesson;
}

function isVocabularyItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasText(value['finnish']) &&
    hasText(value['english']) &&
    (value['type'] === 'word' || value['type'] === 'fixed-expression')
  );
}

function vocabularyForSkills(skills: string[], lessons: Lesson[]): Map<string, VocabularyItem[]> {
  const vocabulary = new Map<string, VocabularyItem[]>();
  const visited = new Set<string>();
  const pending = [...skills];

  while (pending.length > 0) {
    const skill = pending.pop()!;
    if (visited.has(skill)) continue;
    visited.add(skill);
    for (const lesson of lessons.filter((candidate) => candidate.targetSkills.includes(skill))) {
      for (const item of lesson.introducedVocabulary) {
        vocabulary.set(item.finnish, [...(vocabulary.get(item.finnish) ?? []), item]);
      }
      pending.push(...lesson.prerequisiteSkills);
    }
  }
  return vocabulary;
}

function validateVocabulary(
  lesson: Lesson,
  prerequisiteVocabulary: Map<string, VocabularyItem[]>,
): void {
  const categories = [
    ...lesson.introducedVocabulary,
    ...lesson.reusedVocabulary,
    ...lesson.suppliedVocabulary,
  ];
  for (const item of categories) {
    const containsWhitespace = /\s/u.test(item.finnish);
    if (item.type === 'word' && containsWhitespace) {
      throw new Error(
        `Lesson ${lesson.id} declares multiword vocabulary ${item.finnish} as a word.`,
      );
    }
    const writtenWordCount = item.finnish.trim().split(/\s+/u).length;
    if (
      item.type === 'fixed-expression' &&
      (item.finnish !== item.finnish.trim() || writtenWordCount < 2)
    ) {
      throw new Error(
        `Lesson ${lesson.id} declares one-word vocabulary ${item.finnish} as a fixed expression.`,
      );
    }
  }
  if (new Set(categories.map((item) => item.finnish)).size !== categories.length) {
    throw new Error(`Lesson ${lesson.id} repeats vocabulary across its categories.`);
  }
  for (const item of lesson.reusedVocabulary) {
    const priorEntries = prerequisiteVocabulary.get(item.finnish) ?? [];
    if (!priorEntries.some((prior) => prior.english === item.english && prior.type === item.type)) {
      throw new Error(
        `Lesson ${lesson.id} reuses vocabulary outside its declared prerequisite chain.`,
      );
    }
  }
}

function validateTeachingContent(lesson: Lesson): void {
  for (const section of lesson.sections) {
    if (
      !hasText(section.title) ||
      section.paragraphs.length === 0 ||
      !section.paragraphs.every(hasText) ||
      section.keyPoints.length === 0 ||
      !section.keyPoints.every(hasText)
    ) {
      throw new Error(`Lesson ${lesson.id} has an incomplete section.`);
    }
  }
  for (const example of lesson.examples) {
    if (
      !hasText(example.finnish) ||
      !hasText(example.english) ||
      example.steps.length === 0 ||
      !example.steps.every(hasText)
    ) {
      throw new Error(`Lesson ${lesson.id} has an incomplete example.`);
    }
  }
}

function validatePractice(lesson: Lesson, seenIds: Set<string>): void {
  const declaredSkills = new Set([...lesson.targetSkills, ...lesson.prerequisiteSkills]);
  const lessonVocabulary = new Set([
    ...lesson.introducedVocabulary.map((item) => item.finnish),
    ...lesson.reusedVocabulary.map((item) => item.finnish),
  ]);
  for (const candidate of lesson.practiceExercises) {
    if (!candidate.tags?.includes('lesson-practice')) {
      throw new Error(`Lesson ${lesson.id} has an exercise that is not marked as practice.`);
    }
    const exercise = validateExercise(candidate, seenIds);
    if (exercise.requiredSkills.some((skill) => !declaredSkills.has(skill))) {
      throw new Error(`Exercise ${exercise.id} requires a skill outside lesson ${lesson.id}.`);
    }
    if (exercise.vocabulary.some((word) => !lessonVocabulary.has(word))) {
      throw new Error(
        `Exercise ${exercise.id} uses vocabulary not declared for lesson ${lesson.id}.`,
      );
    }
  }
}
