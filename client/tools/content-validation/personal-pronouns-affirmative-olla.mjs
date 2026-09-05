import { validateOllaPack } from './olla-pack-family.mjs';

const skills = [
  'Singular personal pronouns',
  'Plural personal pronouns',
  'Pronoun reference and polite te',
  'Singular affirmative olla',
  'Plural affirmative olla',
  'Affirmative pronoun–verb agreement',
  'Subject-pronoun use',
];
const lessonIds = [
  'ppo-singular-pronouns',
  'ppo-plural-pronouns',
  'ppo-written-reference',
  'ppo-singular-affirmative',
  'ppo-plural-affirmative',
  'ppo-affirmative-agreement',
  'ppo-pronoun-presence',
];

export function validatePack(pack) {
  return validateOllaPack(pack, {
    id: 'personal-pronouns-affirmative-olla',
    summary:
      'Standard Finnish only: focused practice with personal pronouns and affirmative present-tense olla statements.',
    skills,
    lessonIds,
    testIds: [
      ...lessonIds.map((id) => `${id}-test`),
      'ppo-form-and-agreement-review',
      'ppo-affirmative-transfer-review',
    ],
    focusedCount: 7,
    exerciseCounts: [24, 24, 24, 24, 24, 24, 24, 40, 34],
    scoredCount: 242,
    practiceCount: 28,
    personMinimum: 30,
    coverage: { pronoun: 90, affirmative: 140 },
    allowedConstructionTags: ['pronoun', 'affirmative'],
    genderNeutralMinimum: 8,
    politeTeMinimum: 12,
    pluralTeMinimum: 12,
  });
}
