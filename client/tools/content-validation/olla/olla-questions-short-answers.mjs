import { validateOllaPack } from './olla-pack-family.mjs';

const skills = [
  'Singular affirmative olla questions',
  'Plural affirmative olla questions',
  'Singular negative olla questions',
  'Plural negative olla questions',
  'Short answers with olla',
];
const lessonIds = [
  'ppo-singular-positive-questions',
  'ppo-plural-positive-questions',
  'ppo-singular-negative-questions',
  'ppo-plural-negative-questions',
  'ppo-written-short-answers',
];

export function validatePack(pack) {
  const errors = validateOllaPack(pack, {
    id: 'olla-questions-short-answers',
    summary:
      'Standard Finnish only: focused practice with affirmative and negative olla questions and short answers.',
    skills,
    lessonIds,
    testIds: [
      ...lessonIds.map((id) => `${id}-test`),
      'ppo-question-and-answer-review',
      'ppo-question-transfer-review',
    ],
    focusedCount: 5,
    exerciseCounts: [24, 24, 24, 24, 24, 40, 18],
    scoredCount: 178,
    practiceCount: 20,
    personMinimum: 20,
    coverage: { 'positive-question': 60, 'negative-question': 60, 'short-answer': 35 },
    allowedConstructionTags: ['positive-question', 'negative-question', 'short-answer'],
    genderNeutralMinimum: 0,
    politeTeMinimum: 12,
    pluralTeMinimum: 8,
  });
  for (const exercise of [
    ...(pack.tests ?? []).flatMap((test) => test.exercises ?? []),
    ...(pack.lessons ?? []).flatMap((lesson) => lesson.practiceExercises ?? []),
  ]) {
    if (
      !exercise.tags?.includes('short-answer') ||
      !['fill-blank', 'translation-fi'].includes(exercise.type)
    )
      continue;

    const model = exercise.acceptedAnswers?.[0] ?? '';
    const alternative = model.startsWith('Kyllä, ')
      ? `${model[7]?.toLocaleUpperCase('fi-FI')}${model.slice(8)}`
      : /^(?:En|Et|Ei|Emme|Ette|Eivät) ole\.$/u.test(model)
        ? `Ei, ${model[0].toLocaleLowerCase('fi-FI')}${model.slice(1)}`
        : undefined;
    if (!alternative || !exercise.acceptedAnswers?.includes(alternative))
      errors.push(`${exercise.id}: typed short answer is missing its natural reply alternative`);
  }
  return errors;
}
