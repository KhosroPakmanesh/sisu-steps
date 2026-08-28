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
  return errors;
}
