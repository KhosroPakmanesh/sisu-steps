import { validateFoundationsPack, validateHarmonyBoundary } from './foundations-pack-family.mjs';

export function validatePack(pack) {
  return validateFoundationsPack(pack, {
    id: 'vowel-harmony-location-endings',
    skills: [
      'Vowel harmony',
      'Neutral-vowel harmony',
      'Inessive -ssa/-ssä',
      'Inessive location sentences',
    ],
    lessonIds: [
      'vowel-harmony-basics',
      'neutral-vowel-harmony',
      'inside-ending',
      'inessive-location-sentences',
    ],
    testIds: [
      'vowel-families',
      'neutral-vowel-harmony-test',
      'harmony-in-forms',
      'inessive-location-sentences-test',
      'vowel-ending-review',
      'location-transfer-review',
    ],
    focusedCount: 4,
    testCounts: [20, 20, 21, 20, 14, 15],
    practiceCounts: [3, 4, 3, 4],
    scoredCount: 110,
    practiceCount: 14,
    legacyScored: 30,
    legacyPractice: 6,
    validateBoundary: validateHarmonyBoundary,
  });
}
