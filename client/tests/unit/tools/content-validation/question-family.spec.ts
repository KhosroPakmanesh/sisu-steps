import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { QUESTION_TARGETS } from '@/features/learning/shared/content/validation/question-family-targets';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('Question words and answers', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = ((await loadContentSource('content')).packs as unknown as TopicPack[]).filter(
      (pack) => QUESTION_TARGETS[pack.id],
    );
  });

  it('validates 36 focused relationships, seven Reviews and their independent practice', async () => {
    expect(packs).toHaveLength(7);
    expect(packs.flatMap((pack) => pack.lessons)).toHaveLength(36);
    expect(packs.flatMap((pack) => pack.tests)).toHaveLength(43);
    expect(packs.flatMap((pack) => pack.tests.flatMap((test) => test.exercises))).toHaveLength(864);
    expect(
      packs.flatMap((pack) => pack.lessons.flatMap((lesson) => lesson.practiceExercises)),
    ).toHaveLength(108);
    for (const pack of packs) {
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
    }
  }, 20_000);

  it('grades every explicit alternative, distractor and diagnostic through the actual grader', () => {
    for (const pack of packs) {
      const exercises = [
        ...pack.tests.flatMap((test) => test.exercises),
        ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
      ];
      for (const exercise of exercises) {
        for (const answer of exercise.acceptedAnswers)
          expect(gradeAnswer(exercise, answer).correct, exercise.id + ': ' + answer).toBe(true);
        for (const option of exercise.options ?? [])
          expect(gradeAnswer(exercise, option).correct, exercise.id + ': ' + option).toBe(
            exercise.acceptedAnswers.includes(option),
          );
        for (const diagnostic of exercise.answerDiagnostics ?? [])
          for (const answer of diagnostic.answers) {
            const result = gradeAnswer(exercise, answer);
            expect(result.correct, exercise.id + ': ' + answer).toBe(false);
            expect(result.diagnosticExplanation).toBe(diagnostic.explanation);
          }
        if (exercise.type !== 'translation-en' && /[äö]/u.test(exercise.acceptedAnswers[0]))
          expect(
            gradeAnswer(
              exercise,
              exercise.acceptedAnswers[0].replaceAll('ä', 'a').replaceAll('ö', 'o'),
            ).correct,
            exercise.id,
          ).toBe(false);
      }
    }
  });

  it.each([
    ['qw-reasons-e07', 'Koska minä olen sairas.'],
    ['qw-kuka-singular-e18', "You're a student."],
    ['qw-ketka-plural-e18', "You're students."],
    ['qw-nobody-e17', 'No one is coming.'],
    ['qw-nobody-e18', 'No one is at home.'],
    ['qw-degree-e08', 'Matka on kaksi kilometriä pitkä.'],
    ['qw-degree-e10', 'Kirja on sata sivua pitkä.'],
    ['qw-negative-actions-singular-e07', 'Koska minä olen sairas.'],
    ['qw-negative-actions-plural-e07', 'Koska me olemme sairaita.'],
    ['qw-nobody-e07', 'Ei kukaan tule.'],
    ['qw-description-singular-e05', 'Millainen on koulu?'],
    ['qw-colour-singular-e05', 'Minkä värinen on kynä?'],
    ['qw-missa-inside-e18', 'I live in a house.'],
    ['qw-reasons-e17', 'Because I am sick.'],
  ])('accepts the independently identified natural reply to %s', (id, answer) => {
    const exercise = packs
      .flatMap((pack) => pack.tests.flatMap((test) => test.exercises))
      .find((exercise) => exercise.id === id)!;
    expect(gradeAnswer(exercise, answer).correct).toBe(true);
  });

  it.each([
    'Minkä värisiä kynä on?',
    'Minkä värisiä kynät on?',
    'Minkä värisiä kynä ovat?',
    'Minkävärisiä kynä on?',
  ])('rejects malformed agreement despite the valid question prefix: %s', async (answer) => {
    const pack = structuredClone(
      packs.find((pack) => pack.id === 'description-colour-appearance-questions')!,
    );
    pack.tests
      .find((test) => test.id === 'qw-colour-plural-test')!
      .exercises.find((exercise) => exercise.id === 'qw-colour-plural-e05')!
      .acceptedAnswers.push(answer);
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
  });

  it.each([
    'mastery polarity',
    'full reason teaching',
    'formation vocabulary',
    'weekday retrieval',
  ])('rejects the audited semantic regression: %s', async (mutation) => {
    const id =
      mutation === 'mastery polarity'
        ? 'negative-information-questions'
        : mutation === 'full reason teaching'
          ? 'how-and-why-questions'
          : mutation === 'formation vocabulary'
            ? 'who-and-what-questions'
            : 'time-questions';
    const pack = structuredClone(packs.find((pack) => pack.id === id)!);
    if (mutation === 'mastery polarity') {
      const test = pack.tests.find((test) => test.id === 'qw-negative-olla-singular-test')!;
      const first = test.exercises.find((exercise) => exercise.id.endsWith('-e07'))!;
      const second = test.exercises.find((exercise) => exercise.id.endsWith('-e10'))!;
      first.parallelExerciseId = second.id;
      second.parallelExerciseId = first.id;
      const otherReason = test.exercises.find((exercise) => exercise.id.endsWith('-e08'))!;
      const otherNegative = test.exercises.find((exercise) => exercise.id.endsWith('-e11'))!;
      otherReason.parallelExerciseId = otherNegative.id;
      otherNegative.parallelExerciseId = otherReason.id;
    }
    if (mutation === 'full reason teaching') {
      const lesson = pack.lessons.find((lesson) => lesson.id === 'qw-reasons')!;
      lesson.examples = lesson.examples.filter((example) => !example.finnish.includes(', koska '));
    }
    if (mutation === 'formation vocabulary') {
      const lesson = pack.lessons.find((lesson) => lesson.id === 'qw-mitka-plural')!;
      lesson.suppliedVocabulary = lesson.suppliedVocabulary.filter(
        (entry) => entry.finnish !== 'avaimet',
      );
    }
    if (mutation === 'weekday retrieval') {
      const exercise = pack.tests
        .at(-1)!
        .exercises.find((exercise) => exercise.id === 'qw-milloin-weekdays-review-q2')!;
      exercise.sentenceExplanation!.parts = [
        {
          finnish: 'Milloin',
          meaning: 'when',
          baseForm: 'milloin',
          role: 'time question',
          formation: 'Milloin asks when.',
        },
        {
          finnish: 'hän',
          meaning: 'he or she',
          baseForm: 'hän',
          role: 'subject',
          formation: 'Hän refers to one person.',
        },
        {
          finnish: 'lukee?',
          meaning: 'reads',
          baseForm: 'lukea',
          role: 'verb',
          formation: 'Lukea has the he/she form lukee.',
        },
      ];
      exercise.acceptedAnswers = ['Milloin hän lukee?'];
    }
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
  });

  it.each([
    'wrong number',
    'wrong feedback',
    'missing answer teaching',
    'short test',
    'adjacent partners',
    'wrong tile case',
    'unknown family',
    'generated negative distractor',
  ])('rejects %s at both boundaries', async (mutation) => {
    const pack = structuredClone(
      packs.find((candidate) => candidate.id === 'description-colour-appearance-questions')!,
    );
    const exercise = pack.tests[0].exercises[2];
    if (mutation === 'wrong number') exercise.acceptedAnswers.push('Autot ovat uusia.');
    if (mutation === 'wrong feedback')
      exercise.sentenceExplanation!.parts.at(-1)!.finnish = 'uusia.';
    if (mutation === 'missing answer teaching')
      pack.lessons[0].sections = pack.lessons[0].sections.filter(
        (section) => section.title !== 'Answering the question',
      );
    if (mutation === 'short test') pack.tests[0].exercises.pop();
    if (mutation === 'adjacent partners') {
      const exercises = pack.tests[0].exercises;
      [exercises[1], exercises[2]] = [exercises[2], exercises[1]];
    }
    if (mutation === 'wrong tile case') {
      const exercise = pack.tests[0].exercises.find((exercise) => exercise.type === 'word-order')!;
      exercise.tokens![0] = exercise.tokens![0].toUpperCase();
    }
    if (mutation === 'unknown family') pack.id = 'unregistered-question-family';
    if (mutation === 'generated negative distractor') {
      const previous = exercise.options![1];
      const malformed = 'Auto Ei on uusi.';
      exercise.options![1] = malformed;
      exercise.optionFeedback![malformed] = exercise.optionFeedback![previous];
      delete exercise.optionFeedback![previous];
    }
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
  });

  it('rejects capitalized finite verbs inside a because reply at both boundaries', async () => {
    const pack = structuredClone(packs.find((pack) => pack.id === 'how-and-why-questions')!);
    const example = pack.lessons
      .find((lesson) => lesson.id === 'qw-reasons')!
      .examples.find((example) => example.finnish.startsWith('Koska olen'))!;
    example.finnish = example.finnish.replace('Koska olen', 'Koska Olen');
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
  });

  it('keeps because-replies and affirmative corrections distinct from negative confirmations', () => {
    const pack = packs.find((candidate) => candidate.id === 'negative-information-questions')!;
    const correction = pack.tests.find((test) => test.id === 'qw-correct-assumption-test')!;
    const reply = correction.exercises.find(
      (exercise) => exercise.id === 'qw-correct-assumption-e07',
    )!;
    expect(gradeAnswer(reply, 'Tulen kyllä.').correct).toBe(true);
    expect(gradeAnswer(reply, 'En tule.').correct).toBe(false);
    expect(gradeAnswer(reply, 'Kyllä.').correct).toBe(false);
    const reasons = pack.tests.find((test) => test.id === 'qw-negative-actions-singular-test')!;
    const reason = reasons.exercises.find(
      (exercise) => exercise.id === 'qw-negative-actions-singular-e07',
    )!;
    expect(reason.acceptedAnswers[0]).toBe('Koska olen sairas.');
    expect(reason.sentenceExplanation!.translation).toBe('Because I am ill.');
  });
});
