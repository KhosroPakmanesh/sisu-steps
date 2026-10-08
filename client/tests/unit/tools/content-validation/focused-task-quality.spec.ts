import { beforeAll, describe, expect, it } from 'vitest';
import { Exercise } from '@/features/learning/shared/content/exercise.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import {
  focusedTaskKey as runtimeKey,
  validateFocusedTaskQuality as runtimeValidate,
} from '@/features/learning/shared/content/validation/focused-task-quality.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import {
  focusedTaskKey,
  validateFocusedTaskQuality,
} from '../../../../tools/content-validation/shared/focused-task-quality.mjs';
import { FOCUSED_QUALITY_REVISION_IDS } from '../../../e2e/support/focused-quality-revision-ids';

const question = (overrides: Partial<Exercise>): Exercise => ({
  id: 'example',
  type: 'translation-fi',
  instruction: 'Answer.',
  prompt: 'Write the answer.',
  acceptedAnswers: ['Minä olen täällä.'],
  explanation: 'Use the speaker form.',
  tags: [],
  requiredSkills: [],
  vocabulary: [],
  targetSkill: 'speaker',
  misconceptionCategory: 'person',
  parallelExerciseId: 'partner',
  ...overrides,
});
const sentence = {
  translation: 'I am here.',
  pattern: 'Subject + olla + location.',
  parts: [
    { finnish: 'Minä', meaning: 'I', role: 'subject', baseForm: 'minä', formation: 'Speaker.' },
    { finnish: 'olen', meaning: 'am', role: 'verb', baseForm: 'olla', formation: 'First person.' },
    {
      finnish: 'täällä.',
      meaning: 'here',
      role: 'location',
      baseForm: 'täällä',
      formation: 'Location.',
    },
  ],
};

describe('Focused task quality', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  it('checks all 103 Focused tests and agrees at both boundaries', () => {
    expect(packs.flatMap((p) => p.tests).filter((t) => t.stage === 'focused')).toHaveLength(103);
    for (const pack of packs) {
      expect(validateFocusedTaskQuality(pack)).toEqual([]);
      expect(runtimeValidate(pack)).toEqual([]);
      for (const test of pack.tests)
        for (const exercise of test.exercises)
          expect(runtimeKey(exercise)).toBe(focusedTaskKey(exercise));
    }
  });

  it('rejects completion/translation duplicates despite different wrapper text', () => {
    const first = question({ sentenceExplanation: sentence });
    const second = question({
      id: 'second',
      type: 'fill-blank',
      prompt: 'Complete a new scene.',
      sentenceExplanation: sentence,
    });
    expect(focusedTaskKey(first)).toBe(focusedTaskKey(second));
    const pack = structuredClone(packs.find((p) => p.id === 'personal-pronouns-affirmative-olla')!);
    pack.tests[0].exercises = [first, second];
    expect(validateFocusedTaskQuality(pack).join(' ')).toContain(
      'repeats the Focused response demand',
    );
    expect(runtimeValidate(pack)).toEqual(validateFocusedTaskQuality(pack));
  });

  it('rejects repeated bare pronoun glosses and cosmetic name changes', () => {
    const first = question({ acceptedAnswers: ['hän'], prompt: 'Translate “he or she”.' });
    expect(focusedTaskKey(first)).toBe(
      focusedTaskKey({ ...first, prompt: 'Complete the pronoun for “she”.' }),
    );
    const context = {
      ...first,
      prompt: 'Aino speaks to Ben about Cora. Write the pronoun for Cora.',
    };
    expect(focusedTaskKey(context)).toBe(
      focusedTaskKey({
        ...context,
        prompt: 'Mika speaks to Nora about Olli. Write the pronoun for Olli.',
      }),
    );
  });

  it('retains different source inputs and different response demands', () => {
    const first = question({ acceptedAnswers: ['back'], vocabulary: ['talo'] });
    expect(focusedTaskKey(first)).not.toBe(focusedTaskKey({ ...first, vocabulary: ['auto'] }));
    const production = question({ sentenceExplanation: sentence });
    expect(focusedTaskKey(production)).not.toBe(
      focusedTaskKey({ ...production, type: 'multiple-choice' }),
    );
    expect(focusedTaskKey(production)).not.toBe(
      focusedTaskKey({ ...production, prompt: 'Repair “Minä on täällä.”' }),
    );
    const reply = question({
      prompt: 'Reply to “Onko hän täällä?”',
      acceptedAnswers: ['Kyllä, on.'],
      tags: ['short-answer'],
    });
    expect(focusedTaskKey(reply)).not.toBe(
      focusedTaskKey({ ...reply, prompt: 'Reply to “Onko hän kotona?”' }),
    );
  });

  it('grades all revised models, alternatives and authored diagnostics', () => {
    const exercises = packs
      .flatMap((p) => p.tests)
      .flatMap((t) => t.exercises)
      .filter((e) => FOCUSED_QUALITY_REVISION_IDS.has(e.id));
    expect(exercises).toHaveLength(172);
    for (const exercise of exercises) {
      for (const answer of exercise.acceptedAnswers)
        expect(gradeAnswer(exercise, answer).correct, exercise.id + ': ' + answer).toBe(true);
      for (const diagnostic of exercise.answerDiagnostics ?? [])
        for (const answer of diagnostic.answers)
          expect(gradeAnswer(exercise, answer).correct, exercise.id + ': ' + answer).toBe(false);
    }
  });

  it('keeps reference, number, case and target-word boundaries', () => {
    const find = (id: string) =>
      packs
        .flatMap((p) => p.tests)
        .flatMap((t) => t.exercises)
        .find((e) => e.id === id)!;
    for (const id of ['ppe-whose-test-e013', 'ppe-whose-test-e014']) {
      const e = find(id);
      expect(gradeAnswer(e, e.acceptedAnswers[0].replace('Kenen ', '')).correct).toBe(false);
    }
    const pair = find('ppo-t01-e12');
    for (const answer of ['I / he', 'I / she', 'I / he or she'])
      expect(gradeAnswer(pair, answer).correct).toBe(true);
    expect(gradeAnswer(pair, 'you / they').correct).toBe(false);
    const plural = find('pop-pronoun-omission-plural-test-e105');
    expect(
      plural.answerDiagnostics!.some((d) => d.answers.some((a) => a.includes('omenatmme'))),
    ).toBe(true);
    expect(gradeAnswer(plural, 'Nämä ovat omenatmme.').correct).toBe(false);
    expect(
      gradeAnswer(find('nds-negative-transformation-plural-test-e101'), 'Nuo kirjat ei ole täällä.')
        .correct,
    ).toBe(false);
  });
});
