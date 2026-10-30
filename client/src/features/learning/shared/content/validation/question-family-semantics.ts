import { Exercise } from '../exercise.models';
import { Lesson } from '../lesson.models';
import { QuestionTarget } from './question-family-targets';

const words = (text: string): string[] =>
  text.toLocaleLowerCase('fi-FI').match(/[\p{L}\p{N}]+/gu) ?? [];
// Bounded subject inventories are independent of the authored model answers.
const singularSubjects = new Set(
  'tämä tuo se kirja auto laukku puhelin kynä pallo avain talo tuoli kahvila koulu opettaja opiskelija kahvi tee vesi maito mehu keitto puuro juusto muste hän sinä minä anna matti liisa mikko'.split(
    ' ',
  ),
);
const pluralSubjects = new Set(
  'nämä nuo ne kirjat autot laukut puhelimet kynät pallot avaimet talot tuolit kahvilat koulut opettajat opiskelijat he te me'.split(
    ' ',
  ),
);

export function matchesQuestionNumber(text: string, target: QuestionTarget): boolean {
  if (target.scope?.axis !== 'form') return true;
  const tokens = words(text);
  const plural = target.scope.number === 'plural';
  if (tokens.some((token) => (plural ? singularSubjects : pluralSubjects).has(token))) return false;
  const verbs = tokens.filter((token) =>
    [
      'olen',
      'olet',
      'on',
      'olemme',
      'olette',
      'ovat',
      'en',
      'et',
      'ei',
      'emme',
      'ette',
      'eivät',
    ].includes(token),
  );
  if (!verbs.length) return false;
  const expected = tokens.includes('minä')
    ? ['olen', 'en']
    : tokens.includes('sinä')
      ? ['olet', 'et']
      : tokens.includes('me')
        ? ['olemme', 'emme']
        : tokens.includes('te')
          ? ['olette', 'ette']
          : plural
            ? tokens.some((token) => pluralSubjects.has(token))
              ? ['ovat', 'eivät']
              : ['olemme', 'olette', 'ovat', 'emme', 'ette', 'eivät']
            : ['on', 'ei', 'olen', 'olet', 'en', 'et'];
  return verbs.every((verb) => expected.includes(verb));
}

export function questionResponseDemand(exercise: Exercise): string {
  const sentence = exercise.sentenceExplanation?.parts.map((part) => part.finnish).join(' ') ?? '';
  const tokens = words(sentence);
  const operation = sentence.endsWith('?')
    ? 'question'
    : tokens.includes('koska')
      ? tokens[0] === 'koska'
        ? 'short reason'
        : 'full reason'
      : tokens.some((token) => ['en', 'et', 'ei', 'emme', 'ette', 'eivät'].includes(token))
        ? 'negative reply'
        : 'affirmative reply';
  return [
    exercise.type,
    /^Repair /u.test(exercise.prompt) ? 'repair' : 'construct',
    operation,
  ].join('|');
}

export function validateQuestionTeaching(lesson: Lesson, grammar: string[]): string[] {
  const errors: string[] = [];
  const declared = new Set(
    [...lesson.introducedVocabulary, ...lesson.reusedVocabulary, ...lesson.suppliedVocabulary].map(
      (entry) => entry.finnish.toLocaleLowerCase('fi-FI'),
    ),
  );
  for (const section of lesson.sections)
    for (const paragraph of section.paragraphs) {
      const form = paragraph.match(/^(\S+) means .+ here\./u)?.[1]?.toLocaleLowerCase('fi-FI');
      const base =
        form &&
        (['olen', 'olet', 'on', 'olemme', 'olette', 'ovat', 'ole'].includes(form)
          ? 'olla'
          : ['en', 'et', 'ei', 'emme', 'ette', 'eivät'].includes(form)
            ? 'ei'
            : form === 'mitään'
              ? 'mikään'
              : form);
      if (form && base && !declared.has(form) && !grammar.includes(base))
        errors.push(lesson.id + ': formation vocabulary is not classified: ' + form);
    }
  if (
    lesson.id === 'qw-reasons' &&
    !lesson.examples.some(
      (example) => /, koska /u.test(example.finnish) && !/^Koska /u.test(example.finnish),
    )
  )
    errors.push(lesson.id + ': missing worked full main-clause/because reply');
  return errors;
}
