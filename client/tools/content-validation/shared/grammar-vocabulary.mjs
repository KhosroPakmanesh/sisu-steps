export function collectGrammarForms(exercises, grammarBaseForms) {
  const bases = new Set(grammarBaseForms.map(normalize));
  const forms = new Set(bases);
  for (const exercise of exercises) {
    for (const part of exercise.sentenceExplanation?.parts ?? []) {
      const baseWords = (part.baseForm ?? '')
        .toLocaleLowerCase('fi-FI')
        .split(/[\s+,;/]+/u)
        .filter(Boolean);
      const surfaceWords =
        (part.finnish ?? '').toLocaleLowerCase('fi-FI').match(/[\p{L}\p{N}]+/gu) ?? [];
      // Only explicit one-to-one relationships establish a grammar surface.
      if (baseWords.length !== surfaceWords.length) continue;
      for (const [index, base] of baseWords.entries()) {
        if (bases.has(base)) forms.add(surfaceWords[index]);
      }
    }
  }
  return forms;
}

export function validateGrammarVocabulary(lessons, exercises, grammarBaseForms) {
  if (
    !Array.isArray(grammarBaseForms) ||
    grammarBaseForms.some(
      (word) =>
        typeof word !== 'string' || !word.trim() || word !== word.trim() || /\s/u.test(word),
    ) ||
    new Set(grammarBaseForms.map(normalize)).size !== grammarBaseForms.length
  ) {
    return ['pack must declare unique one-word grammar base forms'];
  }
  const forms = collectGrammarForms(exercises, grammarBaseForms);
  const errors = [];
  for (const lesson of lessons) {
    for (const category of ['introducedVocabulary', 'reusedVocabulary', 'suppliedVocabulary']) {
      for (const item of lesson[category] ?? []) {
        if (typeof item?.finnish === 'string' && forms.has(normalize(item.finnish))) {
          errors.push(`${lesson.id}: grammar form ${item.finnish} must not appear in ${category}`);
        }
      }
    }
  }
  for (const exercise of exercises) {
    for (const word of exercise.vocabulary ?? []) {
      if (typeof word === 'string' && forms.has(normalize(word))) {
        errors.push(`${exercise.id}: grammar form ${word} must not appear in vocabulary`);
      }
    }
  }
  return errors;
}

function normalize(value) {
  return value.trim().toLocaleLowerCase('fi-FI');
}
