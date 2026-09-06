const RESPONSE_TYPES = [
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
];
const SPOKEN_FORMS = [
  'mä',
  'mää',
  'sä',
  'sää',
  'mie',
  'sie',
  'myö',
  'työ',
  'hyö',
  'oon',
  'oot',
  'ollaan',
  'ootte',
  'oonko',
  'oonks',
  'ootko',
  'ooks',
  'ollaanko',
  'ollaanks',
  'ootteko',
  'onks',
];
const SPOKEN_PATTERN = new RegExp(`(^|[^\\p{L}])(${SPOKEN_FORMS.join('|')})(?=$|[^\\p{L}])`, 'iu');
const LEGACY_REVIEW_BRIDGE = new Set(['ff-a1-t14-e02', 'ff-a1-t14-e03']);

const normalize = (text) =>
  text
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?]+$/u, '')
    .toLocaleLowerCase('fi-FI');

const sameList = (actual, expected) =>
  actual.length === expected.length && actual.every((item, index) => item === expected[index]);

export function validateFoundationsPack(pack, config) {
  const errors = [];
  const lessons = pack.lessons ?? [];
  const tests = pack.tests ?? [];
  const scored = tests.flatMap((test) => test.exercises ?? []);
  const practice = lessons.flatMap((lesson) => lesson.practiceExercises ?? []);
  const prefix = `${config.id}:`;

  if (pack.id !== config.id) errors.push(`${prefix} pack identity must remain stable`);
  if (pack.level !== '0 - A1.3') errors.push(`${prefix} level range must be 0 - A1.3`);
  if (!sameList(pack.importantSkills ?? [], config.skills))
    errors.push(`${prefix} important-skill sequence is incomplete or reordered`);
  if (
    !sameList(
      lessons.map((lesson) => lesson.id),
      config.lessonIds,
    )
  )
    errors.push(`${prefix} lesson sequence is incomplete or reordered`);
  if (
    !sameList(
      tests.map((test) => test.id),
      config.testIds,
    )
  )
    errors.push(`${prefix} test sequence is incomplete or reordered`);
  if (tests.slice(0, config.focusedCount).some((test) => test.stage !== 'focused'))
    errors.push(`${prefix} all Focused tests must precede Reviews`);
  if (tests.slice(config.focusedCount).some((test) => test.stage !== 'review'))
    errors.push(`${prefix} every test after the Focused sequence must be a Review`);
  if (
    !sameList(
      tests.map((test) => test.exercises?.length ?? 0),
      config.testCounts,
    )
  )
    errors.push(`${prefix} test counts must remain ${config.testCounts.join(', ')}`);
  if (
    !sameList(
      lessons.map((lesson) => lesson.practiceExercises?.length ?? 0),
      config.practiceCounts,
    )
  )
    errors.push(`${prefix} lesson practice counts must remain ${config.practiceCounts.join(', ')}`);
  if (scored.length !== config.scoredCount)
    errors.push(`${prefix} pack needs exactly ${config.scoredCount} scored exercises`);
  if (practice.length !== config.practiceCount)
    errors.push(`${prefix} pack needs exactly ${config.practiceCount} optional practice exercises`);
  if (scored.filter((exercise) => exercise.id.startsWith('ff-a1-')).length !== config.legacyScored)
    errors.push(`${prefix} legacy scored exercises were dropped or duplicated`);
  if (
    practice.filter((exercise) => exercise.id.startsWith('ff-a1-')).length !== config.legacyPractice
  )
    errors.push(`${prefix} legacy practice exercises were dropped or duplicated`);

  const scoredTypes = new Set(scored.map((exercise) => exercise.type));
  for (const type of RESPONSE_TYPES)
    if (!scoredTypes.has(type)) errors.push(`${prefix} scored work is missing ${type}`);

  validateFocusedMappings(tests, lessons, config, errors);
  validateDuplicates(scored, config.id, errors);
  validateParallelPairs(scored, errors);
  validateRegister(pack, errors);
  config.validateBoundary?.(pack, errors);
  return errors;
}

function validateFocusedMappings(tests, lessons, config, errors) {
  for (let index = 0; index < config.focusedCount; index += 1) {
    const test = tests[index];
    const lesson = lessons[index];
    const skill = config.skills[index];
    if (!test || !lesson) continue;
    if (
      test.targetSkills?.length !== 1 ||
      test.targetSkills[0] !== skill ||
      lesson.targetSkills?.length !== 1 ||
      lesson.targetSkills[0] !== skill ||
      test.lessonIds?.length !== 1 ||
      test.lessonIds[0] !== lesson.id
    ) {
      errors.push(`${test.id}: Focused test and lesson must share only the approved target`);
    }
    if (test.exercises?.some((exercise) => exercise.targetSkill !== skill))
      errors.push(`${test.id}: every Focused exercise must keep the test target`);
  }
}

function validateDuplicates(scored, packId, errors) {
  const exact = new Map();
  const sentenceTasks = new Map();
  for (const exercise of scored) {
    const answers = (exercise.acceptedAnswers ?? []).map(normalize).sort().join('|');
    const fingerprint = `${exercise.type}|${normalize(exercise.prompt ?? '')}|${answers}`;
    const prior = exact.get(fingerprint);
    if (prior) errors.push(`${exercise.id}: duplicates the scored task ${prior}`);
    else exact.set(fingerprint, exercise.id);

    if (!exercise.tags?.includes('sentence')) continue;
    const sentenceFingerprint = `${exercise.type}|${normalize(
      exercise.sentenceExplanation?.translation ?? '',
    )}|${answers}`;
    const priorSentence = sentenceTasks.get(sentenceFingerprint);
    if (priorSentence) errors.push(`${exercise.id}: repeats the sentence task ${priorSentence}`);
    else sentenceTasks.set(sentenceFingerprint, exercise.id);
  }
  if (exact.size !== scored.length)
    errors.push(`${packId}: scored tasks must remain semantically distinct`);
}

function validateParallelPairs(scored, errors) {
  const byId = new Map(scored.map((exercise) => [exercise.id, exercise]));
  for (const exercise of scored) {
    const partner = byId.get(exercise.parallelExerciseId);
    if (!partner) continue;
    const generatedPair = !exercise.id.startsWith('ff-a1-') && !partner.id.startsWith('ff-a1-');
    const bridge = LEGACY_REVIEW_BRIDGE.has(exercise.id) && LEGACY_REVIEW_BRIDGE.has(partner.id);
    if (generatedPair && !bridge && partner.type !== exercise.type)
      errors.push(`${exercise.id}: mastery partner ${partner.id} must use the same response type`);
    if (
      normalize(partner.acceptedAnswers?.[0] ?? '') ===
      normalize(exercise.acceptedAnswers?.[0] ?? '')
    )
      errors.push(`${exercise.id}: mastery partner ${partner.id} must use a different answer`);
  }
}

function validateRegister(pack, errors) {
  const learnerFacing = JSON.stringify({
    title: pack.title,
    summary: pack.summary,
    objectives: pack.objectives,
    lessons: pack.lessons,
    tests: pack.tests,
  });
  const violation = learnerFacing.match(SPOKEN_PATTERN)?.[0];
  if (violation)
    errors.push(`${pack.id}: learner-facing content contains excluded spoken form ${violation}`);
}

export function validateHarmonyBoundary(pack, errors) {
  const inessive = pack.tests.find((test) => test.id === 'harmony-in-forms');
  for (const exercise of inessive?.exercises ?? []) {
    if (/weakens|lengthens|stem change|changes to|genitive/iu.test(exercise.explanation))
      errors.push(`${exercise.id}: focused inessive work contains a hidden stem transformation`);
  }
  if (JSON.stringify(pack).includes('pöydässä'))
    errors.push(`${pack.id}: the stable-stem inessive scope must not hide pöytä → pöydässä`);
}

export function validateKptBoundary(pack, errors) {
  const nounProduction = new Set([
    'test-kpt-doubles',
    'test-kpt-singles',
    'test-kpt-special-k',
    'test-kpt-clusters',
  ]);
  for (const test of pack.tests) {
    for (const exercise of test.exercises ?? []) {
      if (exercise.type !== 'fill-blank') continue;
      if (nounProduction.has(test.id)) {
        const isVerb = /“to [^”]+”/u.test(exercise.prompt);
        if (isVerb && !/supplied stem.+minä -n/iu.test(exercise.prompt))
          errors.push(`${exercise.id}: KPT-only verb production must supply its stem and minä -n`);
        if (!isVerb && !/supplied genitive(?: ending)? -n/iu.test(exercise.prompt))
          errors.push(`${exercise.id}: KPT-only noun production must supply genitive -n`);
      }
      if (test.id === 'kpt-nouns' && !/supplied (?:weak )?stem/iu.test(exercise.prompt))
        errors.push(`${exercise.id}: genitive-focused production must supply its stem`);
      if (
        test.id === 'kpt-verbs' &&
        !/supplied (?:subject minä, )?stem.+minä ending -n/iu.test(exercise.prompt)
      )
        errors.push(`${exercise.id}: KPT-only verb production must supply its stem and minä -n`);
    }
  }
}

export function validatePluralBoundary(pack, errors) {
  for (const exercise of pack.tests.find((test) => test.id === 'test-kpt-t-plural')?.exercises ??
    []) {
    if (
      exercise.type === 'fill-blank' &&
      !/(?:supplied plural(?: ending)?|add plural) -t/iu.test(exercise.prompt)
    )
      errors.push(`${exercise.id}: KPT plural production must supply plural -t`);
  }
  for (const exercise of pack.tests.find((test) => test.id === 'plural-verb-harmony')?.exercises ??
    []) {
    if (
      ['fill-blank', 'translation-fi'].includes(exercise.type) &&
      !/(?:supplied stem|[a-zäö]+- \+ -(?:vat|vät))/iu.test(
        `${exercise.prompt} ${exercise.explanation}`,
      )
    )
      errors.push(`${exercise.id}: -vat/-vät work must visibly supply its stem`);
  }
}
