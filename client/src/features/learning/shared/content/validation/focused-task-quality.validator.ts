import { Exercise } from '../exercise.models';
import { TopicPack } from '../topic-pack.models';

function normalize(text: string): string {
  return text
    .toLocaleLowerCase('fi-FI')
    .replace(/[.,!?“”"']/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function focusedTaskKey(exercise: Exercise): string {
  const typed = ['fill-blank', 'translation-fi'].includes(exercise.type);
  const repair = /^(?:repair|correct the incorrect)/iu.test(exercise.prompt);
  const demand = (repair ? 'repair-' : '') + (typed ? 'typed-production' : exercise.type);
  const model = normalize(exercise.acceptedAnswers?.[0] ?? '');
  const sentence = exercise.sentenceExplanation;
  const shortReply =
    exercise.tags?.includes('short-answer') ||
    /^(?:reply|answer|the question|complete.*after)/iu.test(exercise.prompt);
  const quoted = [...exercise.prompt.matchAll(/[“"]([^”"]+)[”"]/gu)].map((match) =>
    normalize(match[1]),
  );
  if (repair) {
    const result = sentence?.parts?.length
      ? normalize(sentence.parts.map((part) => part.finnish).join(' '))
      : model;
    return JSON.stringify([demand, result, quoted[0] ?? '']);
  }
  if (shortReply) {
    const source = quoted.find((cue) =>
      /^(?:onko|eikö|olenko|oletko|olemmeko|oletteko|ovatko|enkö|etkö|emmekö|ettekö|eivätkö)\b/iu.test(
        cue,
      ),
    );
    return JSON.stringify([
      demand,
      source ?? quoted,
      normalize((exercise.acceptedAnswers?.[0] ?? '').replace(/^(?:Kyllä[, ]+|Ei, )/iu, '')),
    ]);
  }
  if (sentence?.parts?.length) {
    const source = normalize(sentence.parts.map((part) => part.finnish).join(' '));
    return JSON.stringify([demand, source]);
  }
  const lexicalInput = [...(exercise.vocabulary ?? [])].map(normalize).sort();
  if (lexicalInput.length) return JSON.stringify([demand, lexicalInput, model]);
  // Bare pronoun recall/translation has the same demand despite decorative task wrappers.
  const contextual =
    /\b(?:speaks|replies|narrator|conversation|dialogue|refers to|referring to)\b/iu.test(
      exercise.prompt,
    );
  const scalarPronoun = /^(?:minä|sinä|hän|me|te|he|i|you|he or she|we|they)$/u.test(model);
  const source = contextual
    ? normalize(exercise.prompt.replace(/\b[A-Z][a-z]+(?:’s|'s)?\b/gu, '<person>'))
    : scalarPronoun
      ? ''
      : quoted;
  return JSON.stringify([demand, source, model]);
}

export function validateFocusedTaskQuality(pack: TopicPack): string[] {
  const errors: string[] = [];
  for (const test of pack.tests.filter((item) => item.stage === 'focused')) {
    const seen = new Map<string, string>();
    for (const exercise of test.exercises) {
      const key = focusedTaskKey(exercise);
      const prior = seen.get(key);
      if (prior) errors.push(`${exercise.id}: repeats the Focused response demand of ${prior}`);
      else seen.set(key, exercise.id);
    }
    if (seen.size < 20)
      errors.push(`${test.id}: needs at least 20 distinct Focused response demands`);
  }
  return errors;
}
