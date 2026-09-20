import { validateFoundationsPack, validatePluralBoundary } from './foundations-pack-family.mjs';

export function validatePack(pack) {
  return validateFoundationsPack(pack, {
    id: 't-plural-agreement',
    skills: [
      'T-plural recognition',
      'Regular T-plural',
      'KPT T-plural recognition',
      'T-plural with KPT',
      'Third-person plural -vat/-vät',
      'Plural subject + ovat',
    ],
    lessonIds: [
      't-plural-recognition',
      't-plural-basics',
      'kpt-t-plural-recognition',
      'kpt-t-plural',
      'he-verbs',
      'plural-sentences',
    ],
    testIds: [
      't-plural-recognition-test',
      'regular-t-plural',
      'kpt-t-plural-recognition-test',
      'test-kpt-t-plural',
      'plural-verb-harmony',
      'plural-in-sentences',
      't-plural-form-review',
      'plural-agreement-review',
    ],
    focusedCount: 6,
    testCounts: [20, 21, 20, 21, 21, 21, 38, 38],
    practiceCounts: [4, 3, 4, 3, 3, 3],
    scoredCount: 200,
    practiceCount: 20,
    legacyScored: 72,
    legacyPractice: 12,
    validateBoundary: validatePluralBoundary,
  });
}
