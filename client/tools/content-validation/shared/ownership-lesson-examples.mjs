const POSSESSION_TARGETS = new Set([
  'Personal possessor forms',
  'Fixed on in possession',
  'Affirmative possession sentences',
  'Fixed ei ole in possession',
  'Regular singular partitive in negative possession',
  'Negative possession sentences',
  'Fixed onko in possession questions',
  'Possession question word order',
  'Possession question short answers',
  'Fixed eikö ole in possession questions',
  'Negative possession question word order',
  'Negative possession question short answers',
]);
const OWNERS = ['minulla', 'sinulla', 'hänellä', 'meillä', 'teillä', 'heillä'];

export function validateOwnershipLessonExamples(lessons) {
  const sets = new Map();
  const errors = [];
  for (const lesson of lessons) {
    const target = lesson.targetSkills?.[0] ?? '';
    const pluralOwners = lesson.id.startsWith('pop-');
    const personalEndings = pluralOwners ? ['mme', 'nne'] : ['ni', 'si'];
    const genitives = pluralOwners ? ['meidän', 'teidän', 'heidän'] : ['minun', 'sinun', 'hänen'];
    const thirdOwners = pluralOwners ? ['heidän'] : ['hänen'];
    const examples = lesson.examples ?? [];
    const finnish = examples.map((example) => example.finnish ?? '').join('\n');
    const findings = [];
    if (POSSESSION_TARGETS.has(target)) {
      const owners =
        lesson.numberScope?.axis === 'owner'
          ? OWNERS.slice(
              lesson.numberScope.number === 'singular' ? 0 : 3,
              lesson.numberScope.number === 'singular' ? 3 : 6,
            )
          : OWNERS;
      for (const owner of owners) {
        if (!containsWord(finnish, owner)) findings.push(`missing worked possessor ${owner}`);
      }
      const firstOwners = examples
        .slice(0, owners.length)
        .map((example) => owners.find((owner) => containsWord(example.finnish ?? '', owner)));
      if (new Set(firstOwners.filter(Boolean)).size !== owners.length) {
        findings.push(
          'the first worked examples must demonstrate every possessor in the lesson scope',
        );
      }
      if (target.includes('short answers')) validateReplies(examples, findings);
    }
    if (target === 'Genitive personal owner forms') {
      for (const owner of genitives) {
        if (!containsWord(finnish, owner)) findings.push(`missing worked genitive ${owner}`);
      }
    }
    if (target === 'First- and second-person possessive endings') {
      for (const ending of personalEndings) {
        if (!hasEnding(finnish, ending)) findings.push(`missing worked ending -${ending}`);
      }
    }
    if (target === 'Possessive pronoun omission and clear reference') {
      const omitted = examples
        .filter((example) => !/\b(?:minun|sinun|meidän|teidän)\b/iu.test(example.finnish))
        .map((example) => example.finnish)
        .join('\n');
      for (const ending of personalEndings) {
        if (!hasEnding(omitted, ending)) findings.push(`missing worked omission of -${ending}`);
      }
    }
    if (
      [
        'Shared third-person possessive endings',
        'Possessive pronoun omission and clear reference',
        'Simple ownership identity sentences',
      ].includes(target)
    ) {
      for (const owner of thirdOwners) {
        if (!containsWord(finnish, owner))
          findings.push(`missing worked third-person owner ${owner}`);
      }
    }
    if (target === 'Third-person possessive vowel harmony') {
      for (const ending of ['nsa', 'nsä']) {
        if (!hasEnding(finnish, ending)) findings.push(`missing worked harmony -${ending}`);
      }
      if (!containsWord(finnish, 'pelinsä'))
        findings.push('missing neutral-only worked harmony pelinsä');
    }
    if (target === 'Regular singular partitive in negative possession') {
      for (const form of ['palloa', 'kynää', 'peliä']) {
        if (!containsWord(finnish, form))
          findings.push(`missing worked partitive contrast ${form}`);
      }
    }
    if (
      POSSESSION_TARGETS.has(target) ||
      target.startsWith('Possessive') ||
      target.includes('possessive') ||
      target === 'Genitive personal owner forms' ||
      target === 'Simple ownership identity sentences' ||
      target === 'Whose questions with kenen'
    ) {
      const key = JSON.stringify(examples);
      const previous = sets.get(key);
      if (previous) findings.push(`copies the complete worked-example set of ${previous}`);
      sets.set(key, lesson.id);
    }
    errors.push(...findings.map((finding) => `${lesson.id}: ${finding}`));
  }
  return errors;
}

function validateReplies(examples, errors) {
  const replies = examples.map((example) => (example.finnish ?? '').split(/\?\s*[—–]\s*/u)[1]);
  if (
    replies.some((reply) => !reply || !/^(?:On\.|Kyllä, on\.|Ei ole\.|Ei, ei ole\.)$/u.test(reply))
  ) {
    errors.push('every short-answer worked example must contain a question and fixed reply');
  }
  for (const reply of ['On.', 'Ei ole.', 'Kyllä, on.', 'Ei, ei ole.']) {
    if (!replies.includes(reply)) errors.push(`missing worked reply ${reply}`);
  }
}

function containsWord(text, word) {
  return new RegExp(`(?<![\\p{L}])${word}(?![\\p{L}])`, 'iu').test(text);
}

function hasEnding(text, ending) {
  return new RegExp(`\\p{L}+${ending}(?![\\p{L}])`, 'iu').test(text);
}
