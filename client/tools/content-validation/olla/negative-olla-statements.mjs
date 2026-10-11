import { validateOllaPack } from './olla-pack-family.mjs';

export function validatePack(pack) {
  return validateOllaPack(pack, {
    skills: ['Singular negative olla', 'Plural negative olla'],
    lessonIds: ['ppo-singular-negative', 'ppo-plural-negative'],
    testIds: [
      'ppo-singular-negative-test',
      'ppo-plural-negative-test',
      'ppo-negative-statements-review',
    ],
    focusedCount: 2,
    scoredCount: 76,
    practiceCount: 8,
    id: 'negative-olla-statements',
    summary:
      'Standard Finnish only: focused practice with negative present-tense olla statements and person agreement.',
    lessonSkills: ['Singular negative olla', 'Plural negative olla'],
    exerciseCounts: [24, 24, 28],
    personMinimum: 10,
    coverage: { negative: 76 },
    allowedConstructionTags: ['negative'],
    genderNeutralMinimum: 0,
    politeTeMinimum: 6,
    pluralTeMinimum: 2,
  });
}
