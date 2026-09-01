const KPT_PRODUCTION_LESSON_IDS = ['kpt-doubles', 'kpt-singles', 'kpt-special-k', 'kpt-clusters'];
const KPT_LESSON_IDS = [...KPT_PRODUCTION_LESSON_IDS, 'kpt-basics'];
const KPT_PRODUCTION_TEST_IDS = new Set(
  KPT_PRODUCTION_LESSON_IDS.map((lessonId) => `test-${lessonId}`),
);

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
  return [...errors, ...validateFoundationsReview(pack)];
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
