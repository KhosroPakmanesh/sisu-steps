import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateGenitiveFamily } from '@/features/learning/shared/content/validation/genitive-family.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';
import { validateGenitiveFamily as validateSource } from '../../../../tools/content-validation/genitives/genitive-family.mjs';

describe('standard-written Genitive family', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = ((await loadContentSource('content')).packs as unknown as TopicPack[]).filter((pack) =>
      pack.id.startsWith('genitive-'),
    );
  });

  it('validates all 42 targets, 50 tests and 1,230 scored/optional items at both boundaries', async () => {
    expect(packs).toHaveLength(8);
    expect(packs.flatMap((pack) => pack.lessons)).toHaveLength(42);
    expect(packs.flatMap((pack) => pack.tests)).toHaveLength(50);
    expect(packs.flatMap((pack) => pack.tests.flatMap((test) => test.exercises))).toHaveLength(
      1104,
    );
    expect(
      packs.flatMap((pack) => pack.lessons.flatMap((lesson) => lesson.practiceExercises)),
    ).toHaveLength(126);
    for (const pack of packs) {
      expect(validateGenitiveFamily(pack)).toEqual([]);
      expect(validateSource(pack)).toEqual([]);
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
    }
  }, 20_000);

  it('actually grades every accepted alternative, distractor and typed diagnostic', () => {
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
            const graded = gradeAnswer(exercise, answer);
            expect(graded.correct, exercise.id + ': ' + answer).toBe(false);
            expect(graded.diagnosticExplanation).toBe(diagnostic.explanation);
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
    'wrong form',
    'wrong number',
    'missing tag',
    'shared preparation',
    'wrong example',
    'short test',
    'duplicate demand',
    'broken pair',
    'wrong level',
    'unknown family',
  ])('rejects %s at source and runtime boundaries', async (mutation) => {
    const pack = structuredClone(packs[0]);
    const test = pack.tests[0];
    const item = test.exercises[0];
    if (mutation === 'wrong form') item.acceptedAnswers[0] = 'taloa';
    if (mutation === 'wrong number') item.acceptedAnswers[0] = 'talojen';
    if (mutation === 'missing tag') item.tags = [];
    if (mutation === 'shared preparation') pack.tests[1].lessonIds = test.lessonIds;
    if (mutation === 'wrong example') pack.lessons[0].examples[0].finnish = 'talo → talojen';
    if (mutation === 'short test') test.exercises = test.exercises.slice(0, 19);
    if (mutation === 'duplicate demand') test.exercises[1] = { ...item, id: test.exercises[1].id };
    if (mutation === 'broken pair') item.parallelExerciseId = item.id;
    if (mutation === 'wrong level') pack.level = '0 - C2';
    if (mutation === 'unknown family') pack.id = 'unregistered-genitive-pack';
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
  });

  it.each([
    ['gnf-kpt-singular', 'katun'],
    ['gns-i-e-singular', 'ovin'],
    ['gns-si-de-singular', 'käsin'],
    ['gns-in-ime-singular', 'puhelinn'],
    ['gns-s-kse-singular', 'vastaun'],
    ['gns-exceptions-singular', 'lapsin'],
    ['gnj-kpt-plural', 'pankien'],
    ['gnd-e-plural', 'huonejen'],
    ['gnt-in-plural', 'puhelintten'],
  ])('rejects the stem error %s / %s independently of generic metadata', (lessonId, wrong) => {
    const pack = structuredClone(
      packs.find((candidate) => candidate.lessons.some((lesson) => lesson.id === lessonId))!,
    );
    pack.tests.find((test) => test.id === lessonId + '-test')!.exercises[0].acceptedAnswers = [
      wrong,
    ];
    expect(validateGenitiveFamily(pack).length).toBeGreaterThan(0);
    expect(validateSource(pack).length).toBeGreaterThan(0);
  });

  it('requires ordinary plural alternatives and excludes them from distractors', async () => {
    const pack = structuredClone(packs.find((item) => item.id === 'genitive-forms-plural-ten')!);
    const exercise = pack.tests[0].exercises.find((item) => item.id.includes('-produce-01'))!;
    for (const answer of ['naisten', 'naisien'])
      expect(gradeAnswer(exercise, answer).correct).toBe(true);
    exercise.acceptedAnswers = ['naisten'];
    expect(() => validateTopicPack(pack)).toThrow(/missing standard genitive alternative/);
    expect((await validatePackContent(pack)).errors.join('\n')).toContain(
      'missing standard genitive alternative',
    );
    const choice = pack.tests[0].exercises[0];
    choice.options![1] = 'naisien';
    expect(validateGenitiveFamily(pack).join('\n')).toContain('exactly one correct');
    expect(validateSource(pack).join('\n')).toContain('exactly one correct');
  });

  it('checks sentence targets and independent English-translation vocabulary', async () => {
    const pack = structuredClone(packs.find((item) => item.id === 'genitive-ownership')!);
    const exercise = pack.tests[0].exercises.find((item) => item.type === 'translation-en')!;
    exercise.vocabulary = [];
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
    exercise.sentenceExplanation!.parts[0].finnish = 'Anna';
    expect(validateGenitiveFamily(pack).join('\n')).toContain('incorrect genitive target');
    expect(validateSource(pack).join('\n')).toContain('incorrect genitive target');
  });
});
