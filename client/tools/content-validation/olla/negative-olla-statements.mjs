import { validateOllaPack } from './olla-pack-family.mjs';

const skills = [
  'Singular negative olla',
  'Plural negative olla',
  'Affirmative-to-negative olla transformation',
];
const lessonIds = ['ppo-singular-negative', 'ppo-plural-negative', 'ppo-negative-transformations'];

export function validatePack(pack) {
  return validateOllaPack(pack, {
    id: 'negative-olla-statements',
    summary:
      'Standard Finnish only: focused practice with negative present-tense olla statements and person agreement.',
    skills,
    lessonIds,
    testIds: [...lessonIds.map((id) => `${id}-test`), 'ppo-negative-statements-review'],
    focusedCount: 3,
    exerciseCounts: [24, 24, 24, 28],
    scoredCount: 100,
    practiceCount: 12,
    personMinimum: 12,
    coverage: { negative: 90 },
    allowedConstructionTags: ['negative'],
    genderNeutralMinimum: 0,
    politeTeMinimum: 6,
    pluralTeMinimum: 2,
  });
}
