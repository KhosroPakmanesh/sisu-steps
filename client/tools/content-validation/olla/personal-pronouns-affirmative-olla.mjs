import { validateOllaPack } from './olla-pack-family.mjs';

export function validatePack(pack) {
  return validateOllaPack(pack, {
    skills: [
      'Singular personal pronouns',
      'Plural personal pronouns',
      'Pronoun reference and polite te',
      'Singular affirmative olla',
      'Plural affirmative olla',
      'Subject-pronoun use',
    ],
    lessonIds: [
      'ppo-singular-pronouns',
      'ppo-plural-pronouns',
      'ppo-written-reference-singular',
      'ppo-written-reference-plural',
      'ppo-singular-affirmative',
      'ppo-plural-affirmative',
      'ppo-pronoun-presence-singular',
      'ppo-pronoun-presence-plural',
    ],
    testIds: [
      'ppo-singular-pronouns-test',
      'ppo-plural-pronouns-test',
      'ppo-written-reference-singular-test',
      'ppo-written-reference-plural-test',
      'ppo-singular-affirmative-test',
      'ppo-plural-affirmative-test',
      'ppo-pronoun-presence-singular-test',
      'ppo-pronoun-presence-plural-test',
      'ppo-form-and-agreement-review',
      'ppo-affirmative-transfer-review',
    ],
    focusedCount: 8,
    scoredCount: 250,
    practiceCount: 25,
    id: 'personal-pronouns-affirmative-olla',
    summary:
      'Standard Finnish only: focused practice with personal pronouns and affirmative present-tense olla statements.',
    lessonSkills: [
      'Singular personal pronouns',
      'Plural personal pronouns',
      'Pronoun reference and polite te',
      'Pronoun reference and polite te',
      'Singular affirmative olla',
      'Plural affirmative olla',
      'Subject-pronoun use',
      'Subject-pronoun use',
    ],
    exerciseCounts: [24, 24, 20, 20, 24, 24, 20, 20, 40, 34],
    personMinimum: 24,
    coverage: { pronoun: 90, affirmative: 120 },
    allowedConstructionTags: ['pronoun', 'affirmative'],
    genderNeutralMinimum: 8,
    politeTeMinimum: 12,
    pluralTeMinimum: 12,
  });
}
