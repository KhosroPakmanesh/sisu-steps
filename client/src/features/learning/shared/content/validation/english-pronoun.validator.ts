import { Exercise } from '../exercise.models';
import { normalizeAnswer } from '../../progress/grading.policy';

const FINNISH_PRONOUN =
  /(?<![\p{L}\p{N}])hän(?:en|tä|essä|estä|een|ellä|eltä|elle|eksi|enä)?(?![\p{L}\p{N}])/iu;
const PRONOUN_GROUPS = [
  { pattern: /\b(?:he or she|he|she)\b/gu, alternatives: ['he', 'she', 'he or she'] },
  { pattern: /\b(?:his or her|his|her)\b/gu, alternatives: ['his', 'her', 'his or her'] },
];

const PREDICATIVE_GROUP = {
  pattern: /\b(?:his or hers|his|hers)\b/gu,
  alternatives: ['his', 'hers', 'his or hers'],
};

export function validateEnglishPronounAnswers(exercise: Exercise): void {
  if (exercise.type !== 'translation-en' || !FINNISH_PRONOUN.test(exercise.prompt)) return;
  if (/\bUse (?:he or she|his or her)\b|\bOwner: he or she\b/iu.test(exercise.prompt)) {
    throw new Error(`Exercise ${exercise.id} has ambiguous English pronoun-choice wording.`);
  }
  const answers = new Set(exercise.acceptedAnswers.map(normalizeAnswer));
  for (const answer of answers) {
    for (const group of /\b(?:is|are) (?:his|hers|his or hers)$/u.test(answer)
      ? [PRONOUN_GROUPS[0], PREDICATIVE_GROUP]
      : PRONOUN_GROUPS) {
      for (const match of answer.matchAll(group.pattern)) {
        for (const alternative of group.alternatives) {
          const variant =
            answer.slice(0, match.index) +
            alternative +
            answer.slice(match.index + match[0].length);
          if (!answers.has(variant)) {
            throw new Error(
              `Exercise ${exercise.id} is missing English pronoun alternative: ${variant}.`,
            );
          }
        }
      }
    }
  }
}
