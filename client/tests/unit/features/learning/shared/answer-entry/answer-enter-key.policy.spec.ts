import { describe, expect, it } from 'vitest';
import { answerEnterAction } from '@/features/learning/shared/answer-entry/answer-enter-key.policy';

describe('answerEnterAction', () => {
  it('submits from an answer control only when the draft is valid', () => {
    const input = document.createElement('input');
    input.type = 'text';
    const choice = document.createElement('input');
    choice.type = 'radio';
    const checkAnswer = document.createElement('button');
    checkAnswer.className = 'submit-button';

    expect(answerEnterAction(keydown(input), false, true)).toBe('submit');
    expect(answerEnterAction(keydown(choice), false, true)).toBe('submit');
    expect(answerEnterAction(keydown(checkAnswer), false, true)).toBe('submit');
    expect(answerEnterAction(keydown(input), false, false)).toBeNull();
    expect(answerEnterAction(keydown(choice, { shiftKey: true }), false, true)).toBeNull();
  });

  it('continues from feedback regardless of the focused control or modifiers', () => {
    const input = document.createElement('input');
    input.type = 'text';
    const link = document.createElement('a');

    expect(answerEnterAction(keydown(input), true, false)).toBe('continue');
    expect(answerEnterAction(keydown(link), true, false)).toBe('continue');
    expect(answerEnterAction(keydown(input, { shiftKey: true }), true, false)).toBe('continue');
  });

  it('leaves other buttons to their native Enter action', () => {
    const word = document.createElement('button');
    word.className = 'word-token';
    expect(answerEnterAction(keydown(word), false, true)).toBeNull();
  });

  it('blocks repeated keydowns before they can duplicate an operation', () => {
    expect(
      answerEnterAction(keydown(document.createElement('input'), { repeat: true }), false, true),
    ).toBe('block');
  });
});

function keydown(target: HTMLElement, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Enter', ...init });
  Object.defineProperty(event, 'target', { value: target });
  return event;
}
