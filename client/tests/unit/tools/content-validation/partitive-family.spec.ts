import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validatePartitiveFamily } from '@/features/learning/shared/content/validation/partitive-family.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';
import { validatePartitiveFamily as validateSource } from '../../../../tools/content-validation/partitives/partitive-family.mjs';

describe('beginner standard-written partitive family', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    const installed = (await loadContentSource('content')).packs as unknown as TopicPack[];
    packs = installed.filter((p) => p.id.startsWith('partitive-'));
  });

  it('validates every source and runtime pack and the complete coverage inventory', async () => {
    expect(packs).toHaveLength(5);
    expect(packs.flatMap((p) => p.lessons)).toHaveLength(30);
    expect(packs.flatMap((p) => p.tests)).toHaveLength(35);
    expect(packs.flatMap((p) => p.tests.flatMap((t) => t.exercises))).toHaveLength(808);
    expect(packs.flatMap((p) => p.lessons.flatMap((l) => l.practiceExercises))).toHaveLength(90);
    for (const pack of packs) {
      expect(validatePartitiveFamily(pack)).toEqual([]);
      expect(validateSource(pack)).toEqual([]);
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
    }
  });

  it('grades every declared alternative and diagnostic, preserving diacritics', () => {
    for (const pack of packs) {
      const items = [
        ...pack.tests.flatMap((t) => t.exercises),
        ...pack.lessons.flatMap((l) => l.practiceExercises),
      ];
      for (const item of items) {
        for (const option of item.options ?? [])
          expect(gradeAnswer(item, option).correct, item.id + ': ' + option).toBe(
            item.acceptedAnswers.includes(option),
          );
        for (const answer of item.acceptedAnswers)
          expect(gradeAnswer(item, answer).correct, item.id + ': ' + answer).toBe(true);
        for (const diagnostic of item.answerDiagnostics ?? [])
          for (const answer of diagnostic.answers) {
            const graded = gradeAnswer(item, answer);
            expect(graded.correct, item.id + ': ' + answer).toBe(false);
            expect(graded.diagnosticExplanation).toBe(diagnostic.explanation);
          }
        if (item.type !== 'translation-en' && /[äö]/u.test(item.acceptedAnswers[0])) {
          expect(
            gradeAnswer(item, item.acceptedAnswers[0].replaceAll('ä', 'a').replaceAll('ö', 'o'))
              .correct,
            item.id,
          ).toBe(false);
        }
      }
    }
  });

  it.each([
    'wrong form',
    'opposite example',
    'missing tag',
    'shared preparation',
    'spoken answer',
    'short test',
    'duplicate task',
    'missing vocabulary',
    'broken pair',
  ])('rejects %s at both content boundaries', async (mutation) => {
    const pack = structuredClone(packs[1]);
    const test = pack.tests[0];
    const item = test.exercises[0];
    if (mutation === 'wrong form') item.acceptedAnswers[0] = 'kirjat';
    if (mutation === 'opposite example') pack.lessons[0].examples[0].finnish = 'Paljon kirjoja.';
    if (mutation === 'missing tag') item.tags = item.tags.filter((t) => t !== 'form-singular');
    if (mutation === 'shared preparation') pack.tests[1].lessonIds = [...test.lessonIds];
    if (mutation === 'spoken answer')
      test.exercises
        .find((e) => e.type === 'translation-fi')!
        .acceptedAnswers.push('Mä ostan kirjoja.');
    if (mutation === 'short test') test.exercises = test.exercises.slice(0, 19);
    if (mutation === 'duplicate task') test.exercises[1] = { ...item, id: test.exercises[1].id };
    if (mutation === 'missing vocabulary')
      test.exercises.find((e) => e.type === 'translation-en')!.vocabulary = [];
    if (mutation === 'broken pair') item.parallelExerciseId = item.id;
    expect(() => validateTopicPack(pack)).toThrow();
    expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
  });

  it('distinguishes singular form number after two from the plural referents', () => {
    const pack = packs[1];
    const test = pack.tests[0];
    expect(test.numberScope).toEqual({ axis: 'form', number: 'singular' });
    expect(gradeAnswer(test.exercises[0], 'kirjaa').correct).toBe(true);
    expect(gradeAnswer(test.exercises[0], 'kirjoja').correct).toBe(false);
  });

  it('accepts all object-gender alternatives without confusing her with a possessive', async () => {
    const pack = packs[4];
    const original = pack.tests[0].exercises.find((e) => e.id === 'ptp-personal-singular-en-03')!;
    for (const pronoun of ['him', 'her', 'him or her'])
      expect(gradeAnswer(original, `I am waiting for ${pronoun}.`).correct).toBe(true);
    expect(gradeAnswer(original, 'I am waiting for his.').correct).toBe(false);
    const altered = structuredClone(pack);
    altered.tests[0].exercises.find((e) => e.id === original.id)!.acceptedAnswers =
      original.acceptedAnswers.filter((a) => a !== 'I am waiting for him.');
    expect(() => validateTopicPack(altered)).toThrow(/missing English pronoun alternative/);
    expect((await validatePackContent(altered)).errors.join('\n')).toContain(
      'missing English pronoun alternative',
    );
  });
});
