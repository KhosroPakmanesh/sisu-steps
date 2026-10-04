import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateOwnershipQuestionVariety as validateRuntimeVariety } from '@/features/learning/shared/content/validation/ownership-question-variety.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateOwnershipQuestionVariety } from '../../../../tools/content-validation/shared/ownership-question-variety.mjs';

describe('ownership question variety', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    const source = await loadContentSource('content');
    const ids = source.catalog.groups.find(
      (group) => group.id === 'ownership-and-possession',
    )!.packs;
    packs = ids.map((id) => source.packs.find((pack) => pack['id'] === id) as unknown as TopicPack);
  });

  it('accepts the complete family and its intentional narrow harmony drills', () => {
    for (const pack of packs) {
      expect(validateOwnershipQuestionVariety(pack)).toEqual([]);
      expect(() => validateRuntimeVariety(pack)).not.toThrow();
      expect(validateTopicPack(pack).id).toBe(pack.id);
    }
  });

  const mutations: Array<[string, (pack: TopicPack) => void, string]> = [
    [
      'missing scored blanks',
      (pack) => {
        for (const exercise of pack.tests.flatMap((test) => test.exercises))
          if (exercise.type === 'fill-blank') exercise.type = 'translation-fi';
      },
      'scored ownership work must include fill-blank',
    ],
    [
      'missing optional blanks',
      (pack) => {
        for (const exercise of pack.lessons.flatMap((lesson) => lesson.practiceExercises))
          if (exercise.type === 'fill-blank') exercise.type = 'translation-fi';
      },
      'optional ownership work must include fill-blank',
    ],
    [
      'concentrated Review production',
      (pack) => {
        for (const exercise of pack.tests.at(-1)!.exercises.slice(0, 9))
          exercise.type = 'translation-fi';
      },
      'no ownership Review format may exceed one third',
    ],
    [
      'three consecutive choices',
      (pack) => {
        const test = pack.tests[0];
        const choices = test.exercises
          .filter((exercise) => exercise.type === 'multiple-choice')
          .slice(0, 3);
        const ids = new Set(choices.map((exercise) => exercise.id));
        test.exercises = [
          ...choices,
          ...test.exercises.filter((exercise) => !ids.has(exercise.id)),
        ];
      },
      'ownership format runs must not exceed two',
    ],
    [
      'adjacent mastery partners',
      (pack) => {
        const test = pack.tests[0];
        const first = test.exercises[0];
        const partner = test.exercises.find(
          (exercise) => exercise.id === first.parallelExerciseId,
        )!;
        test.exercises = [
          first,
          partner,
          ...test.exercises.filter((exercise) => exercise !== first && exercise !== partner),
        ];
      },
      'ownership mastery partners need two intervening questions',
    ],
    [
      'an unjustified two-format Focused test',
      (pack) => {
        for (const exercise of pack.tests[0].exercises)
          if (exercise.type !== 'multiple-choice') exercise.type = 'fill-blank';
      },
      'Focused ownership work needs suitable response variety',
    ],
  ];

  it.each(mutations)('rejects %s at source and runtime boundaries', (_label, mutate, message) => {
    const pack = structuredClone(packs[0]);
    mutate(pack);
    expect(validateOwnershipQuestionVariety(pack).join('\n')).toContain(message);
    expect(() => validateRuntimeVariety(pack)).toThrow(message);
    expect(() => validateTopicPack(pack)).toThrow();
  });

  it('does not impose ownership-specific sequencing on other topics', () => {
    const pack = structuredClone(packs[0]);
    pack.id = 'unrelated-topic';
    for (const exercise of pack.tests[0].exercises) exercise.type = 'translation-fi';
    expect(validateOwnershipQuestionVariety(pack)).toEqual([]);
    expect(() => validateRuntimeVariety(pack)).not.toThrow();
  });

  it('grades all 852 items, every accepted alternative and every wrong choice', () => {
    const items = packs.flatMap((pack) => [
      ...pack.tests.flatMap((test) => test.exercises),
      ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
    ]);
    expect(items).toHaveLength(852);
    for (const item of items) {
      for (const answer of item.acceptedAnswers)
        expect(gradeAnswer(item, answer).correct, `${item.id}: ${answer}`).toBe(true);
      for (const diagnostic of item.answerDiagnostics ?? []) {
        for (const answer of diagnostic.answers) {
          const result = gradeAnswer(item, answer);
          expect(result.correct, `${item.id}: ${answer}`).toBe(false);
          expect(result.diagnosticExplanation).toBe(diagnostic.explanation);
        }
      }
      for (const option of item.options ?? []) {
        if (item.acceptedAnswers.includes(option)) continue;
        const result = gradeAnswer(item, option);
        expect(result.correct, `${item.id}: ${option}`).toBe(false);
        expect(result.diagnosticExplanation).toBeTruthy();
        if (!item.answerDiagnostics?.length)
          expect(result.diagnosticExplanation).toBe(item.optionFeedback![option]);
      }
    }
  });

  it('grades only the missing part of short-reply gaps', () => {
    for (const pack of packs.slice(2, 4)) {
      const gaps = pack.tests
        .flatMap((test) => test.exercises)
        .filter((exercise) => exercise.type === 'fill-blank');
      expect(gaps).toHaveLength(8);
      for (const gap of gaps) {
        const affirmative = gap.acceptedAnswers[0] === 'on';
        expect(gradeAnswer(gap, affirmative ? 'On.' : 'Ei ole.').correct).toBe(true);
        expect(gradeAnswer(gap, affirmative ? 'Kyllä, on.' : 'Ei, ei ole.').correct).toBe(false);
        expect(gradeAnswer(gap, affirmative ? 'Olen.' : 'En ole.').correct).toBe(false);
        expect(gap.prompt).toContain(affirmative ? 'Kyllä, ___.' : 'Ei, ___.');
      }
    }
  });
});
