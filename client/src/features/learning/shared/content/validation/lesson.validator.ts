import { Lesson } from '../content.models';
import { validateExercise } from './exercise.validator';
import { hasText, isRecord, validateStage } from './validation-primitives';

export function validateLessons(lessons: unknown[], seenIds: Set<string>): Lesson[] {
  const lessonIds = new Set<string>();
  const availableSkills = new Set<string>();
  const availableVocabulary = new Set<string>();
  const validated: Lesson[] = [];

  for (const candidate of lessons) {
    const lesson = validateLessonShape(candidate);
    validateStage(candidate as Record<string, unknown>, `Lesson ${lesson.id}`);
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
    validateTeachingContent(lesson);
    validatePractice(lesson, seenIds, availableVocabulary);
    lesson.targetSkills.forEach((skill) => availableSkills.add(skill));
    lesson.introducedVocabulary.forEach((item) => availableVocabulary.add(item.finnish));
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
    value['introducedVocabulary'].some(
      (item) => !isRecord(item) || !hasText(item['finnish']) || !hasText(item['english']),
    )
  ) {
    throw new Error('A lesson is missing required teaching information.');
  }
  return value as unknown as Lesson;
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

function validatePractice(
  lesson: Lesson,
  seenIds: Set<string>,
  availableVocabulary: Set<string>,
): void {
  const declaredSkills = new Set([...lesson.targetSkills, ...lesson.prerequisiteSkills]);
  const lessonVocabulary = new Set([
    ...availableVocabulary,
    ...lesson.introducedVocabulary.map((item) => item.finnish),
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
        `Exercise ${exercise.id} uses vocabulary not introduced for lesson ${lesson.id}.`,
      );
    }
  }
}
