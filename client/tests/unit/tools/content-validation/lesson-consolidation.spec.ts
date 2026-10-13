import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';

describe('consolidated authored answer contracts', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    const installed = (await loadContentSource('content')).packs as unknown as TopicPack[];
    packs = installed.filter((pack) => !pack.id.startsWith('partitive-'));
  });

  it('grades every retained model and alternative and rejects every authored diagnostic', () => {
    const items = packs.flatMap((pack) => [
      ...pack.tests.flatMap((test) => test.exercises),
      ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
    ]);
    expect(items).toHaveLength(2465);
    for (const item of items) {
      for (const answer of item.acceptedAnswers)
        expect(gradeAnswer(item, answer).correct, `${item.id}: ${answer}`).toBe(true);
      for (const diagnostic of item.answerDiagnostics ?? [])
        for (const answer of diagnostic.answers) {
          const result = gradeAnswer(item, answer);
          expect(result.correct, `${item.id}: ${answer}`).toBe(false);
          expect(result.diagnosticExplanation, item.id).toBe(diagnostic.explanation);
        }
    }
  });
});
