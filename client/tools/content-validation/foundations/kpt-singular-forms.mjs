import { validateFoundationsPack, validateKptBoundary } from './foundations-pack-family.mjs';

export function validatePack(pack) {
  return validateFoundationsPack(pack, {
    skills: [
      'KPT double consonants',
      'KPT common single consonants',
      'KPT special k changes',
      'KPT consonant clusters',
      'Genitive -n',
      'Minä verb forms with KPT',
    ],
    lessonIds: [
      'kpt-doubles',
      'kpt-singles',
      'kpt-special-k',
      'kpt-clusters',
      'genitive-nouns',
      'verb-kpt',
    ],
    testIds: [
      'test-kpt-doubles',
      'test-kpt-singles',
      'test-kpt-special-k',
      'test-kpt-clusters',
      'kpt-nouns',
      'kpt-verbs',
      'kpt-family-review',
      'kpt-form-review',
      'kpt-transfer-review',
    ],
    focusedCount: 6,
    testCounts: [20, 20, 20, 20, 21, 21, 32, 32, 34],
    practiceCounts: [4, 4, 4, 4, 3, 5],
    scoredCount: 220,
    practiceCount: 24,
    id: 'kpt-singular-forms',
    legacyScored: 90,
    legacyPractice: 24,
    validateBoundary: validateKptBoundary,
  });
}
