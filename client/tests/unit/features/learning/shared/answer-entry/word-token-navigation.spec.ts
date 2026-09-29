import { describe, expect, it } from 'vitest';
import {
  nextAvailableWordIndex,
  wordTokenArrowStep,
} from '@/features/learning/shared/answer-entry/word-token-navigation';

describe('word token navigation', () => {
  it('moves in authored order, skips selected words, and wraps', () => {
    expect(nextAvailableWordIndex(4, [1], 0)).toBe(2);
    expect(nextAvailableWordIndex(4, [1], 2, -1)).toBe(0);
    expect(nextAvailableWordIndex(4, [1, 2], 3)).toBe(0);
    expect(nextAvailableWordIndex(3, [0, 1, 2], 2)).toBeNull();
  });

  it('uses plain arrow keys only', () => {
    expect(wordTokenArrowStep(new KeyboardEvent('keydown', { key: 'ArrowRight' }))).toBe(1);
    expect(wordTokenArrowStep(new KeyboardEvent('keydown', { key: 'ArrowUp' }))).toBe(-1);
    expect(
      wordTokenArrowStep(new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true })),
    ).toBeNull();
    expect(wordTokenArrowStep(new KeyboardEvent('keydown', { key: 'Enter' }))).toBeNull();
  });
});
