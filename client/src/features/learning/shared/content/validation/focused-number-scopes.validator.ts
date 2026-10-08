import { Exercise } from '../exercise.models';
import { ExerciseTest } from '../test.models';
import { TopicPack } from '../topic-pack.models';

type NumberAxis = 'person' | 'owner' | 'object';
type GrammaticalNumber = 'singular' | 'plural';

const SPLIT_AXES: Record<string, NumberAxis> = {
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
  for (const test of pack.tests) validateScope(test, errors);
  for (const lesson of pack.lessons) {
    if (!SPLIT_AXES[lesson.id]) continue;
    const tests = pack.tests.filter(
      (test) =>
        test.stage === 'focused' &&
        (test.lessonIds ?? []).length === 1 &&
        test.lessonIds?.[0] === lesson.id,
    );
    if (
      tests.length !== 2 ||
      tests[0]?.numberScope?.number !== 'singular' ||
      tests[1]?.numberScope?.number !== 'plural'
    )
      errors.push(lesson.id + ': preserve separate singular then plural Focused tests');
  }
  if (errors.length) throw new Error(errors.join('\n'));
}

function validateScope(test: ExerciseTest, errors: string[]): void {
  const scope = test.numberScope;
  const lessonId = test.lessonIds?.[0];
  const expectedAxis = test.stage === 'focused' ? SPLIT_AXES[lessonId] : undefined;
  if (scope === undefined) {
    if (expectedAxis) errors.push(test.id + ': separated Focused test must declare numberScope');
    return;
  }
  if (test.stage !== 'focused') {
    errors.push(test.id + ': numberScope belongs only to Focused tests');
    return;
  }
  if (
    !scope ||
    typeof scope !== 'object' ||
    Array.isArray(scope) ||
    Object.keys(scope).length !== 2 ||
    !['person', 'owner', 'object'].includes(scope.axis) ||
    !['singular', 'plural'].includes(scope.number)
  ) {
    errors.push(test.id + ': numberScope must declare a valid axis and number');
    return;
  }
  if (
    expectedAxis &&
    (scope.axis !== expectedAxis ||
      (test.lessonIds ?? []).length !== 1 ||
      test.id !== lessonId + '-' + scope.number + '-test')
  )
    errors.push(test.id + ': numberScope and test ID must match the shared preparation lesson');
  for (const exercise of test.exercises) {
    const actual = exerciseNumber(exercise, scope.axis);
    if (actual !== scope.number)
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

function exerciseNumber(exercise: Exercise, axis: NumberAxis): GrammaticalNumber | undefined {
  if (axis === 'object') return taggedNumber(exercise, ['objects-singular'], ['objects-plural']);
  if (axis === 'owner') {
    const text = [
      exercise.prompt,
      ...(exercise.acceptedAnswers ?? []),
      ...(exercise.sentenceExplanation?.parts.map((part) => part.finnish) ?? []),
    ].join(' ');
    return wordNumber(text, ['minulla', 'sinulla', 'hänellä'], ['meillä', 'teillä', 'heillä']);
  }
  const tagged = taggedNumber(
    exercise,
    ['person-mina', 'person-sina', 'person-han'],
    ['person-me', 'person-te', 'person-he'],
  );
  if (tagged) {
    const finnish = [
      ...(exercise.sentenceExplanation?.parts.map((part) => part.finnish) ?? []),
      ...(exercise.type === 'translation-en' || exercise.instruction === 'Complete in English.'
        ? []
        : (exercise.acceptedAnswers ?? [])),
    ].join(' ');
    const expressed = wordNumber(finnish, ['minä', 'sinä', 'hän'], ['me', 'te', 'he']);
    return expressed && expressed !== tagged ? undefined : tagged;
  }
  const text = [
    exercise.prompt,
    ...(exercise.acceptedAnswers ?? []),
    ...(exercise.sentenceExplanation?.parts.map((part) => part.finnish) ?? []),
  ].join(' ');
  return wordNumber(text, ['tämä', 'tuo', 'se'], ['nämä', 'nuo', 'ne']);
}

function taggedNumber(
  exercise: Exercise,
  singular: string[],
  plural: string[],
): GrammaticalNumber | undefined {
  const one = singular.some((tag) => (exercise.tags ?? []).includes(tag));
  const several = plural.some((tag) => (exercise.tags ?? []).includes(tag));
  return one === several ? undefined : one ? 'singular' : 'plural';
}

function wordNumber(
  text: string,
  singular: string[],
  plural: string[],
): GrammaticalNumber | undefined {
  const contains = (words: string[]) =>
    new RegExp('(^|[^\\p{L}])(' + words.join('|') + ')(?=$|[^\\p{L}])', 'iu').test(text);
  const one = contains(singular),
    several = contains(plural);
  return one === several ? undefined : one ? 'singular' : 'plural';
}
