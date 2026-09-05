const RESPONSE_TYPES = [
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
];
const PERSON_TAGS = ['mina', 'sina', 'han', 'me', 'te', 'he'].map((key) => `person-${key}`);
const CONSTRUCTION_TAGS = [
  'pronoun',
  'affirmative',
  'negative',
  'positive-question',
  'negative-question',
  'short-answer',
];
const SPOKEN_OR_NONSTANDARD = [
  'mä',
  'mää',
  'sä',
  'sää',
  'mie',
  'sie',
  'myö',
  'työ',
  'hyö',
  'se',
  'ne',
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
const SPOKEN_PATTERN = new RegExp(
  `(^|[^\\p{L}])(${SPOKEN_OR_NONSTANDARD.join('|')})(?=$|[^\\p{L}])`,
  'iu',
);

const normalize = (text) =>
  text
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?]+$/u, '')
    .toLocaleLowerCase('fi-FI');
const sameList = (actual, expected) =>
  actual.length === expected.length && actual.every((item, index) => item === expected[index]);

export function validateOllaPack(pack, config) {
  const errors = [];
  const lessons = pack.lessons ?? [];
  const tests = pack.tests ?? [];
  const scored = tests.flatMap((test) => test.exercises ?? []);
  const practice = lessons.flatMap((lesson) => lesson.practiceExercises ?? []);
  const prefix = `${config.id}:`;

  if (pack.id !== config.id) errors.push(`${prefix} pack identity must remain stable`);
  if (pack.level !== '0 - A1.3') errors.push(`${prefix} level range must be 0 - A1.3`);
  if (pack.summary !== config.summary)
    errors.push(`${prefix} summary must state the standard-Finnish boundary once at pack level`);
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
    errors.push(`${prefix} all declared Focused tests must precede Reviews`);
  if (tests.slice(config.focusedCount).some((test) => test.stage !== 'review'))
    errors.push(`${prefix} every test after the Focused sequence must be a Review`);
  if (
    tests.some(
      (test, index) =>
        config.exerciseCounts[index] !== undefined &&
        test.exercises?.length !== config.exerciseCounts[index],
    )
  )
    errors.push(`${prefix} authored test counts must remain ${config.exerciseCounts.join(', ')}`);
  if (scored.length !== config.scoredCount)
    errors.push(`${prefix} pack needs exactly ${config.scoredCount} scored exercises`);
  if (lessons.some((lesson) => lesson.practiceExercises?.length !== 4))
    errors.push(`${prefix} every lesson needs exactly four optional practice items`);
  if (practice.length !== config.practiceCount)
    errors.push(`${prefix} pack needs exactly ${config.practiceCount} optional practice exercises`);

  const scoredTypes = new Set(scored.map((exercise) => exercise.type));
  const practiceTypes = new Set(practice.map((exercise) => exercise.type));
  for (const type of RESPONSE_TYPES) {
    if (!scoredTypes.has(type)) errors.push(`${prefix} scored work is missing ${type}`);
    if (!practiceTypes.has(type)) errors.push(`${prefix} optional practice is missing ${type}`);
  }

  validateFocusedMappings(tests, lessons, config, errors);
  validateCoverage(scored, practice, config, errors);
  validateDuplicateTasks(scored, config.id, errors);
  validateParallelPairs(scored, errors);
  validateRegisterBoundary(pack, lessons, tests, config, errors);
  validateTe(scored, practice, config, errors);
  return errors;
}

function validateFocusedMappings(tests, lessons, config, errors) {
  for (let index = 0; index < config.focusedCount; index += 1) {
    const test = tests[index];
    const lesson = lessons[index];
    if (!test || !lesson) continue;
    if (
      test.targetSkills?.length !== 1 ||
      test.targetSkills[0] !== config.skills[index] ||
      lesson.targetSkills?.length !== 1 ||
      lesson.targetSkills[0] !== config.skills[index] ||
      test.lessonIds?.length !== 1 ||
      test.lessonIds[0] !== config.lessonIds[index]
    ) {
      errors.push(`${test.id}: Focused test and lesson must share only the approved target`);
    }
    if (test.exercises?.some((exercise) => exercise.targetSkill !== config.skills[index]))
      errors.push(`${test.id}: every Focused exercise must keep the test target`);
  }
}

function validateCoverage(scored, practice, config, errors) {
  const all = [...scored, ...practice];
  for (const tag of PERSON_TAGS) {
    const count = scored.filter((exercise) => exercise.tags?.includes(tag)).length;
    if (count < config.personMinimum)
      errors.push(`${config.id}: ${tag} needs at least ${config.personMinimum} scored questions`);
  }
  for (const [tag, minimum] of Object.entries(config.coverage)) {
    const count = scored.filter((exercise) => exercise.tags?.includes(tag)).length;
    if (count < minimum)
      errors.push(`${config.id}: ${tag} needs at least ${minimum} scored questions`);
  }
  const allowed = new Set(config.allowedConstructionTags);
  const violation = all.find((exercise) =>
    CONSTRUCTION_TAGS.some((tag) => exercise.tags?.includes(tag) && !allowed.has(tag)),
  );
  if (violation) errors.push(`${violation.id}: construction falls outside the pack boundary`);
  if (config.genderNeutralMinimum > 0) {
    const count = scored.filter((exercise) =>
      exercise.tags?.includes('gender-neutral-reference'),
    ).length;
    if (count < config.genderNeutralMinimum)
      errors.push(
        `${config.id}: hän/he gender-neutral reference needs at least ${config.genderNeutralMinimum} questions`,
      );
  }
}

function validateDuplicateTasks(scored, packId, errors) {
  const exact = new Map();
  const sentenceTasks = new Map();
  for (const exercise of scored) {
    const answers = (exercise.acceptedAnswers ?? []).map(normalize).sort().join('|');
    const fingerprint = `${exercise.type}|${normalize(exercise.prompt ?? '')}|${answers}`;
    const prior = exact.get(fingerprint);
    if (prior) errors.push(`${exercise.id}: duplicates the scored task ${prior}`);
    else exact.set(fingerprint, exercise.id);
    if (!exercise.tags?.includes('sentence') || exercise.tags?.includes('short-answer')) continue;
    const sentenceFingerprint = `${exercise.type}|${normalize(
      exercise.sentenceExplanation?.translation ?? '',
    )}|${answers}`;
    const priorSentence = sentenceTasks.get(sentenceFingerprint);
    if (priorSentence)
      errors.push(
        `${exercise.id}: repeats the sentence task ${priorSentence} with new scaffolding`,
      );
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
    if (partner.type !== exercise.type)
      errors.push(`${exercise.id}: mastery partner ${partner.id} must use the same response type`);
    if (
      normalize(partner.acceptedAnswers?.[0] ?? '') ===
      normalize(exercise.acceptedAnswers?.[0] ?? '')
    )
      errors.push(
        `${exercise.id}: mastery partner ${partner.id} must have a different normalized answer`,
      );
  }
}

function validateRegisterBoundary(pack, lessons, tests, config, errors) {
  const learnerFacing = [
    pack.title,
    pack.level,
    ...(pack.objectives ?? []),
    ...(pack.importantSkills ?? []),
    ...lessons.flatMap((lesson) => [
      lesson.title,
      lesson.summary,
      ...(lesson.objectives ?? []),
      ...(lesson.targetSkills ?? []),
      ...(lesson.sections ?? []).flatMap((section) => [
        section.title,
        ...(section.paragraphs ?? []),
        ...(section.keyPoints ?? []),
      ]),
      ...(lesson.examples ?? []).flatMap((example) => [
        example.finnish,
        example.english,
        ...(example.steps ?? []),
      ]),
      ...(lesson.commonMistakes ?? []),
      ...(lesson.practiceExercises ?? []).flatMap(exerciseStrings),
    ]),
    ...tests.flatMap((test) => [
      test.title,
      test.focus,
      ...(test.targetSkills ?? []),
      ...(test.exercises ?? []).flatMap(exerciseStrings),
    ]),
  ].filter((value) => typeof value === 'string');
  const repeatedRegisterLabel = learnerFacing.find((value) =>
    /\b(?:standard|written)\b/iu.test(value),
  );
  if (repeatedRegisterLabel)
    errors.push(
      `${config.id}: learner-facing content repeats the pack-level register label in “${repeatedRegisterLabel}”`,
    );
  const violation = learnerFacing.find((value) => SPOKEN_PATTERN.test(value));
  if (violation)
    errors.push(
      `${config.id}: learner-facing content contains a spoken or excluded form in “${violation}”`,
    );
  for (const exercise of [...tests, ...lessons].flatMap(
    (item) => item.exercises ?? item.practiceExercises ?? [],
  )) {
    const accepted = new Set((exercise.acceptedAnswers ?? []).map(normalize));
    for (const diagnostic of exercise.answerDiagnostics ?? []) {
      for (const answer of diagnostic.answers ?? []) {
        if (accepted.has(normalize(answer)))
          errors.push(`${exercise.id}: a diagnostic spoken form is also accepted`);
      }
    }
  }
}

function exerciseStrings(exercise) {
  return [
    exercise.instruction,
    exercise.prompt,
    exercise.explanation,
    exercise.targetSkill,
    ...(exercise.requiredSkills ?? []),
    exercise.misconceptionCategory,
    ...(exercise.acceptedAnswers ?? []),
    ...(exercise.options ?? []),
    ...(exercise.tokens ?? []),
    exercise.sentenceExplanation?.translation,
    exercise.sentenceExplanation?.pattern,
    ...(exercise.sentenceExplanation?.parts ?? []).flatMap((part) => [
      part.finnish,
      part.meaning,
      part.role,
      part.baseForm,
      part.formation,
    ]),
    ...Object.values(exercise.optionFeedback ?? {}),
    ...(exercise.answerDiagnostics ?? []).flatMap((diagnostic) => [
      diagnostic.category,
      diagnostic.explanation,
    ]),
  ];
}

function validateTe(scored, practice, config, errors) {
  const all = [...scored, ...practice];
  const polite = all.filter((exercise) => exercise.tags?.includes('te-polite'));
  const plural = all.filter((exercise) => exercise.tags?.includes('te-plural'));
  if (polite.length < config.politeTeMinimum)
    errors.push(
      `${config.id}: polite singular te needs at least ${config.politeTeMinimum} exercises`,
    );
  if (plural.length < config.pluralTeMinimum)
    errors.push(`${config.id}: plural te needs at least ${config.pluralTeMinimum} exercises`);
  for (const exercise of polite) {
    const content = exerciseStrings(exercise).join(' ').toLocaleLowerCase('fi-FI');
    if (!/(olette|ette ole|oletteko|ettekö|addressed politely|polite)/u.test(content))
      errors.push(`${exercise.id}: polite te must visibly retain plural agreement`);
  }
  for (const exercise of all) {
    const normalizedAnswers = (exercise.acceptedAnswers ?? []).map(normalize);
    if (new Set(normalizedAnswers).size !== normalizedAnswers.length)
      errors.push(
        `${exercise.id}: capitalization must not create a separate accepted grammar answer`,
      );
  }
}
