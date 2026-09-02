const KPT_PRODUCTION_LESSON_IDS = ['kpt-doubles', 'kpt-singles', 'kpt-special-k', 'kpt-clusters'];
const KPT_LESSON_IDS = [...KPT_PRODUCTION_LESSON_IDS, 'kpt-basics'];
const KPT_PRODUCTION_TEST_IDS = new Set(
  KPT_PRODUCTION_LESSON_IDS.map((lessonId) => `test-${lessonId}`),
);
const VERB_KPT_SKILL = 'Minä verb forms with KPT';
const RETIRED_OBJECT_DEPENDENT_VERBS = new Set(['ottaa', 'hakea', 'antaa', 'kertoa', 'pukea']);
const VERB_KPT_REVIEW_BRIDGE = new Set(['ff-a1-t14-e02', 'ff-a1-t14-e03']);
const ARRIVAL_TRANSLATIONS = [
  'I am arriving today',
  "I'm arriving today",
  'I arrive today',
  'I will arrive today',
  "I'll arrive today",
];

export function validatePack(pack) {
  const errors = [];
  const lessons = pack.lessons ?? [];
  for (const lessonId of KPT_LESSON_IDS) {
    const lesson = lessons.find((candidate) => candidate.id === lessonId);
    if (!lesson) {
      errors.push(`${lessonId}: required KPT learning block is missing`);
      continue;
    }
    if (lesson.examples?.length < 2)
      errors.push(`${lessonId}: needs at least two worked contrasts`);
    if (lesson.practiceExercises?.length < 4)
      errors.push(`${lessonId}: difficult KPT lesson needs at least four practice exercises`);
  }
  const kptOnlyProduction = [
    ...pack.tests
      .filter((test) => KPT_PRODUCTION_TEST_IDS.has(test.id))
      .flatMap((test) => test.exercises ?? []),
    ...lessons
      .filter((lesson) => KPT_PRODUCTION_LESSON_IDS.includes(lesson.id))
      .flatMap((lesson) => lesson.practiceExercises ?? []),
  ].filter((exercise) => exercise.type === 'fill-blank');
  for (const exercise of kptOnlyProduction) {
    const isVerb = /“to [^”]+”/.test(exercise.prompt);
    if (isVerb && !/supplied stem .+minä -n/i.test(exercise.prompt))
      errors.push(`${exercise.id}: KPT-only verb production must supply its stem and minä ending`);
    if (!isVerb && !/supplied genitive(?: ending)? -n/i.test(exercise.prompt))
      errors.push(`${exercise.id}: KPT-only noun production must supply the genitive ending`);
  }
  for (const exercise of pack.tests.find((test) => test.id === 'harmony-in-forms')?.exercises ??
    []) {
    if (/weakens|lengthens|stem change|changes to/i.test(exercise.explanation))
      errors.push(`${exercise.id}: focused inessive item contains a hidden stem transformation`);
  }
  for (const exercise of pack.tests.find((test) => test.id === 'plural-verb-harmony')?.exercises ??
    []) {
    if (!/supplied/i.test(exercise.explanation))
      errors.push(`${exercise.id}: -vat/-vät item must state that its stem is supplied`);
  }
  for (const exercise of pack.tests.find((test) => test.id === 'plural-in-sentences')?.exercises ??
    []) {
    const parts = exercise.sentenceExplanation?.parts ?? [];
    if (!parts[0]?.formation?.includes('stem stays unchanged'))
      errors.push(`${exercise.id}: plural-sentence subject must use a stable stem`);
    if (!parts[2]?.formation?.includes('supplied as a complete fixed word'))
      errors.push(`${exercise.id}: plural-sentence context must be supplied as a fixed word`);
  }
  return [...errors, ...validateVerbKptSentences(pack), ...validateFoundationsReview(pack)];
}

function validateVerbKptSentences(pack) {
  const errors = [];
  const lesson = pack.lessons.find((candidate) => candidate.id === 'verb-kpt');
  const focusedTest = pack.tests.find((candidate) => candidate.id === 'kpt-verbs');
  const reviewExercises = pack.tests
    .filter((test) => test.stage === 'review')
    .flatMap((test) => test.exercises)
    .filter((exercise) => exercise.targetSkill === VERB_KPT_SKILL);
  if (!lesson) errors.push('verb-kpt: required KPT verb lesson is missing');
  else if (lesson.practiceExercises.length !== 5)
    errors.push('verb-kpt: complete-sentence lesson needs exactly five practice exercises');
  if (!focusedTest) errors.push('kpt-verbs: required KPT verb test is missing');
  const exercises = [
    ...(lesson?.practiceExercises ?? []),
    ...(focusedTest?.exercises ?? []),
    ...reviewExercises,
  ];
  for (const exercise of exercises) {
    if (!exercise.tags?.includes('sentence'))
      errors.push(`${exercise.id}: KPT verb work must use a complete sentence`);
    const parts = exercise.sentenceExplanation?.parts;
    if (!Array.isArray(parts) || parts.length !== 3)
      errors.push(`${exercise.id}: KPT verb sentence must explain exactly three supplied parts`);
    else {
      if (parts[0].finnish !== 'Minä')
        errors.push(`${exercise.id}: KPT verb sentence must begin with supplied Minä`);
      if (!parts[2].formation.includes('supplied as a complete fixed word'))
        errors.push(`${exercise.id}: KPT verb context must be supplied as a complete fixed word`);
    }
    for (const word of exercise.vocabulary ?? [])
      if (RETIRED_OBJECT_DEPENDENT_VERBS.has(word))
        errors.push(`${exercise.id}: object-dependent verb ${word} does not fit this focused set`);
    const feedbackText = [
      exercise.explanation,
      ...(exercise.sentenceExplanation?.parts ?? []).map((part) => part.formation),
      ...Object.values(exercise.optionFeedback ?? {}),
      ...(exercise.answerDiagnostics ?? []).map((diagnostic) => diagnostic.explanation),
    ].join(' ');
    if (/supplied stem/i.test(feedbackText) && !/supplied stem/i.test(exercise.prompt ?? ''))
      errors.push(
        `${exercise.id}: feedback says a stem was supplied when the prompt does not show it`,
      );
  }
  const scoredExercises = [...(focusedTest?.exercises ?? []), ...reviewExercises];
  const scoredById = new Map(scoredExercises.map((exercise) => [exercise.id, exercise]));
  for (const exercise of scoredExercises) {
    const partner = scoredById.get(exercise.parallelExerciseId);
    if (!partner) {
      errors.push(`${exercise.id}: KPT verb mastery partner is missing from the scored verb set`);
      continue;
    }
    const isReviewBridge =
      VERB_KPT_REVIEW_BRIDGE.has(exercise.id) && VERB_KPT_REVIEW_BRIDGE.has(partner.id);
    if (exercise.type !== partner.type && !isReviewBridge)
      errors.push(
        `${exercise.id}: KPT verb mastery partner ${partner.id} must use a comparable response format`,
      );
  }
  const arrivalExercise = scoredById.get('ff-a1-t08-e12');
  if (
    !arrivalExercise ||
    ARRIVAL_TRANSLATIONS.some((answer) => !arrivalExercise.acceptedAnswers.includes(answer))
  )
    errors.push(
      'ff-a1-t08-e12: accept common present, progressive and future English translations',
    );
  return errors;
}

function validateFoundationsReview(pack) {
  const errors = [];
  const reviews = pack.tests.filter((test) => test.stage === 'review');
  const review = reviews.find((test) => test.id === 'foundations-review');
  if (reviews.length !== 1 || !review || pack.tests.at(-1) !== review)
    errors.push('foundations-review: must be the single review after all focused tests');
  if (pack.tests.filter((test) => test.stage === 'focused').length !== 13)
    errors.push('foundations-review: retain all thirteen focused tests');
  if (!review) return errors;
  if (review.exercises.length !== 33) errors.push('foundations-review: needs exactly 33 questions');
  const skills = new Set(pack.importantSkills);
  if (
    review.targetSkills.length !== skills.size ||
    new Set(review.targetSkills).size !== skills.size ||
    review.targetSkills.some((s) => !skills.has(s))
  )
    errors.push('foundations-review: must declare all thirteen foundation skills once');
  const lessonIds = new Set(pack.lessons.map((lesson) => lesson.id));
  if (
    review.lessonIds.length !== lessonIds.size ||
    new Set(review.lessonIds).size !== lessonIds.size ||
    review.lessonIds.some((id) => !lessonIds.has(id))
  )
    errors.push('foundations-review: preparation must reference every lesson exactly once');
  for (const skill of skills) {
    const count = review.exercises.filter((exercise) => exercise.targetSkill === skill).length;
    if (count < 2 || count > 3)
      errors.push(`foundations-review: ${skill} needs two or three primary-skill questions`);
  }
  const formats = new Set(review.exercises.map((exercise) => exercise.type));
  if (formats.size !== 5) errors.push('foundations-review: retain all five response formats');
  const tasks = new Set();
  for (const [index, exercise] of review.exercises.entries()) {
    const task = JSON.stringify([
      exercise.prompt.split('·')[0].trim().toLowerCase(),
      [...exercise.acceptedAnswers].map((answer) => answer.toLowerCase()).sort(),
    ]);
    if (tasks.has(task)) errors.push(`${exercise.id}: duplicate review question and answer`);
    tasks.add(task);
    if (exercise.targetSkill === review.exercises[index - 1]?.targetSkill)
      errors.push(`${exercise.id}: interleave primary skills instead of adjacent topic blocks`);
    if (exercise.requiredSkills.length >= skills.size)
      errors.push(`${exercise.id}: list the skills used by this question, not the whole pack`);
    if (exercise.type === 'fill-blank' && exercise.targetSkill.startsWith('KPT ')) {
      const supplied = /supplied genitive ending -n|supplied stem .+minä -n/;
      if (!supplied.test(exercise.prompt))
        errors.push(
          `${exercise.id}: KPT-only review production must supply the ending and any verb stem`,
        );
      if (/; apply/.test(exercise.prompt))
        errors.push(`${exercise.id}: retrieve the KPT change without giving it away in the prompt`);
    }
  }
  return errors;
}
