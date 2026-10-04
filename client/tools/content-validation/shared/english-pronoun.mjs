const FINNISH_PRONOUN =
  /(?<![\p{L}\p{N}])hän(?:en|tä|essä|estä|een|ellä|eltä|elle|eksi|enä)?(?![\p{L}\p{N}])/iu;
const PRONOUN_GROUPS = [
  { pattern: /\b(?:he or she|he|she)\b/gu, alternatives: ['he', 'she', 'he or she'] },
  { pattern: /\b(?:his or her|his|her)\b/gu, alternatives: ['his', 'her', 'his or her'] },
];

export function validateEnglishPronounAnswers(exercises) {
  const errors = [];
  for (const exercise of exercises) {
    if (exercise?.type !== 'translation-en' || !FINNISH_PRONOUN.test(exercise.prompt ?? ''))
      continue;
    if (/\bUse (?:he or she|his or her)\b|\bOwner: he or she\b/iu.test(exercise.prompt)) {
      errors.push(`${exercise.id}: ambiguous English pronoun-choice wording`);
    }
    const answers = new Set((exercise.acceptedAnswers ?? []).map(normalizeAnswer));
    for (const answer of answers) {
      for (const group of PRONOUN_GROUPS) {
        for (const match of answer.matchAll(group.pattern)) {
          for (const alternative of group.alternatives) {
            const variant =
              answer.slice(0, match.index) +
              alternative +
              answer.slice(match.index + match[0].length);
            if (!answers.has(variant)) {
              errors.push(`${exercise.id}: missing English pronoun alternative: ${variant}`);
            }
          }
        }
      }
    }
  }
  return [...new Set(errors)];
}

function normalizeAnswer(value) {
  return value
    .normalize('NFC')
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?]+$/gu, '')
    .trim()
    .toLocaleLowerCase('fi-FI');
}
