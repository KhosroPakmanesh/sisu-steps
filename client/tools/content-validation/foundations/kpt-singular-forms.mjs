import { validateFoundationsPack, validateKptBoundary } from './foundations-pack-family.mjs';

export function validatePack(pack) {
  return validateFoundationsPack(pack, {
    id: 'kpt-singular-forms',
    skills: [
      'Strong and weak KPT grades',
      'KPT double consonants',
      'KPT common single consonants',
      'KPT special k changes',
      'KPT consonant clusters',
      'KPT recognition',
      'Genitive -n',
      'Minä verb forms with KPT',
    ],
    lessonIds: [
      'strong-weak-kpt-grades',
      'kpt-doubles',
      'kpt-singles',
      'kpt-special-k',
      'kpt-clusters',
      'kpt-basics',
      'genitive-nouns',
      'verb-kpt',
    ],
    testIds: [
      'strong-weak-kpt-grades-test',
      'test-kpt-doubles',
      'test-kpt-singles',
      'test-kpt-special-k',
      'test-kpt-clusters',
      'kpt-patterns',
      'kpt-nouns',
      'kpt-verbs',
      'kpt-family-review',
      'kpt-form-review',
      'kpt-transfer-review',
    ],
    focusedCount: 8,
    testCounts: [20, 20, 20, 20, 20, 20, 21, 21, 32, 32, 34],
    practiceCounts: [4, 4, 4, 4, 4, 4, 3, 5],
    scoredCount: 260,
    practiceCount: 32,
    legacyScored: 98,
    legacyPractice: 28,
    validateBoundary: validateKptBoundary,
  });
}
