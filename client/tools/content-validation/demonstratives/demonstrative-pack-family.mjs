import { validateDemonstrativePractice } from './demonstrative-practice-expansion.mjs';

const RESPONSE_TYPES = [
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
];

const SINGULAR = {
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
  testCounts: [20, 24, 20, 20, 20, 24],
  reviewId: 'sdp-review',
  validateBoundary: validateSingularBoundary,
};
const PLURAL = {
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
  testCounts: [20, 24, 20, 20, 24, 20, 24],
  reviewId: 'pdp-review',
  validateBoundary: validatePluralBoundary,
};
const PAIRED_LESSON_IDS = [
  'sdp-singular-forms',
  'pdp-plural-forms',
  'sdp-reference-choice',
  'pdp-reference-choice',
  'sdp-independent-use',
  'pdp-independent-use',
  'sdp-noun-modifier',
  'pdp-noun-modifier',
  'pdp-number-agreement',
  'sdp-se-han',
  'pdp-ne-he',
];
const PACKS = {
  'demonstrative-pronouns': {
    skills: [...SINGULAR.skills, ...PLURAL.skills],
    lessonIds: PAIRED_LESSON_IDS,
    focusedSkills: PAIRED_LESSON_IDS.map((id) => {
      const scope = id.startsWith('sdp-') ? SINGULAR : PLURAL;
      return scope.skills[scope.lessonIds.indexOf(id)];
    }),
    testCounts: [20, 20, 24, 24, 20, 20, 20, 20, 24, 20, 20, 24, 24],
    reviewScopes: [SINGULAR, PLURAL],
    validateBoundary: validateNumberBoundaries,
  },
  'negative-demonstrative-statements': {
    skills: [
      'Singular negative demonstrative statements',
      'Plural negative demonstrative statements',
      'Demonstrative affirmative-to-negative transformation',
    ],
    lessonIds: ['nds-singular-negative', 'nds-plural-negative', 'nds-negative-transformation'],
    focusedTestIds: [
      'nds-singular-negative-test',
      'nds-plural-negative-test',
      'nds-negative-transformation-singular-test',
      'nds-negative-transformation-plural-test',
    ],
    testCounts: [20, 24, 10, 10, 24],
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

  const errors = validateDemonstrativePractice(pack);
  const lessons = pack.lessons ?? [];
  const tests = pack.tests ?? [];
  const scored = tests.flatMap((test) => test.exercises ?? []);
  const practice = lessons.flatMap((lesson) => lesson.practiceExercises ?? []);
  const expectedTestIds = [
    ...(config.focusedTestIds ?? config.lessonIds.map((lessonId) => `${lessonId}-test`)),
    ...(config.reviewScopes ?? [config]).map((scope) => scope.reviewId),
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
  validateInitialFormSupport(lessons, tests, errors);
  validateResponseTypes(scored, errors, prefix);
  validateParallelPairs(scored, errors);
  validateDistinctTasks(scored, errors, prefix);
  validateNaturalEnglish(pack, errors);
  validateMultipleChoiceFeedback([...scored, ...practice], errors);
  validateStandardRegister(pack, errors);
  config.validateBoundary(pack, errors);
  return errors;
}

function validateInitialFormSupport(lessons, tests, errors) {
  for (const lesson of lessons) {
    if (!/^(Singular|Plural) demonstrative forms$/u.test(lesson.targetSkills[0])) continue;
    const test = tests.find(
      (item) => item.stage === 'focused' && item.lessonIds.includes(lesson.id),
    );
    for (const exercise of [...(test?.exercises ?? []), ...(lesson.practiceExercises ?? [])]) {
      if (exercise.type === 'translation-en') continue;
      const expectedFrame = finnishAnswer(exercise).replace(/^\p{L}+/u, '___');
      if (!(exercise.prompt ?? '').includes(`Frame: “${expectedFrame}”`))
        errors.push(
          `${exercise.id}: initial form recall must visibly supply the Finnish sentence frame`,
        );
    }
  }
}

function validateTopology(lessons, tests, config, errors) {
  const focusedCount = (config.focusedTestIds ?? config.lessonIds).length;
  for (const test of tests.slice(0, focusedCount)) {
    const lessonIndex = config.lessonIds.indexOf(test.lessonIds?.[0]);
    const lesson = lessons[lessonIndex];
    const skill = (config.focusedSkills ?? config.skills)[lessonIndex];
    if (!lesson) continue;
    if (
      lesson.stage !== 'focused' ||
      test.stage !== 'focused' ||
      !sameList(lesson.targetSkills ?? [], [skill]) ||
      !sameList(test.targetSkills ?? [], [skill]) ||
      !sameList(test.lessonIds ?? [], [lesson.id]) ||
      test.exercises?.some((exercise) => exercise.targetSkill !== skill)
    )
      errors.push(test.id + ': Focused lesson and test must teach only ' + skill);
  }
  for (const scope of config.reviewScopes ?? [config]) {
    const review = tests.find((test) => test.id === scope.reviewId);
    if (
      review &&
      (review.stage !== 'review' ||
        !sameList(review.lessonIds ?? [], scope.lessonIds) ||
        !sameList(review.targetSkills ?? [], scope.skills))
    )
      errors.push(`${review.id}: Review must mix only the previously taught skills`);
    for (const exercise of review?.exercises ?? []) {
      if (
        !scope.skills.includes(exercise.targetSkill) ||
        !(exercise.requiredSkills ?? []).includes(exercise.targetSkill)
      )
        errors.push(
          `${exercise.id}: Review exercise must target and require a previously taught skill`,
        );
    }
  }
}

function validateNumberBoundaries(pack, errors) {
  validateSingularBoundary(
    { ...pack, tests: pack.tests.filter((test) => test.id.startsWith('sdp-')) },
    errors,
  );
  validatePluralBoundary(
    { ...pack, tests: pack.tests.filter((test) => test.id.startsWith('pdp-')) },
    errors,
  );
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
  if (/\bpreviously identified\b/iu.test(learnerFacing)) {
    errors.push(
      `${pack.id}: learner-facing English uses the authoring phrase “previously identified”`,
    );
  }
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
  const [singular, plural] = pack.tests;
  const transformations = pack.tests.filter(
    (test) => test.stage === 'focused' && test.lessonIds?.includes('nds-negative-transformation'),
  );
  if (singular?.exercises?.some((exercise) => !/\bei ole\b/iu.test(finnishAnswer(exercise))))
    errors.push(`${singular?.id}: every answer must keep singular ei ole`);
  if (plural?.exercises?.some((exercise) => !/\beivät ole\b/iu.test(finnishAnswer(exercise))))
    errors.push(`${plural?.id}: every answer must keep plural eivät ole`);
  const transformed = transformations.map(answerText).join(' ');
  if (!/\bei ole\b/iu.test(transformed) || !/\beivät ole\b/iu.test(transformed))
    errors.push(`${pack.id}: transformations must cover both negative agreement frames`);
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
