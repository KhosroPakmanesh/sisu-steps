import { GENITIVE_TARGETS } from './genitive-family-targets.mjs';
const normalize = (text) => (text.toLocaleLowerCase('fi-FI').match(/[\p{L}]+/gu) ?? []).join(' ');
const mappings = (target) =>
  Object.fromEntries(
    target[3].split('|').map((entry) => {
      const [base, forms] = entry.split('=');
      return [normalize(base), forms.split('/').map(normalize)];
    }),
  );
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const spoken = /(?:^|[^\p{L}])(?:mä|sä|mua|sua|tää|toi|nää|noi|oon|oot)(?=$|[^\p{L}])/iu;
export function validateGenitiveFamily(pack) {
  const targets = GENITIVE_TARGETS[pack.id];
  if (!targets) return [];
  const errors = [];
  const ids = targets.map((target) => target[0]);
  if (pack.level !== '0 - A1.3') errors.push(pack.id + ': incorrect genitive level');
  if (
    !same(
      pack.lessons.map((lesson) => lesson.id),
      ids,
    )
  )
    errors.push(pack.id + ': incorrect genitive lesson sequence');
  if (pack.tests.length !== targets.length + 1 || pack.tests.at(-1)?.stage !== 'review')
    errors.push(pack.id + ': genitive Focused sequence must end in one Review');
  for (const [index, target] of targets.entries()) {
    const [id, number, count] = target;
    const lesson = pack.lessons[index];
    const test = pack.tests[index];
    if (!lesson || !test) {
      errors.push(id + ': missing preparation or test');
      continue;
    }
    if (
      test.id !== id + '-test' ||
      test.stage !== 'focused' ||
      !same(test.lessonIds, [id]) ||
      test.exercises.length !== count
    )
      errors.push(id + ': incorrect Focused ownership or count');
    const scope = { axis: 'form', number };
    if (!same(lesson.numberScope, scope) || !same(test.numberScope, scope))
      errors.push(id + ': incorrect genitive form scope');
    if (lesson.practiceExercises.length !== 3)
      errors.push(id + ': expected three independent optional items');
    const table = mappings(target);
    const allowed = Object.values(table).flat();
    for (const example of lesson.examples) {
      if (example.finnish.includes(' → ')) {
        const [base, forms] = example.finnish.split(' → ');
        if (!same(forms.split(' / ').map(normalize), table[normalize(base)]))
          errors.push(id + ': incorrect worked form mapping');
      } else {
        const sentence = ' ' + normalize(example.finnish) + ' ';
        if (!allowed.some((form) => sentence.includes(' ' + form + ' ')))
          errors.push(id + ': worked example lacks the taught genitive');
      }
    }
    for (const exercise of [...test.exercises, ...lesson.practiceExercises])
      checkExercise(exercise, target, pack.grammarBaseForms, errors);
  }
  const review = pack.tests.at(-1);
  if (review) {
    if (!same(review.lessonIds, ids) || review.exercises.length !== targets.length * 4)
      errors.push(pack.id + ': incomplete cumulative Review');
    for (const [index, target] of targets.entries()) {
      const skill = pack.lessons[index]?.targetSkills[0];
      const items = review.exercises.filter((exercise) => exercise.targetSkill === skill);
      if (items.length !== 4)
        errors.push(target[0] + ': Review must retrieve the target four times');
      for (const exercise of items) checkExercise(exercise, target, pack.grammarBaseForms, errors);
    }
  }
  if (spoken.test(JSON.stringify([pack.lessons, pack.tests])))
    errors.push(pack.id + ': spoken Finnish is outside the approved register');
  return errors;
}
function checkExercise(exercise, target, grammar, errors) {
  const fail = (message) => errors.push(exercise.id + ': ' + message);
  if (!exercise.tags.includes('form-' + target[1])) fail('missing genitive number tag');
  const table = mappings(target);
  const allForms = Object.values(table).flat();
  const answers = exercise.acceptedAnswers.map(normalize);
  const sentence = exercise.sentenceExplanation;
  if (sentence) {
    const parts = sentence.parts.filter((part) => part.role === 'genitive target');
    const part = parts[0];
    const forms = part && table[normalize(part.baseForm)];
    if (parts.length !== 1 || !forms?.includes(normalize(part.finnish))) {
      fail('incorrect genitive target or number in sentence');
      return;
    }
    if (exercise.type === 'translation-en') {
      const expected = [
        ...new Set(
          sentence.parts
            .flatMap((item) => item.baseForm.split(' '))
            .filter((base) => !grammar.includes(base)),
        ),
      ].sort();
      if (!same([...exercise.vocabulary].sort(), expected))
        fail('lexical recall does not match the translated sentence');
      return;
    }
    if (exercise.type === 'translation-fi' || exercise.type === 'word-order') {
      const sentences = forms.map((form) =>
        normalize(sentence.parts.map((item) => (item === part ? form : item.finnish)).join(' ')),
      );
      if (answers.some((answer) => !sentences.includes(answer)))
        fail('incorrect full-sentence genitive answer');
      if (sentences.some((answer) => !answers.includes(answer)))
        fail('missing standard full-sentence genitive alternative');
    } else {
      checkAlternatives(exercise, answers, forms, fail);
    }
    return;
  }
  if (exercise.vocabulary.length) fail('supplied form task must not require lexical recall');
  const cues = [...exercise.prompt.matchAll(/([\p{L}]+)\s*\(“/gu)].map((match) =>
    normalize(match[1]),
  );
  if (exercise.tags.includes('base-recognition')) {
    const form = normalize(exercise.prompt.match(/“([^”]+)”/u)?.[1] ?? '');
    if (answers.some((base) => !table[base]?.includes(form)))
      fail('incorrect reverse form mapping');
  } else if (exercise.tags.includes('ending-completion')) {
    const stem = exercise.prompt.match(/:\s*([\p{L}]+)____/u)?.[1] ?? '';
    if (answers.some((answer) => !table[cues[0]]?.includes(normalize(stem + answer))))
      fail('incorrect final-letter completion');
  } else if (exercise.tags.includes('stem-completion')) {
    if (answers.some((answer) => !table[cues[0]]?.includes(answer + 'n')))
      fail('incorrect form completion before n');
  } else if (exercise.tags.includes('paired-forms')) {
    for (const answer of exercise.acceptedAnswers) {
      const forms = answer.split(',').map(normalize);
      if (forms.length !== 2 || forms.some((form, index) => !table[cues[index]]?.includes(form)))
        fail('incorrect paired genitive forms or order');
    }
  } else {
    const expected = table[cues[0]] ?? allForms;
    checkAlternatives(exercise, answers, expected, fail);
  }
}
function checkAlternatives(exercise, answers, expected, fail) {
  if (answers.some((answer) => !expected.includes(answer))) fail('incorrect genitive form');
  if (exercise.type !== 'multiple-choice' && expected.some((answer) => !answers.includes(answer)))
    fail('missing standard genitive alternative');
  if (
    exercise.type === 'multiple-choice' &&
    exercise.options?.filter((option) => expected.includes(normalize(option))).length !== 1
  )
    fail('choices must contain exactly one correct genitive form');
}
