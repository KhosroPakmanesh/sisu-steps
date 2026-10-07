import { beforeAll, describe, expect, it } from 'vitest';
import { Exercise } from '@/features/learning/shared/content/exercise.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';

describe('explicit negative-verb-plus-ole replies', () => {
  let exercises: Exercise[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    const pack = source.packs.find(
      (item) => item['id'] === 'olla-questions-short-answers',
    ) as unknown as TopicPack;
    exercises = pack.tests.flatMap((test) => test.exercises);
  });

  it.each([
    ['ppo-written-short-answers-singular-test-e104', 'En.'],
    ['ppo-written-short-answers-singular-test-e106', 'Ei.'],
    ['ppo-written-short-answers-plural-test-e104', 'Eivät.'],
    ['ppo-written-short-answers-plural-test-e106', 'Emme.'],
  ])('explains the task constraint without calling %s: %s ungrammatical', (id, minimal) => {
    const exercise = exercises.find((item) => item.id === id)!;
    expect(exercise.prompt).toContain('Use a negative verb followed by ole.');
    for (const answer of exercise.acceptedAnswers)
      expect(gradeAnswer(exercise, answer).correct).toBe(true);
    const result = gradeAnswer(exercise, minimal);
    expect(result.correct).toBe(false);
    expect(result.diagnosticExplanation).toContain(minimal + ' is a natural short reply.');
    expect(result.diagnosticExplanation).toContain('specifically asks');
    expect(result.diagnosticExplanation).toContain(exercise.acceptedAnswers[0]);
  });
});
