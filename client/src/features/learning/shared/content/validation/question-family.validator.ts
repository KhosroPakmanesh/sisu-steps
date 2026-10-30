import {
  matchesQuestionNumber,
  questionResponseDemand,
  validateQuestionTeaching,
} from './question-family-semantics';
import { TopicPack } from '../topic-pack.models';
import { Exercise } from '../exercise.models';
import { QUESTION_TARGETS, QuestionTarget } from './question-family-targets';

const faultyBecauseCase = /\bKoska (?:Olen|Olet|On|Olemme|Olette|Ovat|Minä|Sinä|Hän|Me|Te|He)\b/u;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const normalize = (text: string) =>
  (text.toLocaleLowerCase('fi-FI').match(/[\p{L}\p{N}]+/gu) ?? []).join(' ');

export function validateQuestionFamily(pack: TopicPack): string[] {
  const targets = QUESTION_TARGETS[pack.id];
  if (!targets) return [];
  const errors: string[] = [];
  const ids = targets.map((target) => target.id);
  if (pack.level !== '0 - A1.3') errors.push(pack.id + ': incorrect question-family level');
  if (
    !same(
      pack.lessons.map((lesson) => lesson.id),
      ids,
    )
  )
    errors.push(pack.id + ': incorrect question-family lesson sequence');
  if (pack.tests.length !== targets.length + 1 || pack.tests.at(-1)?.stage !== 'review')
    errors.push(pack.id + ': expected the Focused sequence and one final Review');
  for (const [index, target] of targets.entries()) {
    const lesson = pack.lessons[index];
    const test = pack.tests[index];
    if (!lesson || !test) {
      errors.push(target.id + ': missing preparation or test');
      continue;
    }
    if (
      test.id !== target.id + '-test' ||
      test.stage !== 'focused' ||
      !same(test.lessonIds, [target.id]) ||
      test.exercises.length !== 20
    )
      errors.push(target.id + ': incorrect Focused ownership or count');
    if (!same(lesson.numberScope, target.scope) || !same(test.numberScope, target.scope))
      errors.push(target.id + ': incorrect question-family number scope');
    if (lesson.practiceExercises.length !== 3)
      errors.push(target.id + ': expected three independent optional items');
    const positions = new Map(test.exercises.map((exercise, position) => [exercise.id, position]));
    if (
      test.exercises.some((exercise, position) => {
        const partner = positions.get(exercise.parallelExerciseId ?? '');
        return partner === undefined || Math.abs(position - partner) < 2;
      })
    )
      errors.push(target.id + ': mastery partners require intervening retrieval');
    if (!lesson.sections.some((section) => section.title === 'Answering the question'))
      errors.push(target.id + ': missing explicit answer teaching');
    errors.push(...validateQuestionTeaching(lesson, pack.grammarBaseForms));
    for (const exercise of test.exercises) {
      const partner = test.exercises.find(
        (candidate) => candidate.id === exercise.parallelExerciseId,
      );
      if (partner && questionResponseDemand(exercise) !== questionResponseDemand(partner))
        errors.push(exercise.id + ': mastery partner must retrieve the same response operation');
    }
    const examples = lesson.examples;
    if (!examples.some((example) => !example.finnish.endsWith('?')))
      errors.push(target.id + ': worked examples must include actual replies');
    for (const example of examples) {
      const pattern = example.finnish.endsWith('?') ? target.question : target.answer;
      if (
        !new RegExp(pattern, 'u').test(normalize(example.finnish)) ||
        !matchesQuestionNumber(example.finnish, target) ||
        faultyBecauseCase.test(example.finnish)
      )
        errors.push(target.id + ': example does not match the question/answer target');
    }
    for (const exercise of [...test.exercises, ...lesson.practiceExercises])
      checkExercise(exercise, target, errors);
  }
  const review = pack.tests.at(-1);
  if (review) {
    if (!same(review.lessonIds, ids) || review.exercises.length !== targets.length * 4)
      errors.push(pack.id + ': incomplete question-family Review');
    for (const [index, target] of targets.entries()) {
      const skill = pack.lessons[index]?.targetSkills[0];
      const exercises = review.exercises.filter((exercise) => exercise.targetSkill === skill);
      if (exercises.length !== 4) errors.push(target.id + ': expected four Review retrievals');
      for (const exercise of exercises) {
        checkExercise(exercise, target, errors);
        const partner = exercises.find((candidate) => candidate.id === exercise.parallelExerciseId);
        if (partner && questionResponseDemand(exercise) !== questionResponseDemand(partner))
          errors.push(exercise.id + ': Review partners must retrieve the same response operation');
        if (
          ['qw-milloin-weekdays', 'qw-mista-inside', 'qw-mista-outside'].includes(target.id) &&
          exercise.sentenceExplanation?.parts.at(-1)?.finnish.endsWith('?')
        )
          errors.push(exercise.id + ': Review must retrieve the weekday or source ending');
      }
    }
  }
  return errors;
}

function checkExercise(exercise: Exercise, target: QuestionTarget, errors: string[]): void {
  const errorsToPractise = [
    ...(exercise.options ?? []),
    ...(exercise.answerDiagnostics ?? []).flatMap((diagnostic) => diagnostic.answers),
  ];
  if (errorsToPractise.some((answer) => /(?<![.!?])\s(?:En|Et|Ei|Emme|Ette|Eivät)\b/u.test(answer)))
    errors.push(exercise.id + ': negative distractors must use ordinary sentence capitalization');
  if (
    exercise.type === 'word-order' &&
    !same(
      (exercise.tokens ?? []).flatMap((token) => token.split(/\s+/u)).sort(),
      exercise.acceptedAnswers[0].split(/\s+/u).sort(),
    )
  )
    errors.push(exercise.id + ': word tiles must preserve the model spelling and case');
  const sentence = exercise.sentenceExplanation;
  if (faultyBecauseCase.test(sentence?.parts.map((part) => part.finnish).join(' ') ?? ''))
    errors.push(exercise.id + ': use ordinary capitalization inside because clauses');
  if (!sentence) {
    errors.push(exercise.id + ': expected complete sentence feedback');
    return;
  }
  const isQuestion = sentence.parts.at(-1)?.finnish.endsWith('?');
  const pattern = new RegExp(isQuestion ? target.question : target.answer, 'u');
  const expressed = normalize(sentence.parts.map((part) => part.finnish).join(' '));
  if (!pattern.test(expressed) || !matchesQuestionNumber(expressed, target))
    errors.push(exercise.id + ': incorrect target form in feedback');
  if (exercise.type !== 'translation-en')
    for (const answer of exercise.acceptedAnswers)
      if (!pattern.test(normalize(answer)) || !matchesQuestionNumber(answer, target))
        errors.push(exercise.id + ': incorrect question/answer alternative');
  if (target.scope?.axis === 'form' && !exercise.tags.includes('form-' + target.scope.number))
    errors.push(exercise.id + ': missing nominal form-number tag');
  if (exercise.type === 'translation-en') {
    const english = normalize(exercise.acceptedAnswers[0]);
    if (!english) errors.push(exercise.id + ': missing interpreted answer');
  }
}
