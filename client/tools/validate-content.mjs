import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const path = resolve('public/content', process.argv[2] ?? 'vowel-harmony-kpt-tplural.json');
const pack = JSON.parse(readFileSync(path, 'utf8'));
const allowedTypes = new Set([
  'multiple-choice',
  'fill-blank',
  'translation-fi',
  'translation-en',
  'word-order',
]);
const allowedStages = new Set(['focused', 'review']);
const lessons = pack.lessons ?? [];
const exercises = pack.tests.flatMap((test) => test.exercises);
const practiceExercises = lessons.flatMap((lesson) => lesson.practiceExercises ?? []);
const allExercises = [...exercises, ...practiceExercises];
const ids = exercises.map((exercise) => exercise.id);
const allIds = allExercises.map((exercise) => exercise.id);
const exerciseFingerprint = (exercise) =>
  `${exercise.type}|${exercise.prompt?.trim().toLocaleLowerCase('fi-FI')}|${(
    exercise.acceptedAnswers ?? []
  )
    .map((answer) => answer.trim().toLocaleLowerCase('fi-FI'))
    .sort()
    .join('|')}`;
const scoredFingerprints = new Set(exercises.map(exerciseFingerprint));
const errors = [];
const hasTextArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim());
const checkFocus = (item, label) => {
  if (!allowedStages.has(item.stage)) errors.push(`${label}: invalid learning stage`);
  if (!hasTextArray(item.targetSkills) || item.targetSkills.length === 0)
    errors.push(`${label}: missing target skills`);
  if (!hasTextArray(item.prerequisiteSkills)) errors.push(`${label}: invalid prerequisite skills`);
  if (item.stage === 'focused' && item.targetSkills?.length !== 1)
    errors.push(`${label}: focused material must have exactly one target skill`);
};
const lessonsAvailableForTest = (test) => {
  const availableIds = new Set(test.lessonIds ?? []);
  const visitedSkills = new Set();
  const pendingSkills = [...(test.prerequisiteSkills ?? [])];
  while (pendingSkills.length > 0) {
    const skill = pendingSkills.pop();
    if (visitedSkills.has(skill)) continue;
    visitedSkills.add(skill);
    for (const lesson of lessons.filter((candidate) => candidate.targetSkills?.includes(skill))) {
      availableIds.add(lesson.id);
      pendingSkills.push(...(lesson.prerequisiteSkills ?? []));
    }
  }
  return lessons.filter((lesson) => availableIds.has(lesson.id));
};
if (pack.schemaVersion !== 1) errors.push('schemaVersion must be 1');
if (exercises.length < 200 || exercises.length > 1000)
  errors.push('pack must contain between 200 and 1,000 scored exercises');
if (
  !hasTextArray(pack.importantSkills) ||
  pack.importantSkills.length === 0 ||
  new Set(pack.importantSkills).size !== pack.importantSkills.length
)
  errors.push('pack must declare a non-empty list of unique important skills');
if (!pack.level?.trim() || !/grammar/i.test(pack.level))
  errors.push('pack level must describe grammar competency without claiming overall proficiency');
if (lessons.length === 0) errors.push('pack must contain reusable lessons');
const lessonIds = lessons.map((lesson) => lesson.id);
if (new Set(lessonIds).size !== lessonIds.length) errors.push('lesson ids must be unique');
const taughtSkills = new Set();
const taughtVocabulary = new Set();
for (const lesson of lessons) {
  checkFocus(lesson, lesson.id);
  if (lesson.stage === 'focused' && (lesson.introducedVocabulary?.length ?? 0) > 10)
    errors.push(`${lesson.id}: focused lesson introduces more than ten words`);
  for (const prerequisite of lesson.prerequisiteSkills ?? []) {
    if (!taughtSkills.has(prerequisite))
      errors.push(`${lesson.id}: prerequisite ${prerequisite} has not been taught earlier`);
  }
  if (!Array.isArray(lesson.introducedVocabulary))
    errors.push(`${lesson.id}: missing introduced vocabulary`);
  for (const item of lesson.introducedVocabulary ?? []) {
    if (!item?.finnish?.trim() || !item?.english?.trim())
      errors.push(`${lesson.id}: incomplete vocabulary entry`);
    else taughtVocabulary.add(item.finnish);
  }
  for (const skill of lesson.targetSkills ?? []) taughtSkills.add(skill);
}
const focusedCoveredSkills = new Set();
const focusedReferencedLessonIds = new Set();
let focusedTestCount = 0;
let reviewsStarted = false;
for (const [testIndex, test] of pack.tests.entries()) {
  checkFocus(test, test.id);
  if (Object.hasOwn(test, 'set')) errors.push(`${test.id}: removed set metadata is not allowed`);
  if (test.stage === 'review') reviewsStarted = true;
  else if (test.stage === 'focused') {
    if (reviewsStarted) errors.push(`${test.id}: focused test appears after reviews`);
    focusedTestCount += 1;
  }
  if (!Array.isArray(test.exercises) || test.exercises.length === 0)
    errors.push(`${test.id}: test must contain at least one exercise`);
  if (!Array.isArray(test.lessonIds) || test.lessonIds.length === 0)
    errors.push(`${test.id} must reference at least one lesson`);
  if (new Set(test.lessonIds ?? []).size !== (test.lessonIds ?? []).length)
    errors.push(`${test.id} contains duplicate lesson references`);
  for (const lessonId of test.lessonIds ?? []) {
    if (!lessonIds.includes(lessonId))
      errors.push(`${test.id} references missing lesson ${lessonId}`);
  }
  if (test.stage === 'focused')
    for (const lessonId of test.lessonIds ?? []) focusedReferencedLessonIds.add(lessonId);
  const referencedLessons = lessons.filter((lesson) => test.lessonIds?.includes(lesson.id));
  if (
    test.stage === 'focused' &&
    referencedLessons.some(
      (lesson) => lesson.stage !== 'focused' || lesson.targetSkills?.[0] !== test.targetSkills?.[0],
    )
  )
    errors.push(`${test.id}: focused test references a lesson for another target skill`);
  const lessonSkills = new Set(
    referencedLessons.flatMap((lesson) => [
      ...(lesson.targetSkills ?? []),
      ...(lesson.prerequisiteSkills ?? []),
    ]),
  );
  const declaredSkills = new Set([
    ...(test.targetSkills ?? []),
    ...(test.prerequisiteSkills ?? []),
  ]);
  for (const skill of declaredSkills)
    if (!lessonSkills.has(skill))
      errors.push(`${test.id}: skill ${skill} is not taught by a referenced lesson`);
  if (test.stage === 'review')
    for (const skill of declaredSkills)
      if (!focusedCoveredSkills.has(skill))
        errors.push(`${test.id}: review introduces a skill not covered by focused tests: ${skill}`);
  const availableWords = new Set(
    lessonsAvailableForTest(test).flatMap((lesson) =>
      (lesson.introducedVocabulary ?? []).map((item) => item.finnish),
    ),
  );
  for (const exercise of test.exercises ?? []) {
    if (!exercise.targetSkill?.trim()) errors.push(`${exercise.id}: missing target skill`);
    if (!exercise.misconceptionCategory?.trim())
      errors.push(`${exercise.id}: missing misconception category`);
    if (!exercise.parallelExerciseId?.trim())
      errors.push(`${exercise.id}: missing parallel exercise id`);
    if (!hasTextArray(exercise.requiredSkills))
      errors.push(`${exercise.id}: missing required skills`);
    for (const skill of exercise.requiredSkills ?? [])
      if (!declaredSkills.has(skill))
        errors.push(`${exercise.id}: undeclared required skill ${skill}`);
    if (test.stage === 'focused')
      for (const skill of exercise.requiredSkills ?? []) focusedCoveredSkills.add(skill);
    else if (test.stage === 'review')
      for (const skill of exercise.requiredSkills ?? [])
        if (!focusedCoveredSkills.has(skill))
          errors.push(
            `${exercise.id}: review requires a skill not covered by focused tests: ${skill}`,
          );
    if (test.stage === 'focused' && !(exercise.requiredSkills ?? []).includes(test.targetSkills[0]))
      errors.push(`${exercise.id}: focused target is not required by the exercise`);
    if (!hasTextArray(exercise.vocabulary))
      errors.push(`${exercise.id}: invalid vocabulary declaration`);
    for (const word of exercise.vocabulary ?? [])
      if (!availableWords.has(word))
        errors.push(`${exercise.id}: vocabulary ${word} is not introduced by a referenced lesson`);
  }
}
if (focusedTestCount === 0) errors.push('pack must contain at least one focused test');
for (const skill of pack.importantSkills ?? [])
  if (!focusedCoveredSkills.has(skill))
    errors.push(`important skill ${skill} is not covered by a focused test`);
if (new Set(ids).size !== ids.length) errors.push('exercise ids must be unique');
if (new Set(allIds).size !== allIds.length)
  errors.push('scored and practice exercise ids must be unique together');
for (const lesson of lessons) {
  if (
    !lesson.id?.trim() ||
    !lesson.version?.trim() ||
    !lesson.title?.trim() ||
    !lesson.summary?.trim()
  )
    errors.push('lesson missing identity or summary');
  if (!lesson.objectives?.length || lesson.objectives.some((item) => !item?.trim()))
    errors.push(`${lesson.id}: missing objectives`);
  if (!lesson.sections?.length) errors.push(`${lesson.id}: missing sections`);
  for (const section of lesson.sections ?? []) {
    if (
      !section.title?.trim() ||
      !section.paragraphs?.length ||
      section.paragraphs.some((item) => !item?.trim()) ||
      !section.keyPoints?.length ||
      section.keyPoints.some((item) => !item?.trim())
    )
      errors.push(`${lesson.id}: incomplete section`);
  }
  if (!lesson.examples?.length) errors.push(`${lesson.id}: missing examples`);
  for (const example of lesson.examples ?? []) {
    if (
      !example.finnish?.trim() ||
      !example.english?.trim() ||
      !example.steps?.length ||
      example.steps.some((item) => !item?.trim())
    )
      errors.push(`${lesson.id}: incomplete example`);
  }
  if (!lesson.commonMistakes?.length || lesson.commonMistakes.some((item) => !item?.trim()))
    errors.push(`${lesson.id}: missing common mistakes`);
  if (
    !lesson.practiceExercises ||
    lesson.practiceExercises.length < 2 ||
    lesson.practiceExercises.length > 5
  )
    errors.push(`${lesson.id}: practice count must be between 2 and 5`);
  for (const exercise of lesson.practiceExercises ?? []) {
    if (!exercise.tags?.includes('lesson-practice'))
      errors.push(`${exercise.id}: lesson exercise must have lesson-practice tag`);
    if (scoredFingerprints.has(exerciseFingerprint(exercise)))
      errors.push(`${exercise.id}: practice question duplicates a scored-test question`);
    const declaredSkills = new Set([
      ...(lesson.targetSkills ?? []),
      ...(lesson.prerequisiteSkills ?? []),
    ]);
    if (!hasTextArray(exercise.requiredSkills))
      errors.push(`${exercise.id}: missing required skills`);
    for (const skill of exercise.requiredSkills ?? [])
      if (!declaredSkills.has(skill))
        errors.push(`${exercise.id}: skill ${skill} is outside lesson ${lesson.id}`);
    if (
      lesson.stage === 'focused' &&
      !(exercise.requiredSkills ?? []).includes(lesson.targetSkills[0])
    )
      errors.push(`${exercise.id}: focused lesson target is not required`);
    if (!hasTextArray(exercise.vocabulary))
      errors.push(`${exercise.id}: invalid vocabulary declaration`);
    for (const word of exercise.vocabulary ?? [])
      if (!taughtVocabulary.has(word))
        errors.push(`${exercise.id}: undeclared lesson vocabulary ${word}`);
  }
}
const referencedLessonIds = new Set(pack.tests.flatMap((test) => test.lessonIds ?? []));
for (const lessonId of lessonIds)
  if (!referencedLessonIds.has(lessonId))
    errors.push(`${lessonId}: lesson is not referenced by a test`);
for (const lesson of lessons)
  if (lesson.stage === 'focused' && !focusedReferencedLessonIds.has(lesson.id))
    errors.push(`${lesson.id}: focused lesson is not referenced by a focused test`);
for (const exercise of allExercises) {
  if (!allowedTypes.has(exercise.type)) errors.push(`${exercise.id}: unsupported type`);
  if (!exercise.acceptedAnswers?.length) errors.push(`${exercise.id}: missing accepted answer`);
  if (!exercise.explanation?.trim()) errors.push(`${exercise.id}: missing explanation`);
  const arrowIndex = exercise.prompt?.indexOf('→') ?? -1;
  if (arrowIndex >= 0) {
    const source = exercise.prompt.slice(0, arrowIndex);
    const target = exercise.prompt.slice(arrowIndex + 1);
    if (!/“[^”]+”/.test(source) || !/“[^”]+”/.test(target))
      errors.push(`${exercise.id}: transformed source and target need English meanings`);
  }
  if (
    exercise.type === 'multiple-choice' &&
    !exercise.options?.includes(exercise.acceptedAnswers[0])
  )
    errors.push(`${exercise.id}: correct answer missing from choices`);
  if (
    exercise.type === 'multiple-choice' &&
    new Set(exercise.options ?? []).size !== (exercise.options ?? []).length
  )
    errors.push(`${exercise.id}: duplicate choices`);
  if (exercise.type === 'multiple-choice') {
    if (!exercise.optionFeedback || typeof exercise.optionFeedback !== 'object')
      errors.push(`${exercise.id}: missing option feedback`);
    for (const option of exercise.options ?? [])
      if (!exercise.optionFeedback?.[option]?.trim())
        errors.push(`${exercise.id}: missing feedback for option ${option}`);
  }
  for (const diagnostic of exercise.answerDiagnostics ?? []) {
    if (
      !hasTextArray(diagnostic.answers) ||
      !diagnostic.category?.trim() ||
      !diagnostic.explanation?.trim()
    )
      errors.push(`${exercise.id}: invalid typed-answer diagnostic`);
  }
  if (exercise.type === 'word-order' && !exercise.tokens?.length)
    errors.push(`${exercise.id}: missing tokens`);
  if (exercise.tags?.includes('sentence')) {
    const lesson = exercise.sentenceExplanation;
    if (!lesson?.translation?.trim())
      errors.push(`${exercise.id}: missing complete sentence translation`);
    if (!lesson?.pattern?.trim()) errors.push(`${exercise.id}: missing sentence pattern`);
    if (!Array.isArray(lesson?.parts) || lesson.parts.length < 2)
      errors.push(`${exercise.id}: needs at least two explained sentence parts`);
    for (const [index, part] of (lesson?.parts ?? []).entries()) {
      for (const field of ['finnish', 'meaning', 'role', 'baseForm', 'formation']) {
        if (!part?.[field]?.trim())
          errors.push(`${exercise.id}: part ${index + 1} missing ${field}`);
      }
    }
  }
}
const scoredById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
for (const exercise of exercises) {
  const parallel = scoredById.get(exercise.parallelExerciseId);
  if (!parallel) errors.push(`${exercise.id}: parallel exercise does not exist`);
  else {
    if (parallel.id === exercise.id) errors.push(`${exercise.id}: parallel exercise must differ`);
    if (parallel.parallelExerciseId !== exercise.id)
      errors.push(`${exercise.id}: parallel relationship must be mutual`);
    if (parallel.targetSkill !== exercise.targetSkill)
      errors.push(`${exercise.id}: parallel exercise must test the same target skill`);
    if (parallel.acceptedAnswers?.[0] === exercise.acceptedAnswers?.[0])
      errors.push(`${exercise.id}: parallel exercise must use a different surface answer`);
  }
}
if (pack.id === 'vowel-harmony-kpt-tplural') {
  const kptLessonIds = [
    'kpt-doubles',
    'kpt-singles',
    'kpt-special-k',
    'kpt-clusters',
    'kpt-basics',
  ];
  for (const lessonId of kptLessonIds) {
    const lesson = lessons.find((candidate) => candidate.id === lessonId);
    if (!lesson) {
      errors.push(`${lessonId}: required KPT learning block is missing`);
      continue;
    }
    if (lesson.examples?.length < 2)
      errors.push(`${lessonId}: needs at least two worked contrasts`);
    if (lesson.practiceExercises?.length < 4 || lesson.practiceExercises?.length > 5)
      errors.push(`${lessonId}: difficult KPT lesson needs four or five practice exercises`);
    if (lesson.introducedVocabulary?.length > 10)
      errors.push(`${lessonId}: KPT vocabulary must not exceed ten new items`);
  }
  const kptOnlyProduction = [
    ...pack.tests
      .filter((test) =>
        [
          'test-kpt-doubles',
          'test-kpt-singles',
          'test-kpt-special-k',
          'test-kpt-clusters',
        ].includes(test.id),
      )
      .flatMap((test) => test.exercises ?? []),
    ...lessons
      .filter((lesson) =>
        ['kpt-doubles', 'kpt-singles', 'kpt-special-k', 'kpt-clusters'].includes(lesson.id),
      )
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
}
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
const typeCounts = Object.fromEntries(
  [...allowedTypes].map((type) => [
    type,
    exercises.filter((exercise) => exercise.type === type).length,
  ]),
);
const sentenceExercises = exercises.filter((exercise) =>
  exercise.tags?.includes('sentence'),
).length;
const practiceTypeCounts = Object.fromEntries(
  [...allowedTypes].map((type) => [
    type,
    practiceExercises.filter((exercise) => exercise.type === type).length,
  ]),
);
const stageCounts = Object.fromEntries(
  [...allowedStages].map((stage) => [
    stage,
    pack.tests.filter((test) => test.stage === stage).length,
  ]),
);
console.log(
  JSON.stringify(
    {
      pack: pack.id,
      tests: pack.tests.length,
      exercises: exercises.length,
      lessons: lessons.length,
      practiceExercises: practiceExercises.length,
      sentenceExercises,
      stageCounts,
      typeCounts,
      practiceTypeCounts,
    },
    null,
    2,
  ),
);
