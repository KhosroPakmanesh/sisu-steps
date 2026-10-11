import { validateFoundationsPack, validatePluralBoundary } from './foundations-pack-family.mjs';

export function validatePack(pack) {
  return validateFoundationsPack(pack, {
    skills: [
      'Regular T-plural',
      'T-plural with KPT',
      'Third-person plural -vat/-vät',
      'Plural subject + ovat',
    ],
    lessonIds: ['t-plural-basics', 'kpt-t-plural', 'he-verbs', 'plural-sentences'],
    testIds: [
      'regular-t-plural',
      'test-kpt-t-plural',
      'plural-verb-harmony',
      'plural-in-sentences',
      't-plural-form-review',
      'plural-agreement-review',
    ],
    focusedCount: 4,
    testCounts: [21, 21, 21, 21, 38, 38],
    practiceCounts: [3, 3, 3, 3],
    scoredCount: 160,
    practiceCount: 12,
    id: 't-plural-agreement',
    legacyScored: 72,
    legacyPractice: 12,
    validateBoundary: validatePluralBoundary,
  });
}
