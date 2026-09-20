import { describe, expect, it } from 'vitest';
import { studyEnterAction } from '@/features/learning/study/runner/study-enter-key.policy';

describe('studyEnterAction', () => {
  it('submits from an answer control only when the draft is valid', () => {
    const input = document.createElement('input');
    input.type = 'text';

    expect(studyEnterAction(keydown(input), false, true)).toBe('submit');
    expect(studyEnterAction(keydown(input), false, false)).toBeNull();
  });

  it('continues from feedback regardless of the focused control or modifiers', () => {
    const input = document.createElement('input');
    input.type = 'text';
    const link = document.createElement('a');

    expect(studyEnterAction(keydown(input), true, false)).toBe('continue');
    expect(studyEnterAction(keydown(link), true, false)).toBe('continue');
    expect(studyEnterAction(keydown(input, { shiftKey: true }), true, false)).toBe('continue');
  });

  it('blocks repeated keydowns before they can duplicate an operation', () => {
    expect(
      studyEnterAction(keydown(document.createElement('input'), { repeat: true }), false, true),
    ).toBe('block');
  });
});

function keydown(target: HTMLElement, init: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key: 'Enter', ...init });
  Object.defineProperty(event, 'target', { value: target });
  return event;
}
