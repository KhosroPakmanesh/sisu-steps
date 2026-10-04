const OWNERS = ['minun', 'sinun', 'hänen', 'meidän', 'teidän', 'heidän'];
const ENDINGS = ['ni', 'si', 'nsa', 'mme', 'nne', 'nsa'];
const NOUNS = [
  'pallo',
  'kirja',
  'auto',
  'kynä',
  'tyyny',
  'peli',
  'kissa',
  'koira',
  'talo',
  'omena',
];

// Both packs distinguish owner number independently of the number of possessed things.
export function validatePack(pack) {
  const plural = pack.id === 'plural-ownership-possessive-endings';
  if (!plural && pack.id !== 'possessive-pronouns-endings') return [];
  const allowed = OWNERS.slice(plural ? 3 : 0, plural ? 6 : 3);
  const errors = [];
  if (
    pack.version !== (plural ? '1.1.0' : '1.4.0') ||
    pack.level !== '0 - A1.3' ||
    pack.lessons.length !== 8 ||
    pack.lessons.some(
      (lesson) => lesson.stage !== 'focused' || lesson.practiceExercises.length !== 3,
    ) ||
    pack.tests.length !== 9 ||
    pack.tests.some(
      (test, index) =>
        test.stage !== (index < 8 ? 'focused' : 'review') ||
        test.exercises.length !== (index < 8 ? 20 : 32),
    )
  )
    errors.push(
      `${pack.id}: preserve equal owner-pack counts: eight 20-question Focused tests and 32-question Review`,
    );
  for (const lesson of pack.lessons) {
    const teaching = JSON.stringify([
      lesson.sections,
      lesson.examples,
      lesson.objectives,
      lesson.commonMistakes,
    ]);
    for (const owner of OWNERS.filter((owner) => !allowed.includes(owner))) {
      if (new RegExp(`(?<![\\p{L}])${owner}(?![\\p{L}])`, 'iu').test(teaching))
        errors.push(`${lesson.id}: owner-number boundary excludes teaching ${owner}`);
    }
  }
  const seenTasks = new Map();
  for (const exercise of [
    ...pack.tests.flatMap((test) => test.exercises),
    ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
  ]) {
    const cues = [...exercise.prompt.matchAll(/[“"]([^”"]+)[”"]/gu)].map((match) =>
      normalize(match[1]),
    );
    const taskKey = JSON.stringify([
      exercise.targetSkill,
      exercise.type,
      cues,
      normalize(exercise.acceptedAnswers[0]),
    ]);
    if (seenTasks.has(taskKey))
      errors.push(`${exercise.id}: repeated semantic task of ${seenTasks.get(taskKey)}`);
    seenTasks.set(taskKey, exercise.id);
    const owner = exercise.tags.find((tag) => tag.startsWith('owner-'))?.slice(6);
    const noun = exercise.tags.find((tag) => tag.startsWith('possessive-noun-'))?.slice(16);
    if (owner && !allowed.includes(owner))
      errors.push(`${exercise.id}: owner-number boundary excludes ${owner}`);
    if (noun && !NOUNS.includes(noun))
      errors.push(`${exercise.id}: noun must stay within the taught regular inventory`);
    const surfaces =
      exercise.type === 'translation-en'
        ? [
            exercise.sentenceExplanation?.parts.map((part) => part.finnish).join(' ') ??
              exercise.prompt.match(/“([^”]+)”/u)?.[1] ??
              '',
          ]
        : exercise.acceptedAnswers;
    for (const surface of surfaces) {
      const words = normalize(surface).split(' ');
      if (exercise.tags.includes('whose-question'))
        validateQuestion(exercise, words, noun ?? '', errors);
      else validateOwnedForm(exercise, words, owner ?? '', noun, errors);
    }
  }
  return errors;
}

function validateQuestion(exercise, words, noun, errors) {
  const plural = exercise.tags.includes('objects-plural');
  const form = noun + (plural ? 't' : '');
  if (words.length === 1 && exercise.type === 'fill-blank') {
    if (words[0] !== form)
      errors.push(`${exercise.id}: kenen needs an unsuffixed plural noun or basic singular noun`);
    return;
  }
  const demonstrative = plural ? 'nämä' : 'tämä';
  if (
    words.length !== 4 ||
    words[0] !== 'kenen' ||
    words[3] !== (plural ? 'ovat' : 'on') ||
    ![`${form} ${demonstrative}`, `${demonstrative} ${form}`].includes(words.slice(1, 3).join(' '))
  )
    errors.push(
      `${exercise.id}: kenen needs an unsuffixed plural noun or basic singular noun and matching agreement`,
    );
}

function validateOwnedForm(exercise, words, owner, noun, errors) {
  if (!noun) {
    const supplied = exercise.tags
      .find((tag) => tag.startsWith('supplied-possessive-noun-'))
      ?.slice(25);
    if (words.join(' ') !== (supplied ? `${owner} ${supplied}` : owner))
      errors.push(`${exercise.id}: use the requested genitive personal owner form`);
    return;
  }
  let ending = ENDINGS[OWNERS.indexOf(owner)];
  if (ending === 'nsa' && !/[aou]/u.test(noun)) ending = 'nsä';
  if (
    exercise.tags.includes('possessive-ending-vowel') ||
    exercise.tags.includes('possessive-ending-only')
  ) {
    const expected = exercise.tags.includes('possessive-ending-vowel') ? ending?.at(-1) : ending;
    if (words.join(' ') !== expected)
      errors.push(`${exercise.id}: isolated possessive ending must match owner and vowel harmony`);
    return;
  }
  if (words.at(-1) !== `${noun}${ending}`)
    errors.push(`${exercise.id}: drop plural -t and match the owner suffix and vowel harmony`);
  if (words.length === 1) {
    if (
      (exercise.tags.includes('sentence') && !exercise.prompt.includes('___')) ||
      !['fill-blank', 'multiple-choice'].includes(exercise.type)
    )
      errors.push(`${exercise.id}: write the complete ownership sentence or noun phrase`);
    return;
  }
  if (words.length === 2 && !exercise.tags.includes('sentence')) {
    if (words[0] !== owner) errors.push(`${exercise.id}: noun phrase owner must match its ending`);
    return;
  }
  const plural = exercise.tags.includes('objects-plural');
  if (
    words[0] !== (plural ? 'nämä' : 'tämä') ||
    words[1] !== (plural ? 'ovat' : 'on') ||
    ![3, 4].includes(words.length)
  )
    errors.push(`${exercise.id}: noun-number agreement requires nämä ovat or tämä on`);
  const explicit = words.length === 4 ? words[2] : undefined;
  if (explicit && explicit !== owner)
    errors.push(`${exercise.id}: owner pronoun must match its ending`);
  if (['hänen', 'heidän'].includes(owner) && explicit !== owner)
    errors.push(
      `${exercise.id}: retain the third-person owner pronoun in identification sentences`,
    );
}

function normalize(value) {
  return value
    .toLocaleLowerCase('fi-FI')
    .replace(/[.,!?]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}
