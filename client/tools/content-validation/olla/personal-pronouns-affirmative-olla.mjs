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
      'ppo-singular-pronouns-test',
      'ppo-plural-pronouns-test',
      'ppo-written-reference-singular-test',
      'ppo-written-reference-plural-test',
      'ppo-singular-affirmative-test',
      'ppo-plural-affirmative-test',
      'ppo-affirmative-agreement-singular-test',
      'ppo-affirmative-agreement-plural-test',
      'ppo-pronoun-presence-singular-test',
      'ppo-pronoun-presence-plural-test',
      'ppo-form-and-agreement-review',
      'ppo-affirmative-transfer-review',
    ],
    focusedCount: 10,
    exerciseCounts: [24, 24, 20, 20, 24, 24, 20, 20, 20, 20, 40, 34],
    scoredCount: 290,
    practiceCount: 28,
    personMinimum: 30,
    coverage: { pronoun: 90, affirmative: 140 },
    allowedConstructionTags: ['pronoun', 'affirmative'],
    genderNeutralMinimum: 8,
    politeTeMinimum: 12,
    pluralTeMinimum: 12,
  });
}
