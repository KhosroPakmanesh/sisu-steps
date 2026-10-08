import { beforeAll, describe, expect, it } from 'vitest';
import { Exercise } from '@/features/learning/shared/content/exercise.models';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateExercise } from '@/features/learning/shared/content/validation/exercise.validator';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateEnglishPronounAnswers as validateRuntime } from '@/features/learning/shared/content/validation/english-pronoun.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateEnglishPronounAnswers } from '../../../../tools/content-validation/shared/english-pronoun.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

const cases = [
  ['ppo-t19-e24', ['he', 'she', 'he or she']],
  ['ppo-t16-e12', ['he', 'she', 'he or she']],
  ['ppo-t03-e20', ['he / you', 'she / you', 'he or she / you']],
  ['sdp-se-han-test-e009', ['He is here.', 'She is here.', 'He or she is here.']],
  ['aps-fixed-on-test-e015', ['He has a pillow.', 'She has a pillow.', 'He or she has a pillow.']],
  [
    'aps-possessors-test-e015',
    ['He has a pillow.', 'She has a pillow.', 'He or she has a pillow.'],
  ],
  ['aps-sentences-test-e009', ['He has a pen.', 'She has a pen.', 'He or she has a pen.']],
  [
    'nps-fixed-negative-test-e015',
    [
      'He does not have a pillow.',
      'She does not have a pillow.',
      'He or she does not have a pillow.',
    ],
  ],
  [
    'nps-sentences-test-e009',
    ['He does not have a pen.', 'She does not have a pen.', 'He or she does not have a pen.'],
  ],
  [
    'pqs-onko-test-e009',
    ['Does he have a pen?', 'Does she have a pen?', 'Does he or she have a pen?'],
  ],
  [
    'npq-eiko-test-e009',
    ['Doesn’t he have a pen?', 'Doesn’t she have a pen?', 'Doesn’t he or she have a pen?'],
  ],
  ['ppe-owner-forms-test-e015', ['his game', 'her game', 'his or her game']],
  [
    'ppe-sentences-test-e019',
    ['This is his game.', 'This is her game.', 'This is his or her game.'],
  ],
  ['ppe-third-person-test-e018', ['his dog', 'her dog', 'his or her dog']],
  ['ppe-third-person-test-e020', ['his apple', 'her apple', 'his or her apple']],
] as const;

describe('English gender-neutral pronoun alternatives', () => {
  let packs: TopicPack[];
  let items: Exercise[];

  beforeAll(async () => {
    const source = await loadContentSource('content');
    packs = source.packs as unknown as TopicPack[];
    items = packs.flatMap((pack) => [
      ...pack.tests.flatMap((test) => test.exercises),
      ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
    ]);
  });

  it.each(cases)('grades all three translations of %s', (id, answers) => {
    const exercise = items.find((item) => item.id === id)!;
    for (const answer of answers) expect(gradeAnswer(exercise, answer).correct, answer).toBe(true);
  });

  it('audits all installed packs and both optional-practice pronoun translations', async () => {
    expect(packs).toHaveLength(14);
    for (const pack of packs) {
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
    }
    const practices = ['ppo-l07-p01', 'ppo-l13-p04'].map((id) =>
      items.find((item) => item.id === id)!,
    );
    for (const exercise of practices) {
      for (const subject of ['he', 'she', 'he or she']) {
        const answer = exercise.acceptedAnswers[0].replace(/he or she/iu, subject);
        expect(gradeAnswer(exercise, answer).correct).toBe(true);
      }
    }
  });

  it('keeps permitted articles and negative contractions while rejecting wrong meanings', () => {
    const pillow = items.find((item) => item.id === 'aps-possessors-test-e015')!;
    const negative = items.find((item) => item.id === 'nps-fixed-negative-test-e015')!;
    for (const answer of ['He or she has the pillow.']) {
      expect(gradeAnswer(pillow, answer).correct).toBe(true);
    }
    for (const answer of [
      "He or she doesn't have a pillow.",
      'He or she doesn’t have the pillow.',
    ]) {
      expect(gradeAnswer(negative, answer).correct).toBe(true);
    }
    for (const answer of [
      'They have a pillow.',
      'He does not have a pillow.',
      'His has a pillow.',
    ]) {
      expect(gradeAnswer(pillow, answer).correct).toBe(false);
    }
    expect(gradeAnswer(negative, 'He has a pillow.').correct).toBe(false);
  });

  it.each(['He is here.', 'She is here.', 'He or she is here.'])(
    'rejects missing %s at both boundaries',
    (missing) => {
      const exercise = structuredClone(items.find((item) => item.id === 'ppo-t04-e05')!);
      exercise.acceptedAnswers = exercise.acceptedAnswers.filter((answer) => answer !== missing);
      expect(() => validateExercise(exercise, new Set())).toThrow(
        'missing English pronoun alternative',
      );
      expect(validateEnglishPronounAnswers([exercise]).join('\n')).toContain(
        'missing English pronoun alternative',
      );
    },
  );

  it('rejects an optional-practice omission through complete pack validation', async () => {
    const pack = structuredClone(
      packs.find((item) => item.id === 'personal-pronouns-affirmative-olla')!,
    );
    const exercise = pack.lessons
      .flatMap((lesson) => lesson.practiceExercises)
      .find((item) => item.id === 'ppo-l07-p01')!;
    exercise.acceptedAnswers = ['He or she is safe now.'];
    expect(() => validateTopicPack(pack)).toThrow('missing English pronoun alternative');
    expect((await validatePackContent(pack)).errors.join('\n')).toContain(
      'missing English pronoun alternative',
    );
  });

  it('rejects missing possessive alternatives in every accepted frame', () => {
    const exercise = structuredClone(
      items.find((item) => item.id === 'ppe-third-person-test-e018')!,
    );
    exercise.acceptedAnswers = ['his dog', 'her dog'];
    expect(() => validateExercise(exercise, new Set())).toThrow(
      'missing English pronoun alternative',
    );
    expect(validateEnglishPronounAnswers([exercise]).join('\n')).toContain('his or her dog');
  });

  it.each(['This game is his.', 'This game is hers.', 'This game is his or hers.'])(
    'requires the natural predicative alternative %s without adjective substitutions',
    (missing) => {
      const exercise = structuredClone(
        items.find((item) => item.id === 'ppe-sentences-test-e019')!,
      );
      expect(() => validateRuntime(exercise)).not.toThrow();
      expect(validateEnglishPronounAnswers([exercise])).toEqual([]);
      expect(gradeAnswer(exercise, missing).correct).toBe(true);
      expect(gradeAnswer(exercise, 'This game is her.').correct).toBe(false);
      exercise.acceptedAnswers = exercise.acceptedAnswers.filter((answer) => answer !== missing);
      expect(() => validateRuntime(exercise)).toThrow('missing English pronoun alternative');
      expect(validateEnglishPronounAnswers([exercise]).join('\n')).toContain(
        missing.toLowerCase().replace(/\.$/u, ''),
      );
    },
  );

  it.each(['Use he or she.', 'Owner: he or she.', 'Use his or her.'])(
    'rejects ambiguous wording: %s',
    (cue) => {
      const exercise = {
        ...items.find((item) => item.id === 'aps-possessors-test-e015')!,
        prompt: `Translate “Hänellä on tyyny.” into English. ${cue}`,
      };
      expect(() => validateExercise(exercise, new Set())).toThrow(
        'ambiguous English pronoun-choice wording',
      );
      expect(validateEnglishPronounAnswers([exercise]).join('\n')).toContain(
        'ambiguous English pronoun-choice wording',
      );
    },
  );

  it('keeps Finnish he and constrained interaction answers outside English validation', () => {
    const base = items.find((item) => item.id === 'ppo-t03-e04')!;
    for (const type of ['translation-fi', 'fill-blank', 'multiple-choice', 'word-order'] as const) {
      const exercise = { ...base, type, acceptedAnswers: ['he'] };
      expect(() => validateRuntime(exercise)).not.toThrow();
      expect(validateEnglishPronounAnswers([exercise])).toEqual([]);
    }
  });
});
