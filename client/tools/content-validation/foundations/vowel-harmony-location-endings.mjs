import { validateFoundationsPack, validateHarmonyBoundary } from './foundations-pack-family.mjs';

export function validatePack(pack) {
  return validateFoundationsPack(pack, {
    skills: ['Vowel harmony', 'Inessive -ssa/-ssä', 'Inessive location sentences'],
    lessonIds: ['vowel-harmony-basics', 'inside-ending', 'inessive-location-sentences'],
    testIds: [
      'vowel-families',
      'harmony-in-forms',
      'inessive-location-sentences-test',
      'vowel-ending-review',
      'location-transfer-review',
    ],
    focusedCount: 3,
    testCounts: [20, 21, 20, 14, 15],
    practiceCounts: [3, 3, 4],
    scoredCount: 90,
    practiceCount: 10,
    id: 'vowel-harmony-location-endings',
    legacyScored: 30,
    legacyPractice: 6,
    validateBoundary: validateHarmonyBoundary,
  });
}
