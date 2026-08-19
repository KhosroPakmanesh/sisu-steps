import { Exercise, GradingResult } from '../content/content.models';

export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/g, '')
    .trim()
    .toLocaleLowerCase('fi-FI');
}

export function gradeAnswer(exercise: Exercise, submittedAnswer: string): GradingResult {
  const normalizedAnswer = normalizeAnswer(submittedAnswer);
  const matchedAnswer = exercise.acceptedAnswers.find(
    (answer) => normalizeAnswer(answer) === normalizedAnswer,
  );
  const correct = matchedAnswer !== undefined;
  const diagnostic = correct
    ? undefined
    : exercise.answerDiagnostics?.find((item) =>
        item.answers.some((answer) => normalizeAnswer(answer) === normalizedAnswer),
      );
  const optionExplanation = correct
    ? undefined
    : Object.entries(exercise.optionFeedback ?? {}).find(
        ([answer]) => normalizeAnswer(answer) === normalizedAnswer,
      )?.[1];

  return {
    correct,
    normalizedAnswer,
    expectedAnswer: exercise.acceptedAnswers[0] ?? '',
    misconceptionCategory: correct
      ? undefined
      : (diagnostic?.category ?? exercise.misconceptionCategory),
    diagnosticExplanation: correct
      ? undefined
      : (diagnostic?.explanation ?? optionExplanation ?? exercise.explanation),
  };
}
