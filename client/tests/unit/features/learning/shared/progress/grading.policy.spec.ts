import { describe, expect, it } from 'vitest';
import { Exercise } from '@/features/learning/shared/content/content.models';
import { gradeAnswer, normalizeAnswer } from '@/features/learning/shared/progress/grading.policy';

const exercise: Exercise = {
  id: 'sample',
  type: 'fill-blank',
  instruction: 'Complete the form.',
  prompt: 'pöytä + -ssä',
  acceptedAnswers: ['pöydässä', 'siinä pöydässä'],
  explanation: 'Front vowels select -ssä and t weakens to d.',
  tags: ['vowel-harmony'],
  requiredSkills: ['Vowel harmony'],
  vocabulary: ['pöytä'],
  targetSkill: 'Vowel harmony',
  misconceptionCategory: 'Wrong form',
  answerDiagnostics: [
    {
      answers: ['pöydassa'],
      category: 'Wrong vowel-harmony ending',
      explanation: 'The front vowels require -ssä, not -ssa.',
    },
  ],
};

describe('answer grading', () => {
  it('normalizes case, surrounding/repeated spaces, and terminal punctuation', () => {
    expect(normalizeAnswer('  SIINÄ   PÖYDÄSSÄ?!  ')).toBe('siinä pöydässä');
    expect(gradeAnswer(exercise, ' SIINÄ   PÖYDÄSSÄ. ').correct).toBe(true);
  });
  it('accepts any configured natural alternative', () => {
    expect(gradeAnswer(exercise, 'pöydässä').correct).toBe(true);
    expect(gradeAnswer(exercise, 'siinä pöydässä').correct).toBe(true);
  });
  it('preserves Finnish diacritic distinctions', () => {
    expect(gradeAnswer(exercise, 'poydassa').correct).toBe(false);
    expect(gradeAnswer(exercise, 'pöydassa').correct).toBe(false);
  });
  it('returns an authored exact diagnostic before the general fallback', () => {
    expect(gradeAnswer(exercise, 'pöydassa')).toMatchObject({
      correct: false,
      misconceptionCategory: 'Wrong vowel-harmony ending',
      diagnosticExplanation: 'The front vowels require -ssä, not -ssa.',
    });
    expect(gradeAnswer(exercise, 'something else')).toMatchObject({
      correct: false,
      misconceptionCategory: 'Wrong form',
      diagnosticExplanation: exercise.explanation,
    });
  });
  it('uses the selected option explanation for a multiple-choice error', () => {
    const choiceExercise: Exercise = {
      ...exercise,
      type: 'multiple-choice',
      acceptedAnswers: ['-ssä'],
      options: ['-ssa', '-ssä'],
      optionFeedback: {
        '-ssa': 'This is the back-vowel ending, but pöytä has front vowels.',
        '-ssä': 'Correct: front vowels select -ssä.',
      },
      answerDiagnostics: undefined,
    };
    expect(gradeAnswer(choiceExercise, '-ssa').diagnosticExplanation).toBe(
      'This is the back-vowel ending, but pöytä has front vowels.',
    );
  });
});
