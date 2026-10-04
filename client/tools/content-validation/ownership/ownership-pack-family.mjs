import { validatePack as validateOwnerNumbers } from './plural-ownership-possessive-endings.mjs';

const MODES = new Map([
  ['affirmative-possession', 'affirmative'],
  ['negative-possession', 'negative'],
  ['possession-questions', 'question'],
  ['negative-possession-questions', 'negative-question'],
  ['possessive-pronouns-endings', 'possessive'],
]);
const HOLDERS = ['minulla', 'sinulla', 'hänellä', 'meillä', 'teillä', 'heillä'];
const POSSESSION_NOUNS = ['pallo', 'kirja', 'auto', 'kynä', 'kissa', 'koira', 'tyyny', 'peli'];
const NOUNS = [...POSSESSION_NOUNS, 'talo', 'omena'];
const REPLIES = ['on', 'kyllä on', 'on kyllä', 'ei ole', 'ei ei ole'];
const ENDINGS = new Map([
  ['minun', 'ni'],
  ['sinun', 'si'],
  ['hänen', 'nsa'],
  ['meidän', 'mme'],
  ['teidän', 'nne'],
  ['heidän', 'nsa'],
]);

export function validateOwnershipPack(pack) {
  const mode = MODES.get(pack.id);
  if (!mode) return [];
  const errors = mode === 'possessive' ? validateOwnerNumbers(pack) : [];
  const counts = mode === 'possessive' ? [20, 20, 20, 20, 20, 20, 20, 20, 32] : [24, 24, 24, 24];
  if (
    pack.version !== (mode === 'possessive' ? '1.4.0' : '1.3.0') ||
    pack.level !== '0 - A1.3' ||
    pack.tests.length !== counts.length ||
    pack.tests.some((test, index) => test.exercises.length !== counts[index])
  )
    errors.push(
      `${pack.id}: expanded ownership topology, level, and version must match the contract`,
    );
  const focusedCount = mode === 'possessive' ? 8 : 3;
  if (
    pack.tests.some((test, index) => test.stage !== (index < focusedCount ? 'focused' : 'review'))
  ) {
    errors.push(
      `${pack.id}: ownership tests must keep the original Focused sequence before Review`,
    );
  }
  const reviewIds = new Set(
    pack.tests
      .filter((test) => test.stage === 'review')
      .flatMap((test) => test.exercises.map((exercise) => exercise.id)),
  );
  const exercises = [
    ...pack.tests.flatMap((test) => test.exercises),
    ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
  ];
  for (const exercise of exercises) {
    const finnish = exercise.type === 'translation-en' ? [] : exercise.acceptedAnswers;
    const explained = exercise.sentenceExplanation?.parts.map((part) => part.finnish).join(' ');
    const surfaces = [...finnish, ...(explained ? [explained] : [])];
    if (mode === 'possessive') validatePossessives(exercise, surfaces, errors);
    else validatePossession(exercise, surfaces, mode, errors, reviewIds.has(exercise.id));
  }
  validateDistinctTasks(exercises, errors);
  return errors;
}

function normalize(value) {
  return value
    .toLocaleLowerCase('fi-FI')
    .replace(/[.,!?]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function validatePossession(exercise, surfaces, mode, errors, isReview) {
  const dialogue = exercise.tags.includes('possession-dialogue');
  if (dialogue) {
    if (!isReview || !['question', 'negative-question'].includes(mode)) {
      errors.push(
        `${exercise.id}: question/reply transfer belongs only in a taught question Review`,
      );
    }
    surfaces = surfaces.map((surface) => {
      const turns = surface.split(/\?\s*/u);
      if (turns.length !== 2 || !REPLIES.includes(normalize(turns[1]))) {
        errors.push(
          `${exercise.id}: dialogue must contain one possession question and a fixed verb reply`,
        );
      }
      return turns[0];
    });
  }
  for (const surface of surfaces) {
    const words = normalize(surface).split(' ');
    if (!words.some((word) => HOLDERS.includes(word))) continue;
    const holder = words.find((word) => HOLDERS.includes(word));
    const noun = words.at(-1);
    const nominatives = POSSESSION_NOUNS;
    const partitives = nominatives.map(regularPartitive);
    const patterns = {
      affirmative:
        words.length === 3 &&
        words[0] === holder &&
        words[1] === 'on' &&
        nominatives.includes(noun),
      negative:
        words.length === 4 &&
        words[0] === holder &&
        words[1] === 'ei' &&
        words[2] === 'ole' &&
        partitives.includes(noun),
      question:
        words.length === 3 &&
        words[0] === 'onko' &&
        words[1] === holder &&
        nominatives.includes(noun),
      'negative-question':
        words.length === 4 &&
        words[0] === 'eikö' &&
        words[1] === holder &&
        words[2] === 'ole' &&
        partitives.includes(noun),
    };
    // A form-only answer names just the possessor; its contextual sentence is checked separately.
    if (words.length === 1 && HOLDERS.includes(words[0])) continue;
    if (!patterns[mode])
      errors.push(
        `${exercise.id}: possession must keep the fixed ${mode} verb pattern and its singular noun form`,
      );
  }
  const noun = exercise.tags
    .find((tag) => tag.startsWith('partitive-noun-'))
    ?.slice('partitive-noun-'.length);
  if (noun && !POSSESSION_NOUNS.includes(noun)) {
    errors.push(`${exercise.id}: negative noun must stay within the taught regular inventory`);
  }
  if (
    noun &&
    exercise.acceptedAnswers.some((answer) => normalize(answer) !== regularPartitive(noun))
  ) {
    errors.push(`${exercise.id}: negative noun must use its regular singular partitive`);
  }
  if (!dialogue && exercise.targetSkill?.toLocaleLowerCase('en').includes('short answers')) {
    if (exercise.acceptedAnswers.some((answer) => !REPLIES.includes(normalize(answer)))) {
      errors.push(`${exercise.id}: possession replies must echo fixed on or ei ole`);
    }
  }
}

function regularPartitive(noun) {
  return noun + (/[aou]/u.test(noun) ? 'a' : 'ä');
}

function validatePossessives(exercise, surfaces, errors) {
  const owner = exercise.tags.find((tag) => tag.startsWith('owner-'))?.slice('owner-'.length);
  const noun = exercise.tags
    .find((tag) => tag.startsWith('possessive-noun-'))
    ?.slice('possessive-noun-'.length);
  if (noun && !NOUNS.includes(noun)) {
    errors.push(`${exercise.id}: possessive noun must stay within the taught regular inventory`);
  }
  if (
    noun &&
    exercise.targetSkill === 'Shared third-person possessive endings' &&
    !/[aou]/u.test(noun)
  ) {
    errors.push(
      `${exercise.id}: third-person ending tasks must precede new vowel-harmony decisions`,
    );
  }
  if (owner && !noun && exercise.type !== 'translation-en') {
    const supplied = exercise.tags
      .find((tag) => tag.startsWith('supplied-possessive-noun-'))
      ?.slice('supplied-possessive-noun-'.length);
    const expected = supplied ? `${owner} ${supplied}` : owner;
    if (exercise.acceptedAnswers.some((answer) => normalize(answer) !== expected)) {
      errors.push(`${exercise.id}: owner form must match the requested genitive pronoun`);
    }
  }
  if (owner && noun) {
    let ending = ENDINGS.get(owner);
    if (ending === 'nsa' && !/[aou]/u.test(noun)) ending = 'nsä';
    const expected = noun + ending;
    if (exercise.tags.includes('possessive-ending-only')) {
      if (exercise.acceptedAnswers.some((answer) => normalize(answer) !== ending)) {
        errors.push(`${exercise.id}: isolated possessive ending must match the requested owner`);
      }
      return;
    }
    if (exercise.tags.includes('possessive-ending-vowel')) {
      if (exercise.acceptedAnswers.some((answer) => normalize(answer) !== ending.at(-1))) {
        errors.push(
          `${exercise.id}: final vowel must match the owner and vowel harmony (${expected})`,
        );
      }
      return;
    }
    for (const surface of surfaces) {
      if (!normalize(surface).split(' ').includes(expected)) {
        errors.push(
          `${exercise.id}: possessive noun must match its owner and vowel harmony (${expected})`,
        );
      }
      if (
        ['hänen', 'heidän'].includes(owner) &&
        (exercise.targetSkill === 'Possessive pronoun omission and clear reference' ||
          normalize(surface).split(' ').includes('tämä')) &&
        !normalize(surface).split(' ').includes(owner)
      ) {
        errors.push(`${exercise.id}: third-person identity phrases must retain the owner pronoun`);
      }
    }
  }
  if (exercise.tags.includes('whose-question')) {
    for (const surface of surfaces) {
      const words = normalize(surface).split(' ');
      if (words.length === 1 && words[0] === 'kenen') continue;
      const plural = exercise.tags.includes('objects-plural');
      const nounForms = plural ? NOUNS.map((noun) => `${noun}t`) : NOUNS;
      if (words.length === 1 && exercise.type === 'fill-blank' && nounForms.includes(words[0]))
        continue;
      const demonstrative = plural ? 'nämä' : 'tämä';
      const noun = words[1] === demonstrative ? words[2] : words[1];
      if (
        words[0] !== 'kenen' ||
        !nounForms.includes(noun) ||
        !words.slice(1, 3).includes(demonstrative) ||
        words[3] !== (plural ? 'ovat' : 'on') ||
        words.length !== 4
      ) {
        errors.push(
          `${exercise.id}: Whose questions must keep kenen + basic singular noun or unsuffixed plural noun and matching agreement`,
        );
      }
    }
  }
}

function validateDistinctTasks(exercises, errors) {
  const seen = new Map();
  for (const exercise of exercises) {
    // Quoted meanings, sources, and frames carry the task; decorative prose cannot distinguish it.
    const cues = [...exercise.prompt.matchAll(/[“"]([^”"]+)[”"]/gu)].map((match) =>
      normalize(match[1]),
    );
    const key = JSON.stringify([
      exercise.targetSkill,
      exercise.type,
      cues,
      normalize(exercise.acceptedAnswers[0]),
    ]);
    if (seen.has(key)) errors.push(`${exercise.id}: repeated semantic task of ${seen.get(key)}`);
    seen.set(key, exercise.id);
  }
}
