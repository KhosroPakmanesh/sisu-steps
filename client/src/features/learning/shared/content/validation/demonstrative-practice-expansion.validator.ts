import { Exercise } from '../exercise.models';
import { TopicPack } from '../topic-pack.models';

const TEST_IDS = [
  'sdp-independent-use-test',
  'pdp-independent-use-test',
  'sdp-se-han-test',
  'pdp-ne-he-test',
];
const TYPES = ['multiple-choice', 'fill-blank', 'translation-fi', 'translation-en', 'word-order'];

export function validateDemonstrativePractice(pack: TopicPack): void {
  if (pack.id !== 'demonstrative-pronouns') return;
  const errors: string[] = [];
  if (pack.version !== '1.2.0') errors.push(pack.id + ': expanded practice requires version 1.2.0');
  const entries = [
    ...pack.tests.flatMap((test) => test.exercises),
    ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
  ];
  for (const id of TEST_IDS) {
    const test = pack.tests.find((test) => test.id === id);
    if (
      !test ||
      test.exercises.length !== 20 ||
      TYPES.some((type) => test.exercises.filter((exercise) => exercise.type === type).length !== 4)
    ) {
      errors.push(id + ': keep 20 questions and four of each existing format');
      continue;
    }
    const addedIds = [17, 18, 19, 20].map((number) => id + '-e0' + number);
    const added = test.exercises.filter((exercise) => addedIds.includes(exercise.id));
    if (added.length !== 4) errors.push(id + ': keep all four added question IDs');
    for (const exercise of added) {
      const duplicate = entries.find(
        (entry) => entry.id !== exercise.id && taskKey(entry) === taskKey(exercise),
      );
      if (duplicate) errors.push(exercise.id + ': duplicates the response task of ' + duplicate.id);
      const partnerIndex = test.exercises.findIndex(
        (item) => item.id === exercise.parallelExerciseId,
      );
      if (partnerIndex < 0 || Math.abs(partnerIndex - test.exercises.indexOf(exercise)) < 3)
        errors.push(
          exercise.id + ': space the new mastery partner by at least two intervening questions',
        );
    }
    if (
      test.exercises.some(
        (exercise, index) =>
          index > 1 &&
          exercise.type === test.exercises[index - 1].type &&
          exercise.type === test.exercises[index - 2].type,
      )
    )
      errors.push(id + ': keep format runs at most two');
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

function taskKey(exercise: Exercise): string {
  const demand = ['fill-blank', 'translation-fi'].includes(exercise.type)
    ? 'finnish-text'
    : exercise.type;
  const finnish =
    exercise.sentenceExplanation?.parts.map((part) => part.finnish).join(' ') ??
    exercise.acceptedAnswers[0];
  return [
    demand,
    finnish
      .normalize('NFC')
      .trim()
      .replace(/[.!?]+$/u, '')
      .toLocaleLowerCase('fi-FI'),
  ].join('|');
}
