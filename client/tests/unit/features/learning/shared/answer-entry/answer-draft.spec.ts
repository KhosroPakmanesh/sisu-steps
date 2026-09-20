import { describe, expect, it } from 'vitest';
import { AnswerDraft } from '@/features/learning/shared/answer-entry/answer-draft';
import { Exercise } from '@/features/learning/shared/content/exercise.models';

const wordOrder: Exercise = {
  id: 'word-order',
  type: 'word-order',
  instruction: 'Build the sentence.',
  prompt: 'I am here.',
  acceptedAnswers: ['Minä olen täällä.'],
  explanation: 'A sentence.',
  tags: [],
  requiredSkills: [],
  vocabulary: [],
  tokens: ['Minä', 'olen', 'täällä.'],
};

describe('answer draft', () => {
  it('assembles, edits, and resets word-order answers', () => {
    const draft = new AnswerDraft(
      () => wordOrder,
      () => false,
    );
    draft.chooseToken(0);
    draft.chooseToken(1);
    expect(draft.submittedAnswer()).toBe('Minä olen');
    draft.removeToken(0);
    expect(draft.submittedAnswer()).toBe('olen');
    draft.reset();
    expect(draft.canSubmit()).toBe(false);
  });

  it('restores repeated word-order tokens by position', () => {
    const repeated = { ...wordOrder, tokens: ['on', 'on', 'hyvä'] };
    const draft = new AnswerDraft(
      () => repeated,
      () => false,
    );
    draft.restore('on on hyvä');
    expect(draft.selectedTokenIndexes()).toEqual([0, 1, 2]);
  });

  it('does not mutate a locked draft', () => {
    const draft = new AnswerDraft(
      () => wordOrder,
      () => true,
    );
    draft.chooseToken(0);
    draft.eraseResponse();
    expect(draft.selectedTokenIndexes()).toEqual([]);
    expect(draft.canSubmit()).toBe(false);
  });
});
