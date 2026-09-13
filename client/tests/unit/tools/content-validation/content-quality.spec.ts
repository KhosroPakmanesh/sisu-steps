import { describe, expect, it } from 'vitest';
import {
  validateExerciseEditorialQuality,
  validateLessonVocabularyVisibility,
  validateVocabularyItemTypes,
} from '../../../../tools/content-validation/content-quality.mjs';

describe('standalone content-quality validation', () => {
  it('rejects known vocabulary hidden in a worked example', () => {
    const lessons = [
      lesson({
        id: 'first',
        introducedVocabulary: [{ finnish: 'talo', english: 'house', type: 'word' }],
        examples: [{ finnish: 'talo', english: 'house', steps: ['Read it.'] }],
      }),
      lesson({
        id: 'second',
        introducedVocabulary: [{ finnish: 'koulu', english: 'school', type: 'word' }],
        examples: [{ finnish: 'talo', english: 'house', steps: ['Read it.'] }],
      }),
    ];

    expect(validateLessonVocabularyVisibility(lessons)).toContain(
      'second: worked-example vocabulary talo is not classified',
    );
  });

  it('rejects supplied vocabulary without a visible meaning', () => {
    const lessons = [
      lesson({
        id: 'lesson',
        suppliedVocabulary: [{ finnish: 'hyvin', english: 'well', type: 'word' }],
        examples: [{ finnish: 'hyvin', english: 'clearly', steps: ['Read it.'] }],
      }),
    ];

    expect(validateLessonVocabularyVisibility(lessons)).toContain(
      'lesson: supplied vocabulary hyvin lacks a visible Finnish form and English meaning',
    );
  });

  it('rejects multiword vocabulary masquerading as one word', () => {
    const errors = validateVocabularyItemTypes([
      lesson({
        introducedVocabulary: [
          { finnish: 'Suomessa huomenna', english: 'in Finland tomorrow', type: 'word' },
        ],
      }),
    ]);

    expect(errors).toContain(
      'lesson: word vocabulary Suomessa huomenna must contain one Finnish word',
    );
  });

  it('rejects missing and unsupported vocabulary item types', () => {
    const errors = validateVocabularyItemTypes([
      lesson({
        introducedVocabulary: [
          { finnish: 'talo', english: 'house' },
          { finnish: 'koulu', english: 'school', type: 'phrase' },
        ],
      }),
    ]);

    expect(errors).toContain('lesson: vocabulary talo has an invalid type');
    expect(errors).toContain('lesson: vocabulary koulu has an invalid type');
  });

  it('accepts a typed genuine fixed expression and rejects a one-word expression', () => {
    const valid = lesson({
      introducedVocabulary: [
        { finnish: 'hyvää huomenta', english: 'good morning', type: 'fixed-expression' },
      ],
    });
    const invalid = lesson({
      id: 'invalid',
      introducedVocabulary: [{ finnish: 'huomenta', english: 'morning', type: 'fixed-expression' }],
    });

    expect(validateVocabularyItemTypes([valid])).toEqual([]);
    expect(validateVocabularyItemTypes([invalid])).toContain(
      'invalid: fixed-expression vocabulary huomenta must contain multiple Finnish words',
    );
  });

  it('does not demand component declarations inside an owned fixed expression', () => {
    const lessons = [
      lesson({
        id: 'component-owner',
        introducedVocabulary: [{ finnish: 'huomenta', english: 'morning', type: 'word' }],
      }),
      lesson({
        id: 'expression-owner',
        introducedVocabulary: [
          { finnish: 'hyvää huomenta', english: 'good morning', type: 'fixed-expression' },
        ],
        examples: [{ finnish: 'Hyvää huomenta!', english: 'Good morning!', steps: ['Learn it.'] }],
      }),
    ];

    expect(validateLessonVocabularyVisibility(lessons)).toEqual([]);
  });

  it('rejects a repeated optional-practice label', () => {
    expect(
      validateExerciseEditorialQuality([
        { id: 'practice', prompt: 'Optional practice: Optional practice: Answer this.' },
      ]),
    ).toEqual(['practice: repeats the optional-practice label']);
  });
});

function lesson(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    id: 'lesson',
    title: 'Lesson',
    summary: 'Summary',
    objectives: [],
    sections: [],
    examples: [],
    commonMistakes: [],
    practiceExercises: [],
    introducedVocabulary: [],
    reusedVocabulary: [],
    suppliedVocabulary: [],
    ...overrides,
  };
}
