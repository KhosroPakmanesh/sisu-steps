import { describe, expect, it } from 'vitest';
import { vocabularyForExercise } from '@/features/learning/shared/content/content.queries';
import { learningPack } from '@testing/helpers/unit/learning-content.fixture';

describe('content queries', () => {
  it('returns only the current exercise vocabulary in authored order', () => {
    const pack = structuredClone(learningPack);
    const exercise = structuredClone(pack.tests[0].exercises[0]);
    exercise.vocabulary = ['koulu', 'talo', 'koulu'];

    expect(vocabularyForExercise(pack, exercise)).toEqual([
      { finnish: 'koulu', english: 'school', type: 'word' },
      { finnish: 'talo', english: 'house', type: 'word' },
    ]);
  });

  it('resolves reused and supplied lesson vocabulary without returning unrelated words', () => {
    const pack = structuredClone(learningPack);
    pack.lessons[0].reusedVocabulary = [{ finnish: 'eilen', english: 'yesterday', type: 'word' }];
    const exercise = structuredClone(pack.tests[0].exercises[0]);
    exercise.vocabulary = ['eilen', 'hyvin'];

    expect(vocabularyForExercise(pack, exercise).map(({ finnish }) => finnish)).toEqual([
      'eilen',
      'hyvin',
    ]);
  });
});
