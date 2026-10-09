import { validateOllaPack } from './olla-pack-family.mjs';

const skills = [
  'Singular negative olla',
  'Plural negative olla',
  'Affirmative-to-negative olla transformation',
];
const baseLessonIds = [
  'ppo-singular-negative',
  'ppo-plural-negative',
  'ppo-negative-transformations',
];

const numberSplit = new Set([
  'ppo-written-reference',
  'ppo-affirmative-agreement',
  'ppo-pronoun-presence',
  'ppo-negative-transformations',
  'ppo-written-short-answers',
]);
const lessonIds = baseLessonIds.flatMap((id) =>
  numberSplit.has(id) ? [id + '-singular', id + '-plural'] : [id],
);
const lessonSkills = baseLessonIds.flatMap((id, index) =>
  numberSplit.has(id) ? [skills[index], skills[index]] : [skills[index]],
);

export function validatePack(pack) {
  return validateOllaPack(pack, {
    id: 'negative-olla-statements',
    summary:
      'Standard Finnish only: focused practice with negative present-tense olla statements and person agreement.',
    skills,
    lessonIds,
    lessonSkills,
    testIds: [
      'ppo-singular-negative-test',
      'ppo-plural-negative-test',
      'ppo-negative-transformations-singular-test',
      'ppo-negative-transformations-plural-test',
      'ppo-negative-statements-review',
    ],
    focusedCount: 4,
    exerciseCounts: [24, 24, 20, 20, 28],
    scoredCount: 116,
    practiceCount: 13,
    personMinimum: 12,
    coverage: { negative: 90 },
    allowedConstructionTags: ['negative'],
    genderNeutralMinimum: 0,
    politeTeMinimum: 6,
    pluralTeMinimum: 2,
  });
}
