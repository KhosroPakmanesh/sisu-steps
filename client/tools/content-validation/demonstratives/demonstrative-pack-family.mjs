const RESPONSE_TYPES = [
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
];

const PACKS = {
  'singular-demonstrative-pronouns': {
    skills: [
      'Singular demonstrative forms',
      'Singular demonstrative reference',
      'Independent singular demonstratives',
      'Singular demonstratives before nouns',
      'Standard singular person reference',
    ],
    lessonIds: [
      'sdp-singular-forms',
      'sdp-reference-choice',
      'sdp-independent-use',
      'sdp-noun-modifier',
      'sdp-se-han',
    ],
    testCounts: [20, 24, 16, 20, 16, 24],
    reviewId: 'sdp-review',
    validateBoundary: validateSingularBoundary,
  },
  'plural-demonstrative-pronouns': {
    skills: [
      'Plural demonstrative forms',
      'Plural demonstrative reference',
      'Independent plural demonstratives',
      'Plural demonstratives before nouns',
      'Plural demonstrative-noun agreement',
      'Standard plural person reference',
    ],
    lessonIds: [
      'pdp-plural-forms',
      'pdp-reference-choice',
      'pdp-independent-use',
      'pdp-noun-modifier',
      'pdp-number-agreement',
      'pdp-ne-he',
    ],
    testCounts: [20, 24, 16, 20, 24, 16, 24],
    reviewId: 'pdp-review',
    validateBoundary: validatePluralBoundary,
  },
  'negative-demonstrative-statements': {
    skills: [
      'Singular negative demonstrative statements',
      'Plural negative demonstrative statements',
      'Demonstrative affirmative-to-negative transformation',
    ],
    lessonIds: ['nds-singular-negative', 'nds-plural-negative', 'nds-negative-transformation'],
    testCounts: [20, 24, 20, 24],
    reviewId: 'nds-review',
    validateBoundary: validateNegativeBoundary,
  },
  'demonstrative-questions': {
    skills: [
      'Singular demonstrative identity questions',
      'Plural demonstrative classification questions',
      'Singular affirmative demonstrative questions',
      'Plural affirmative demonstrative questions',
      'Singular negative demonstrative questions',
      'Plural negative demonstrative questions',
    ],
    lessonIds: [
      'dqs-what-singular',
      'dqs-what-plural',
      'dqs-yesno-singular',
      'dqs-yesno-plural',
      'dqs-negative-singular',
      'dqs-negative-plural',
    ],
    testCounts: [20, 24, 20, 20, 20, 24, 32],
    reviewId: 'dqs-review',
    validateBoundary: validateQuestionBoundary,
  },
  'inessive-demonstrative-forms': {
    skills: [
      'Singular inessive demonstratives',
      'Plural inessive demonstratives',
      'Singular inessive demonstrative-noun agreement',
      'Plural inessive demonstrative-noun agreement',
    ],
    lessonIds: [
      'idf-singular-inessive',
      'idf-plural-inessive',
      'idf-singular-modifier',
      'idf-plural-modifier',
    ],
    testCounts: [24, 24, 20, 24, 28],
    reviewId: 'idf-review',
    validateBoundary: validateInessiveBoundary,
  },
};

const normalize = (value) =>
  value
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[.!?]+$/u, '')
    .toLocaleLowerCase('fi-FI');

const sameList = (actual, expected) =>
  actual.length === expected.length && actual.every((item, index) => item === expected[index]);

const containsWord = (text, value) =>
  new RegExp(`(^|[^\\p{L}])${value}(?=$|[^\\p{L}])`, 'iu').test(text);

const acceptedFinnish = (exercise) =>
  exercise.type === 'translation-en'
    ? (exercise.sentenceExplanation?.parts ?? [])
    : exercise.acceptedAnswers;

export function validateDemonstrativePack(pack) {
  const config = PACKS[pack.id];
  if (!config) return [`${pack.id}: no demonstrative-pack validation contract exists`];

  const errors = [];
  const lessons = pack.lessons ?? [];
  const tests = pack.tests ?? [];
  const scored = tests.flatMap((test) => test.exercises ?? []);
  const practice = lessons.flatMap((lesson) => lesson.practiceExercises ?? []);
  const expectedTestIds = [
    ...config.lessonIds.map((lessonId) => `${lessonId}-test`),
    config.reviewId,
  ];
  const prefix = `${pack.id}:`;

  if (pack.level !== '0 - A1.3') errors.push(`${prefix} level must remain 0 - A1.3`);
  if (!sameList(pack.importantSkills ?? [], config.skills))
    errors.push(`${prefix} important skills are incomplete or reordered`);
  if (
    !sameList(
      lessons.map((lesson) => lesson.id),
      config.lessonIds,
    )
  )
    errors.push(`${prefix} lessons are incomplete or reordered`);
  if (
    !sameList(
      tests.map((test) => test.id),
      expectedTestIds,
    )
  )
    errors.push(`${prefix} tests are incomplete or reordered`);
  if (
    !sameList(
      tests.map((test) => test.exercises?.length ?? 0),
      config.testCounts,
    )
  )
    errors.push(`${prefix} test counts must remain ${config.testCounts.join(', ')}`);
  if (lessons.some((lesson) => lesson.practiceExercises?.length !== 4))
    errors.push(`${prefix} every Focused lesson must keep four optional practice exercises`);
  if (scored.length !== config.testCounts.reduce((total, count) => total + count, 0))
    errors.push(`${prefix} scored exercise total does not match the approved distribution`);
  if (practice.length !== config.lessonIds.length * 4)
    errors.push(`${prefix} optional practice total does not match the approved distribution`);

  validateTopology(lessons, tests, config, errors);
  validateInitialFormSupport(lessons, tests, config, errors);
  validateResponseTypes(scored, errors, prefix);
  validateParallelPairs(scored, errors);
  validateDistinctTasks(scored, errors, prefix);
  validateNaturalEnglish(pack, errors);
  validateMultipleChoiceFeedback([...scored, ...practice], errors);
  validateStandardRegister(pack, errors);
  config.validateBoundary(pack, errors);
  return errors;
}

function validateInitialFormSupport(lessons, tests, config, errors) {
  if (!/^(Singular|Plural) demonstrative forms$/u.test(config.skills[0])) return;
  const exercises = [...(tests[0]?.exercises ?? []), ...(lessons[0]?.practiceExercises ?? [])];
  for (const exercise of exercises) {
    if (exercise.type === 'translation-en') continue;
    const finnish = finnishAnswer(exercise);
    const expectedFrame = finnish.replace(/^\p{L}+/u, '___');
    if (!(exercise.prompt ?? '').includes(`Finnish frame: “${expectedFrame}”`)) {
      errors.push(
        `${exercise.id}: initial form recall must visibly supply the Finnish sentence frame`,
      );
    }
  }
}

function validateTopology(lessons, tests, config, errors) {
  for (let index = 0; index < config.lessonIds.length; index += 1) {
    const lesson = lessons[index];
    const test = tests[index];
    const skill = config.skills[index];
    if (!lesson || !test) continue;
    if (
      lesson.stage !== 'focused' ||
      test.stage !== 'focused' ||
      !sameList(lesson.targetSkills ?? [], [skill]) ||
      !sameList(test.targetSkills ?? [], [skill]) ||
      !sameList(test.lessonIds ?? [], [lesson.id]) ||
      test.exercises?.some((exercise) => exercise.targetSkill !== skill)
    ) {
      errors.push(`${test.id}: Focused lesson and test must teach only ${skill}`);
    }
  }
  const review = tests.at(-1);
  if (
    review &&
    (review.stage !== 'review' ||
      !sameList(review.lessonIds ?? [], config.lessonIds) ||
      !sameList(review.targetSkills ?? [], config.skills))
  ) {
    errors.push(`${review.id}: Review must mix only the previously taught skills`);
  }
  for (const exercise of review?.exercises ?? []) {
    if (
      !config.skills.includes(exercise.targetSkill) ||
      !(exercise.requiredSkills ?? []).includes(exercise.targetSkill)
    ) {
      errors.push(
        `${exercise.id}: Review exercise must target and require a previously taught skill`,
      );
    }
  }
}

function validateResponseTypes(scored, errors, prefix) {
  const types = new Set(scored.map((exercise) => exercise.type));
  for (const type of RESPONSE_TYPES)
    if (!types.has(type)) errors.push(`${prefix} scored work is missing ${type}`);
}

function validateParallelPairs(scored, errors) {
  const byId = new Map(scored.map((exercise) => [exercise.id, exercise]));
  for (const exercise of scored) {
    const partner = byId.get(exercise.parallelExerciseId);
    if (!partner) continue;
    if (partner.parallelExerciseId !== exercise.id)
      errors.push(`${exercise.id}: mastery-pair relationship must be mutual`);
    if (partner.type !== exercise.type)
      errors.push(`${exercise.id}: mastery partner must use the same response type`);
    if (
      normalize(partner.acceptedAnswers?.[0] ?? '') ===
      normalize(exercise.acceptedAnswers?.[0] ?? '')
    )
      errors.push(`${exercise.id}: mastery partner must use a different answer`);
  }
}

function validateDistinctTasks(scored, errors, prefix) {
  const fingerprints = new Map();
  for (const exercise of scored) {
    const fingerprint = [
      exercise.targetSkill,
      exercise.type,
      normalize(finnishAnswer(exercise)),
    ].join('|');
    const prior = fingerprints.get(fingerprint);
    if (prior) errors.push(`${exercise.id}: repeats the sentence task ${prior}`);
    else fingerprints.set(fingerprint, exercise.id);
  }
  if (fingerprints.size !== scored.length)
    errors.push(`${prefix} every scored task must remain semantically distinct`);
}

function validateNaturalEnglish(pack, errors) {
  const learnerFacing = JSON.stringify(pack);
  const malformed = learnerFacing.match(
    /\b(?:childs|referent is (?:teacher|child|dog|car)|over there here|those are over there|it or that known one|they or those known ones|it or that identifiable one|they or those identifiable ones|that over there (?:book|car|house|bag|key|chair)|those over there (?:books|cars|houses|bags|keys|chairs))\b/iu,
  )?.[0];
  if (malformed)
    errors.push(`${pack.id}: learner-facing English contains malformed gloss “${malformed}”`);
}

function validateMultipleChoiceFeedback(exercises, errors) {
  for (const exercise of exercises) {
    if (exercise.type !== 'multiple-choice') continue;
    const correct = exercise.acceptedAnswers?.[0];
    const wrongFeedback = (exercise.options ?? [])
      .filter((option) => option !== correct)
      .map((option) => exercise.optionFeedback?.[option]?.trim())
      .filter(Boolean);
    if (new Set(wrongFeedback).size !== wrongFeedback.length) {
      errors.push(`${exercise.id}: each wrong option needs distinct diagnostic feedback`);
    }
    if (
      wrongFeedback.some((feedback) =>
        /^This choice does not express the required form\./u.test(feedback),
      )
    ) {
      errors.push(`${exercise.id}: wrong-option feedback must identify the actual error`);
    }
  }
}

function validateStandardRegister(pack, errors) {
  const learnerFacing = JSON.stringify(pack);
  const spoken = learnerFacing.match(
    /(^|[^\p{L}])(mä|mää|sä|sää|mie|sie|myö|työ|hyö|oon|oot|ollaan|ootte|onks|tää|toi|nää|noi)(?=$|[^\p{L}])/iu,
  )?.[2];
  if (spoken)
    errors.push(
      `${pack.id}: learner-facing content contains excluded spoken form ${spoken.toLocaleLowerCase('fi-FI')}`,
    );
}

function answerText(test) {
  return (test?.exercises ?? [])
    .flatMap((exercise) => acceptedFinnish(exercise))
    .map((value) => (typeof value === 'string' ? value : (value.finnish ?? '')))
    .join(' ');
}

function finnishAnswer(exercise) {
  if (exercise.type !== 'translation-en') return exercise.acceptedAnswers?.[0] ?? '';
  return (exercise.sentenceExplanation?.parts ?? []).map((part) => part.finnish).join(' ');
}

function validateSingularBoundary(pack, errors) {
  const human = pack.tests.find((test) => test.id === 'sdp-se-han-test');
  if (!/\bhän\b/iu.test(answerText(human)) || !/\bse\b/iu.test(answerText(human)))
    errors.push(`${human?.id}: standard person reference must assess both hän and se`);
  if (
    ['nämä', 'nuo', 'ne'].some((form) => containsWord(pack.tests.map(answerText).join(' '), form))
  )
    errors.push(`${pack.id}: singular Focused answers must not require plural demonstratives`);
}

function validatePluralBoundary(pack, errors) {
  const human = pack.tests.find((test) => test.id === 'pdp-ne-he-test');
  if (!/\bhe\b/iu.test(answerText(human)) || !/\bne\b/iu.test(answerText(human)))
    errors.push(`${human?.id}: standard person reference must assess both he and ne`);
  if (
    ['tämä', 'tuo', 'se'].some((form) => containsWord(pack.tests.map(answerText).join(' '), form))
  )
    errors.push(`${pack.id}: plural Focused answers must not require singular demonstratives`);
}

function validateNegativeBoundary(pack, errors) {
  const [singular, plural, transformation] = pack.tests;
  if (singular?.exercises?.some((exercise) => !/\bei ole\b/iu.test(finnishAnswer(exercise))))
    errors.push(`${singular?.id}: every answer must keep singular ei ole`);
  if (plural?.exercises?.some((exercise) => !/\beivät ole\b/iu.test(finnishAnswer(exercise))))
    errors.push(`${plural?.id}: every answer must keep plural eivät ole`);
  const transformed = answerText(transformation);
  if (!/\bei ole\b/iu.test(transformed) || !/\beivät ole\b/iu.test(transformed))
    errors.push(`${transformation?.id}: transformations must cover both negative agreement frames`);
  for (const test of pack.tests) {
    for (const exercise of test.exercises ?? []) {
      const finnish = finnishAnswer(exercise);
      if (
        exercise.targetSkill === 'Singular negative demonstrative statements' &&
        !/\bei ole\b/iu.test(finnish)
      ) {
        errors.push(`${exercise.id}: singular negative target must keep ei ole`);
      }
      if (
        exercise.targetSkill === 'Plural negative demonstrative statements' &&
        !/\beivät ole\b/iu.test(finnish)
      ) {
        errors.push(`${exercise.id}: plural negative target must keep eivät ole`);
      }
      if (
        exercise.targetSkill === 'Demonstrative affirmative-to-negative transformation' &&
        !/\b(?:ei|eivät) ole\b/iu.test(finnish)
      ) {
        errors.push(`${exercise.id}: transformation target must produce a negative olla frame`);
      }
    }
  }
}

function validateQuestionBoundary(pack, errors) {
  const patterns = new Map([
    ['Singular demonstrative identity questions', /^Mikä .+ on\?$/u],
    ['Plural demonstrative classification questions', /^Mitä .+ ovat\?$/u],
    ['Singular affirmative demonstrative questions', /^Onko .+\?$/u],
    ['Plural affirmative demonstrative questions', /^Ovatko .+\?$/u],
    ['Singular negative demonstrative questions', /^Eikö .+ ole .+\?$/u],
    ['Plural negative demonstrative questions', /^Eivätkö .+ ole .+\?$/u],
  ]);
  for (const test of pack.tests) {
    for (const exercise of test?.exercises ?? []) {
      const pattern = patterns.get(exercise.targetSkill);
      if (!pattern) continue;
      const answer = `${finnishAnswer(exercise).replace(/[.!?]+$/u, '')}?`;
      if (!pattern.test(answer))
        errors.push(`${exercise.id}: answer leaves the approved beginner question frame`);
    }
  }
  if (containsWord(pack.tests.map(answerText).join(' '), 'mitkä'))
    errors.push(`${pack.id}: accepted answers must not introduce deferred mitkä`);
}

function validateInessiveBoundary(pack, errors) {
  const requiredForms = [
    ['tässä', 'tuossa', 'siinä'],
    ['näissä', 'noissa', 'niissä'],
    ['tässä', 'tuossa', 'siinä'],
    ['näissä', 'noissa', 'niissä'],
  ];
  for (const [index, forms] of requiredForms.entries()) {
    const text = answerText(pack.tests[index]);
    for (const form of forms)
      if (!containsWord(text, form))
        errors.push(`${pack.tests[index]?.id}: Focused answers must cover ${form}`);
  }
  if (
    ['täällä', 'tuolla', 'siellä'].some((form) =>
      containsWord(pack.tests.map(answerText).join(' '), form),
    )
  )
    errors.push(`${pack.id}: accepted answers must not substitute broader location adverbs`);

  const independentSkills = new Set([
    'Singular inessive demonstratives',
    'Plural inessive demonstratives',
  ]);
  const exercises = [
    ...pack.tests.flatMap((test) => test.exercises ?? []),
    ...pack.lessons.flatMap((lesson) => lesson.practiceExercises ?? []),
  ];
  for (const exercise of exercises) {
    const skills = new Set([exercise.targetSkill, ...(exercise.requiredSkills ?? [])]);
    if (![...skills].some((skill) => independentSkills.has(skill))) continue;
    const finnish = finnishAnswer(exercise);
    const expectedCue =
      containsWord(finnish, 'tässä') || containsWord(finnish, 'näissä')
        ? /\bnearby\b/iu
        : containsWord(finnish, 'tuossa') || containsWord(finnish, 'noissa')
          ? /\bfarther-away\b/iu
          : /\bidentified earlier\b/iu;
    if (!/^Context:/u.test(exercise.prompt ?? '') || !expectedCue.test(exercise.prompt ?? '')) {
      errors.push(
        `${exercise.id}: independent inessive task needs an explicit matching bounded-location context`,
      );
    }
    if (exercise.type === 'translation-en' && (exercise.acceptedAnswers?.length ?? 0) < 2) {
      errors.push(
        `${exercise.id}: independent inessive translation needs a natural here/there alternative`,
      );
    }
  }
}
