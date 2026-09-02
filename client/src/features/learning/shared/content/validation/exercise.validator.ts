import { Exercise, ExerciseType } from '../content.models';
import { hasText, hasTextArray, isRecord } from './validation-primitives';

const EXERCISE_TYPES = new Set<ExerciseType>([
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
]);

export function validateExercise(exercise: unknown, seenIds: Set<string>): Exercise {
  if (
    !isRecord(exercise) ||
    !hasText(exercise['id']) ||
    !hasText(exercise['type']) ||
    !hasText(exercise['prompt']) ||
    !hasText(exercise['instruction']) ||
    !hasText(exercise['explanation']) ||
    !Array.isArray(exercise['acceptedAnswers']) ||
    exercise['acceptedAnswers'].length === 0 ||
    !hasTextArray(exercise['requiredSkills']) ||
    exercise['requiredSkills'].length === 0 ||
    !hasTextArray(exercise['vocabulary'])
  ) {
    throw new Error('An exercise is missing required grading information.');
  }
  if (!EXERCISE_TYPES.has(exercise['type'] as ExerciseType)) {
    throw new Error(`Unsupported exercise type: ${exercise['type']}`);
  }
  validateInteractionData(exercise);
  validateDiagnostics(exercise);
  validateSentenceExplanation(exercise);
  validateTransformationPrompt(exercise);
  if (seenIds.has(exercise['id'])) {
    throw new Error(`Duplicate exercise id: ${exercise['id']}`);
  }
  seenIds.add(exercise['id']);
  return exercise as unknown as Exercise;
}

function validateTransformationPrompt(exercise: Record<string, unknown>): void {
  const prompt = exercise['prompt'] as string;
  const arrowIndex = prompt.indexOf('→');
  if (arrowIndex === -1) return;
  const source = prompt.slice(0, arrowIndex);
  const target = prompt.slice(arrowIndex + 1);
  if (!/“[^”]+”/.test(source) || !/“[^”]+”/.test(target)) {
    throw new Error(
      `Transformation exercise ${exercise['id']} must label both forms with English meanings.`,
    );
  }
}

function validateInteractionData(exercise: Record<string, unknown>): void {
  if (exercise['type'] === 'multiple-choice') {
    if (!Array.isArray(exercise['options'])) {
      throw new Error(`Multiple-choice exercise ${exercise['id']} has no options.`);
    }
    const optionFeedback = exercise['optionFeedback'];
    if (
      !isRecord(optionFeedback) ||
      exercise['options'].some((option) => !hasText(option) || !hasText(optionFeedback[option]))
    ) {
      throw new Error(`Multiple-choice exercise ${exercise['id']} has incomplete option feedback.`);
    }
  }
  if (exercise['type'] === 'word-order' && !Array.isArray(exercise['tokens'])) {
    throw new Error(`Word-order exercise ${exercise['id']} has no tokens.`);
  }
  if (!Array.isArray(exercise['tags'])) {
    throw new Error(`Exercise ${exercise['id']} has no valid tags.`);
  }
}

function validateDiagnostics(exercise: Record<string, unknown>): void {
  if (
    exercise['answerDiagnostics'] !== undefined &&
    (!Array.isArray(exercise['answerDiagnostics']) ||
      exercise['answerDiagnostics'].some(
        (item) =>
          !isRecord(item) ||
          !hasTextArray(item['answers']) ||
          item['answers'].length === 0 ||
          !hasText(item['category']) ||
          !hasText(item['explanation']),
      ))
  ) {
    throw new Error(`Exercise ${exercise['id']} has invalid typed-answer diagnostics.`);
  }
}

function validateSentenceExplanation(exercise: Record<string, unknown>): void {
  const tags = exercise['tags'] as unknown[];
  if (!tags.includes('sentence')) return;
  const sentence = exercise['sentenceExplanation'];
  if (
    !isRecord(sentence) ||
    !hasText(sentence['translation']) ||
    !hasText(sentence['pattern']) ||
    !Array.isArray(sentence['parts']) ||
    sentence['parts'].length < 2 ||
    sentence['parts'].some(
      (part) =>
        !isRecord(part) ||
        !hasText(part['finnish']) ||
        !hasText(part['meaning']) ||
        !hasText(part['role']) ||
        !hasText(part['baseForm']) ||
        !hasText(part['formation']),
    )
  ) {
    throw new Error(`Sentence exercise ${exercise['id']} has an incomplete explanation.`);
  }
  if (
    exercise['type'] !== 'translation-en' &&
    !promptContainsMeaning(exercise['prompt'] as string, sentence['translation'] as string)
  ) {
    throw new Error(
      `Sentence construction exercise ${exercise['id']} must show its complete English meaning before submission.`,
    );
  }
}

function promptContainsMeaning(prompt: string, meaning: string): boolean {
  const normalizedMeaning = meaning
    .trim()
    .replace(/[.!?]+$/u, '')
    .toLocaleLowerCase('en');
  return prompt.toLocaleLowerCase('en').includes(normalizedMeaning);
}
