import { ExerciseType } from '../exercise.models';
import { TopicPack } from '../topic-pack.models';

const PACK_IDS = new Set([
  'affirmative-possession',
  'negative-possession',
  'possession-questions',
  'negative-possession-questions',
  'possessive-pronouns-endings',
]);
const FORMATS: ExerciseType[] = [
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
];

export function validateOwnershipQuestionVariety(pack: TopicPack): void {
  if (!PACK_IDS.has(pack.id)) return;
  const errors: string[] = [];
  const scored = pack.tests.flatMap((test) => test.exercises);
  const practice = pack.lessons.flatMap((lesson) => lesson.practiceExercises);
  for (const [label, exercises] of [
    ['scored', scored],
    ['optional', practice],
  ] as const) {
    for (const format of FORMATS) {
      if (!exercises.some((exercise) => exercise.type === format))
        errors.push(`${pack.id}: ${label} ownership work must include ${format}`);
    }
  }
  for (const test of pack.tests) {
    const formats = new Set(test.exercises.map((exercise) => exercise.type));
    const harmony =
      test.targetSkills.length === 1 &&
      test.targetSkills[0] === 'Third-person possessive vowel harmony';
    if (test.stage === 'focused') {
      if (formats.size < (harmony ? 2 : 3))
        errors.push(`${test.id}: Focused ownership work needs suitable response variety`);
      if (!['multiple-choice', 'word-order'].includes(test.exercises[0]?.type))
        errors.push(`${test.id}: Focused ownership work must start with recognition or tokens`);
    } else {
      for (const format of FORMATS) {
        const count = test.exercises.filter((exercise) => exercise.type === format).length;
        if (count === 0) errors.push(`${test.id}: ownership Review must include ${format}`);
        if (count * 3 > test.exercises.length)
          errors.push(`${test.id}: no ownership Review format may exceed one third`);
      }
    }
    const positions = new Map(test.exercises.map((exercise, index) => [exercise.id, index]));
    let lastFormat: ExerciseType | undefined;
    let run = 0;
    for (const [index, exercise] of test.exercises.entries()) {
      run = exercise.type === lastFormat ? run + 1 : 1;
      lastFormat = exercise.type;
      if (run > 2) errors.push(`${exercise.id}: ownership format runs must not exceed two`);
      const partnerIndex = positions.get(exercise.parallelExerciseId!);
      if (partnerIndex !== undefined && partnerIndex > index && partnerIndex - index < 3)
        errors.push(`${exercise.id}: ownership mastery partners need two intervening questions`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}
