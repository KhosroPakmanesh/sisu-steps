import { beforeAll, describe, expect, it } from 'vitest';
import { Exercise } from '@/features/learning/shared/content/exercise.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateExercise } from '@/features/learning/shared/content/validation/exercise.validator';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateEnglishPossessionAnswers as validateRuntime } from '@/features/learning/shared/content/validation/english-possession.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateEnglishPossessionAnswers } from '../../../../tools/content-validation/shared/english-possession.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('simple English possession translations', () => {
  let packs: TopicPack[];

  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  it('keeps simple models and excludes got from all 77 scored and optional possession translations', () => {
    const ids = ['affirmative-possession', 'negative-possession', 'possession-questions'];
    const exercises = packs
      .filter((pack) => ids.includes(pack.id))
      .flatMap((pack) => [
        ...pack.tests.flatMap((test) => test.exercises),
        ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
      ])
      .filter((exercise) => exercise.type === 'translation-en');
    expect(exercises).toHaveLength(77);
    for (const exercise of exercises) {
      expect(
        exercise.acceptedAnswers.some((answer) => /\bgot\b/iu.test(answer)),
        exercise.id,
      ).toBe(false);
      expect(gradeAnswer(exercise, exercise.acceptedAnswers[0]).correct).toBe(true);
    }
  });

  it.each([
    ['aps-possessors-test-e015', 'He has got a pillow.'],
    ['aps-possessors-test-e015', 'She has got a pillow.'],
    ['aps-possessors-test-e015', 'He or she has got a pillow.'],
    ['nps-fixed-negative-test-e015', 'He has not got a pillow.'],
    ['nps-fixed-negative-test-e015', "He hasn't got a pillow."],
    ['pqs-onko-test-e009', 'Has he got a pen?'],
  ])('rejects excluded grading form for %s: %s', (id, answer) => {
    const exercise = packs
      .flatMap((pack) => pack.tests.flatMap((test) => test.exercises))
      .find((item) => item.id === id)!;
    expect(gradeAnswer(exercise, answer).correct).toBe(false);
  });

  it.each([
    'I have got a book.',
    'I have not got a book.',
    "I haven't got a book.",
    'She has got a book.',
    'She has not got a book.',
    'She hasn’t got a book.',
    'Have you got a book?',
    'Has he or she got a book?',
    'Hasn’t she got a book?',
  ])('rejects %s through both content guards', (answer) => {
    const exercise = {
      ...packs.find((pack) => pack.id === 'affirmative-possession')!.tests[0].exercises[0],
      type: 'translation-en' as const,
      prompt: 'Translate “Minulla on kirja.” into English.',
      acceptedAnswers: ['I have a book.', answer],
    };
    expect(() => validateRuntime(exercise)).toThrow('simple English possession');
    expect(validateEnglishPossessionAnswers([exercise]).join('\n')).toContain(
      'simple English possession',
    );
  });

  it('rejects the excluded construction in optional practice at both complete pack boundaries', async () => {
    const pack = structuredClone(packs.find((item) => item.id === 'affirmative-possession')!);
    const practice = pack.lessons
      .flatMap((lesson) => lesson.practiceExercises)
      .find((item) => item.type === 'translation-en')!;
    practice.acceptedAnswers.push('I have got a book.');
    expect(() => validateTopicPack(pack)).toThrow('simple English possession');
    expect((await validatePackContent(pack)).errors.join('\n')).toContain(
      'simple English possession',
    );
  });

  it('keeps the restriction specific to English possession, including future non-possession got', () => {
    const exercise: Exercise = {
      ...packs[0].tests[0].exercises[0],
      type: 'translation-en',
      prompt: 'Translate “Minä sain kirjan.” into English.',
      acceptedAnswers: ['I got a book.'],
    };
    expect(() => validateRuntime(exercise)).not.toThrow();
    expect(validateEnglishPossessionAnswers([exercise])).toEqual([]);
    const finnish = {
      ...exercise,
      type: 'translation-fi' as const,
      prompt: 'Write “I have a book.” Use minulla.',
    };
    expect(() => validateRuntime(finnish)).not.toThrow();
    expect(validateEnglishPossessionAnswers([finnish])).toEqual([]);
  });

  it('wires the scored boundary to the possession guard', () => {
    const exercise = structuredClone(
      packs
        .find((item) => item.id === 'affirmative-possession')!
        .tests.flatMap((test) => test.exercises)
        .find((item) => item.type === 'translation-en')!,
    );
    exercise.acceptedAnswers.push('I have got a book.');
    expect(() => validateExercise(exercise, new Set())).toThrow('simple English possession');
  });
});
