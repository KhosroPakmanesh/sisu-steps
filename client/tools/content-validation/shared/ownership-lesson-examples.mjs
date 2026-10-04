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
const PERSONAL_ENDINGS = ['ni', 'si', 'mme', 'nne'];

export function validateOwnershipLessonExamples(lessons) {
  const sets = new Map();
  const errors = [];
  for (const lesson of lessons) {
    const target = lesson.targetSkills?.[0] ?? '';
    const examples = lesson.examples ?? [];
    const finnish = examples.map((example) => example.finnish ?? '').join('\n');
    const findings = [];
    if (POSSESSION_TARGETS.has(target)) {
      for (const owner of OWNERS) {
        if (!containsWord(finnish, owner)) findings.push(`missing worked possessor ${owner}`);
      }
      const firstOwners = examples
        .slice(0, 6)
        .map((example) => OWNERS.find((owner) => containsWord(example.finnish ?? '', owner)));
      if (new Set(firstOwners.filter(Boolean)).size !== OWNERS.length) {
        findings.push('the first six worked examples must demonstrate all six possessors');
      }
      if (target.includes('short answers')) validateReplies(examples, findings);
    }
    if (target === 'Genitive personal owner forms') {
      for (const owner of ['minun', 'sinun', 'hänen', 'meidän', 'teidän', 'heidän']) {
        if (!containsWord(finnish, owner)) findings.push(`missing worked genitive ${owner}`);
      }
    }
    if (target === 'First- and second-person possessive endings') {
      for (const ending of PERSONAL_ENDINGS) {
        if (!hasEnding(finnish, ending)) findings.push(`missing worked ending -${ending}`);
      }
    }
    if (target === 'Possessive pronoun omission and clear reference') {
      const omitted = examples
        .filter((example) => !/\b(?:minun|sinun|meidän|teidän)\b/iu.test(example.finnish))
        .map((example) => example.finnish)
        .join('\n');
      for (const ending of PERSONAL_ENDINGS) {
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
      for (const owner of ['hänen', 'heidän']) {
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
