import { supplementalFeedbackLeaks } from './number-scope-feedback.validator';
import { Exercise } from '../exercise.models';
import { Lesson } from '../lesson.models';
import { NumberScope } from '../number-scope.models';
import { ExerciseTest } from '../test.models';
import { TopicPack } from '../topic-pack.models';

const SPLIT_AXES: Record<string, NumberScope['axis']> = {
  'ppo-written-reference': 'person',
  'ppo-affirmative-agreement': 'person',
  'ppo-pronoun-presence': 'person',
  'ppo-negative-transformations': 'person',
  'ppo-written-short-answers': 'person',
  'nds-negative-transformation': 'person',
  'aps-possessors': 'owner',
  'aps-fixed-on': 'owner',
  'aps-sentences': 'owner',
  'nps-fixed-negative': 'owner',
  'nps-partitive': 'owner',
  'nps-sentences': 'owner',
  'pqs-onko': 'owner',
  'pqs-short-answers': 'owner',
  'pqs-word-order': 'owner',
  'npq-eiko': 'owner',
  'npq-short-answers': 'owner',
  'npq-word-order': 'owner',
  'ppe-pronoun-omission': 'object',
  'ppe-whose': 'object',
  'pop-pronoun-omission': 'object',
  'pop-whose': 'object',
};

export function validateFocusedNumberScopes(pack: TopicPack): void {
  const errors: string[] = [];
  for (const test of pack.tests) validateScope(test, pack, errors);
  for (const [base, axis] of Object.entries(SPLIT_AXES)) {
    const pair = pack.tests.filter(
      (test) => test.id === base + '-singular-test' || test.id === base + '-plural-test',
    );
    if (!pair.length) continue;
    if (
      pair.length !== 2 ||
      pair[0].numberScope?.number !== 'singular' ||
      pair[1].numberScope?.number !== 'plural'
    )
      errors.push(base + ': preserve separate singular then plural Focused tests');
    for (const number of ['singular', 'plural']) {
      const id = base + '-' + number;
      const lesson = pack.lessons.find((item) => item.id === id);
      if (!lesson || lesson.numberScope?.axis !== axis || lesson.numberScope?.number !== number)
        errors.push(id + ': preparation lesson must declare the matching numberScope');
    }
  }
  for (const lesson of pack.lessons.filter((item) => item.numberScope)) {
    const scope = lesson.numberScope;
    if (!validScope(scope)) {
      errors.push(lesson.id + ': invalid lesson numberScope');
      continue;
    }
    const owners = pack.tests.filter(
      (test) => test.stage === 'focused' && test.lessonIds?.includes(lesson.id),
    );
    if (owners.length !== 1 || owners[0].id !== lesson.id + '-test')
      errors.push(lesson.id + ': number-specific preparation must belong to one Focused test');
    if (lesson.examples.some((example) => textNumber(example.finnish, scope.axis) !== scope.number))
      errors.push(lesson.id + ': worked examples must match the declared number');
    if (teachingLeaks(lesson, scope))
      errors.push(lesson.id + ': teaching and summary must stay within the declared number');
    for (const exercise of lesson.practiceExercises) {
      if (feedbackLeaks(exercise, scope))
        errors.push(exercise.id + ': feedback must stay within the declared owner number');
      if (exerciseNumber(exercise, scope.axis) !== scope.number)
        errors.push(
          exercise.id +
            ': practice must stay in its declared ' +
            scope.axis +
            ' ' +
            scope.number +
            ' group',
        );
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

function validScope(scope: NumberScope | undefined): scope is NumberScope {
  return (
    !!scope &&
    typeof scope === 'object' &&
    !Array.isArray(scope) &&
    Object.keys(scope).length === 2 &&
    ['person', 'owner', 'object'].includes(scope.axis) &&
    ['singular', 'plural'].includes(scope.number)
  );
}

function validateScope(test: ExerciseTest, pack: TopicPack, errors: string[]): void {
  const scope = test.numberScope;
  const base = test.id.replace(/-(singular|plural)-test$/u, '');
  const expectedAxis = test.stage === 'focused' ? SPLIT_AXES[base] : undefined;
  if (scope === undefined) {
    if (expectedAxis) errors.push(test.id + ': separated Focused test must declare numberScope');
    return;
  }
  if (test.stage !== 'focused') {
    errors.push(test.id + ': numberScope belongs only to Focused tests');
    return;
  }
  if (!validScope(scope)) {
    errors.push(test.id + ': numberScope must declare a valid axis and number');
    return;
  }
  const lesson = pack.lessons.find((item) => item.id === test.lessonIds?.[0]);
  if (
    expectedAxis &&
    (scope.axis !== expectedAxis ||
      test.lessonIds?.length !== 1 ||
      test.lessonIds[0] !== base + '-' + scope.number ||
      test.id !== test.lessonIds[0] + '-test')
  )
    errors.push(
      test.id + ': numberScope and test ID must match its independent preparation lesson',
    );
  if (
    !lesson ||
    lesson.numberScope?.axis !== scope.axis ||
    lesson.numberScope?.number !== scope.number
  )
    errors.push(test.id + ': preparation lesson must match the test numberScope');
  if (lesson && test.focus !== lesson.summary)
    errors.push(test.id + ': preparation header must match its number-specific lesson summary');
  for (const exercise of test.exercises) {
    if (feedbackLeaks(exercise, scope))
      errors.push(exercise.id + ': feedback must stay within the declared owner number');
    if (exerciseNumber(exercise, scope.axis) !== scope.number)
      errors.push(
        exercise.id +
          ': question must stay in its declared ' +
          scope.axis +
          ' ' +
          scope.number +
          ' group',
      );
  }
}

function finnishFor(exercise: Exercise): string {
  return [
    ...(exercise.sentenceExplanation?.parts.map((part) => part.finnish) ?? []),
    ...(exercise.type === 'translation-en' || exercise.instruction === 'Complete in English.'
      ? []
      : (exercise.acceptedAnswers ?? [])),
  ].join(' ');
}

function exerciseNumber(
  exercise: Exercise,
  axis: NumberScope['axis'],
): NumberScope['number'] | undefined {
  const finnish = finnishFor(exercise);
  if (axis === 'object') {
    const tagged = taggedNumber(exercise, ['objects-singular'], ['objects-plural']);
    const expressed = textNumber(finnish, axis);
    return expressed && tagged && expressed !== tagged ? undefined : tagged;
  }
  if (axis === 'owner') return textNumber(exercise.prompt + ' ' + finnish, axis);
  const tagged = taggedNumber(
    exercise,
    ['person-mina', 'person-sina', 'person-han'],
    ['person-me', 'person-te', 'person-he'],
  );
  if (tagged) {
    const expressed = wordNumber(finnish, ['minä', 'sinä', 'hän'], ['me', 'te', 'he']);
    return expressed && expressed !== tagged ? undefined : tagged;
  }
  return textNumber(exercise.prompt + ' ' + finnish, axis);
}

function textNumber(text: string, axis: NumberScope['axis']): NumberScope['number'] | undefined {
  if (axis === 'owner')
    return wordNumber(text, ['minulla', 'sinulla', 'hänellä'], ['meillä', 'teillä', 'heillä']);
  if (axis === 'object') return wordNumber(text, ['tämä'], ['nämä']);
  return wordNumber(
    text,
    ['minä', 'sinä', 'hän', 'tämä', 'tuo', 'se', 'olen', 'olet'],
    ['me', 'te', 'he', 'nämä', 'nuo', 'ne', 'olemme', 'olette', 'ovat'],
  );
}

function teachingLeaks(lesson: Lesson, scope: NumberScope): boolean {
  const text = [
    lesson.title,
    lesson.summary,
    ...lesson.objectives,
    ...lesson.commonMistakes,
    ...lesson.sections.flatMap((s) => [s.title, ...s.paragraphs, ...s.keyPoints]),
  ].join(' ');
  return textLeaks(text, scope);
}

function textLeaks(text: string, scope: NumberScope): boolean {
  if (scope.axis === 'owner') {
    const forbidden =
      scope.number === 'singular'
        ? [
            'meillä',
            'teillä',
            'heillä',
            'olemme',
            'olette',
            'ovat',
            'emme',
            'ette',
            'eivät',
            'olemmeko',
            'oletteko',
            'ovatko',
            'emmekö',
            'ettekö',
            'eivätkö',
          ]
        : ['minulla', 'sinulla', 'hänellä'];
    return (
      forbidden.some((word) => contains(text, [word])) ||
      (scope.number === 'singular' &&
        /\b(?:(?:plural|several) owners?|including groups|including we and they)\b/iu.test(text))
    );
  }
  if (scope.axis === 'object')
    return contains(text, scope.number === 'singular' ? ['nämä', 'ovat'] : ['tämä']);
  // English "he" is also a singular translation; use unambiguous Finnish verb forms here.
  return contains(
    text,
    scope.number === 'singular'
      ? ['olemme', 'olette', 'ovat', 'emme', 'ette', 'eivät', 'nämä', 'nuo']
      : ['minä', 'sinä', 'hän', 'olen', 'olet', 'en', 'et', 'tämä', 'tuo'],
  );
}

function feedbackLeaks(exercise: Exercise, scope: NumberScope): boolean {
  if (supplementalFeedbackLeaks(exercise, scope)) return true;
  if (scope.axis !== 'owner') return false;
  return textLeaks(
    [
      exercise.explanation,
      ...(exercise.sentenceExplanation?.parts.map((part) => part.formation) ?? []),
    ].join(' '),
    scope,
  );
}

function taggedNumber(
  exercise: Exercise,
  singular: string[],
  plural: string[],
): NumberScope['number'] | undefined {
  const one = singular.some((tag) => (exercise.tags ?? []).includes(tag));
  const several = plural.some((tag) => (exercise.tags ?? []).includes(tag));
  return one === several ? undefined : one ? 'singular' : 'plural';
}

function contains(text: string, words: string[]): boolean {
  return new RegExp('(^|[^\\p{L}])(' + words.join('|') + ')(?=$|[^\\p{L}])', 'iu').test(text);
}

function wordNumber(
  text: string,
  singular: string[],
  plural: string[],
): NumberScope['number'] | undefined {
  const one = contains(text, singular),
    several = contains(text, plural);
  return one === several ? undefined : one ? 'singular' : 'plural';
}
