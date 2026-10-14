import { Exercise } from '../exercise.models';
import { Lesson } from '../lesson.models';
import { TopicPack } from '../topic-pack.models';

import {
  PARTITIVE_TARGETS as TARGETS,
  PartitiveTarget as Target,
} from './partitive-family-targets';

const words = (text: string) => text.toLocaleLowerCase('fi-FI').match(/[\p{L}]+/gu) ?? [];
const formSets = (number: Target[1]) =>
  new Set(
    Object.values(TARGETS)
      .flat()
      .filter((t) => t[1] === number)
      .flatMap((t) => t[3].split(' ')),
  );
const SINGULAR = formSets('singular');
const PLURAL = formSets('plural');
const SPOKEN = /(?:^|[^\p{L}])(?:mä|sä|mua|sua|tää|toi|nää|noi|oon|oot)(?=$|[^\p{L}])/iu;

export function validatePartitiveFamily(pack: TopicPack): string[] {
  const targets = TARGETS[pack.id];
  if (!targets)
    return pack.lessons.some((l) => l.numberScope?.axis === 'form')
      ? ['Unsupported form-number content family.']
      : [];
  const errors: string[] = [];
  const expectedIds = targets.map((t) => t[0]);
  if (JSON.stringify(pack.lessons.map((l) => l.id)) !== JSON.stringify(expectedIds))
    errors.push(pack.id + ': incorrect partitive lesson sequence');
  if (pack.level !== '0 - A1.3') errors.push(pack.id + ': incorrect partitive level');
  if (pack.tests.length !== targets.length + 1 || pack.tests.at(-1)?.stage !== 'review')
    errors.push(pack.id + ': partitive Focused sequence must end in one Review');
  for (const [index, target] of targets.entries()) {
    const [id, number, count] = target;
    const lesson = pack.lessons.find((l) => l.id === id);
    const test = pack.tests[index];
    if (!lesson || !test) {
      errors.push(id + ': missing preparation or test');
      continue;
    }
    if (
      test.id !== id + '-test' ||
      test.stage !== 'focused' ||
      JSON.stringify(test.lessonIds) !== JSON.stringify([id]) ||
      test.exercises.length !== count
    )
      errors.push(id + ': incorrect Focused ownership or count');
    if (
      number &&
      (lesson.numberScope?.axis !== 'form' ||
        lesson.numberScope.number !== number ||
        test.numberScope?.axis !== 'form' ||
        test.numberScope.number !== number)
    )
      errors.push(id + ': incorrect grammatical form scope');
    if (!number && (lesson.numberScope || test.numberScope))
      errors.push(id + ': question selection is number-neutral');
    if (lesson.practiceExercises.length !== 3)
      errors.push(id + ': expected three independent optional items');
    for (const example of lesson.examples)
      checkSurface(example.finnish, target, id + ' example', errors);
    for (const exercise of [...test.exercises, ...lesson.practiceExercises])
      checkExercise(exercise, target, lesson, errors);
  }
  const review = pack.tests.at(-1);
  if (review) {
    if (
      review.exercises.length !== targets.length * 4 ||
      JSON.stringify(review.lessonIds) !== JSON.stringify(expectedIds)
    )
      errors.push(pack.id + ': incomplete cumulative Review');
    for (const target of targets) {
      const lesson = pack.lessons.find((l) => l.id === target[0]);
      if (!lesson) continue;
      const items = review.exercises.filter((e) => e.targetSkill === lesson.targetSkills[0]);
      if (items.length !== 4)
        errors.push(target[0] + ': Review must retrieve this target four times');
      for (const exercise of items) checkExercise(exercise, target, lesson, errors);
    }
  }
  const exercises = [
    ...pack.tests.flatMap((test) => test.exercises),
    ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
  ];
  for (const exercise of exercises) {
    const expected =
      exercise.type === 'translation-en'
        ? [
            ...new Set(
              exercise.sentenceExplanation?.parts
                .map((part) => part.baseForm)
                .filter((base) => !pack.grammarBaseForms.includes(base)) ?? [],
            ),
          ]
        : [];
    if (JSON.stringify(expected.sort()) !== JSON.stringify([...exercise.vocabulary].sort()))
      errors.push(
        exercise.id + ': lexical recall must match the supplied frame or translated sentence',
      );
  }
  const material = [...pack.lessons, ...pack.tests];
  if (SPOKEN.test(JSON.stringify(material)))
    errors.push(pack.id + ': spoken Finnish is outside the approved register');
  return errors;
}

function checkExercise(exercise: Exercise, target: Target, lesson: Lesson, errors: string[]): void {
  if (target[1] && !exercise.tags.includes('form-' + target[1]))
    errors.push(exercise.id + ': missing grammatical form tag');
  if (exercise.tags.includes('ending-completion')) {
    const stem = exercise.prompt.match(/:\s*([\p{L}]+)_/u)?.[1];
    for (const answer of exercise.acceptedAnswers)
      checkSurface((stem ?? '') + answer, target, exercise.id, errors);
  } else if (exercise.tags.includes('base-recognition')) {
    const forms = words(exercise.prompt).filter((w) => target[3].split(' ').includes(w));
    const example = lesson.examples.find((e) => e.finnish.split(' → ')[1] === forms[0]);
    if (!example || exercise.acceptedAnswers.some((a) => a !== example.finnish.split(' → ')[0]))
      errors.push(exercise.id + ': incorrect reverse form mapping');
  } else if (exercise.type === 'translation-en') {
    checkSurface(
      exercise.sentenceExplanation?.parts.map((p) => p.finnish).join(' ') ?? '',
      target,
      exercise.id,
      errors,
    );
  } else {
    for (const answer of exercise.acceptedAnswers)
      checkSurface(answer, target, exercise.id, errors);
  }
}

function checkSurface(text: string, target: Target, label: string, errors: string[]): void {
  const actual = words(text);
  const allowed = target[3].split(' ');
  const opposite =
    target[1] === 'singular' ? PLURAL : target[1] === 'plural' ? SINGULAR : new Set<string>();
  if (!actual.some((w) => allowed.includes(w)) || actual.some((w) => opposite.has(w)))
    errors.push(label + ': incorrect partitive form or grammatical number');
}
