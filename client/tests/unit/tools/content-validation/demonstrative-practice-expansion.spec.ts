import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateDemonstrativePractice as validateRuntime } from '@/features/learning/shared/content/validation/demonstrative-practice-expansion.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateDemonstrativePractice as validateSource } from '../../../../tools/content-validation/demonstratives/demonstrative-practice-expansion.mjs';

const IDS = [
  'sdp-independent-use-test',
  'pdp-independent-use-test',
  'sdp-se-han-test',
  'pdp-ne-he-test',
];

describe('existing-format demonstrative expansion', () => {
  let pack: TopicPack;
  beforeAll(async () => {
    pack = (await loadContentSource('content')).packs.find(
      (item) => item['id'] === 'demonstrative-pronouns',
    ) as unknown as TopicPack;
  });

  it('loads balanced tests and grades every new alternative and diagnostic', () => {
    expect(validateSource(pack)).toEqual([]);
    expect(() => validateRuntime(pack)).not.toThrow();
    expect(validateTopicPack(pack).version).toBe('1.2.0');
    const added = pack.tests
      .flatMap((test) => test.exercises)
      .filter(
        (exercise) =>
          /-e0(?:17|18|19|20)$/u.test(exercise.id) &&
          IDS.some((id) => exercise.id.startsWith(id + '-')),
      );
    expect(added).toHaveLength(16);
    for (const exercise of added) {
      for (const answer of exercise.acceptedAnswers)
        expect(gradeAnswer(exercise, answer).correct, exercise.id + ': ' + answer).toBe(true);
      for (const diagnostic of exercise.answerDiagnostics ?? [])
        for (const answer of diagnostic.answers) {
          const grade = gradeAnswer(exercise, answer);
          expect(grade.correct, exercise.id + ': ' + answer).toBe(false);
          expect(grade.diagnosticExplanation).toBe(diagnostic.explanation);
        }
      for (const option of exercise.options?.filter(
        (option) => !exercise.acceptedAnswers.includes(option),
      ) ?? []) {
        expect(gradeAnswer(exercise, option).correct).toBe(false);
        expect(exercise.optionFeedback?.[option]).toBeTruthy();
      }
    }
  });

  it.each(['count', 'format', 'version'] as const)(
    'rejects changed %s at source and runtime',
    (kind) => {
      const changed = structuredClone(pack);
      if (kind === 'count') changed.tests.find((test) => test.id === IDS[0])!.exercises.pop();
      if (kind === 'format')
        changed.tests.find((test) => test.id === IDS[0])!.exercises[0].type = 'fill-blank';
      if (kind === 'version') changed.version = '1.0.0';
      const message =
        kind === 'version'
          ? 'expanded practice requires version 1.2.0'
          : 'keep 20 questions and four of each existing format';
      expect(validateSource(changed).join('\n')).toContain(message);
      expect(() => validateRuntime(changed)).toThrow(message);
    },
  );

  it('rejects an optional typed task copied under a new scored ID', () => {
    const changed = structuredClone(pack);
    const test = changed.tests.find((test) => test.id === IDS[0])!;
    const index = test.exercises.findIndex((exercise) => exercise.id.endsWith('-e019'));
    const old = test.exercises[index];
    const practice = changed.lessons
      .find((lesson) => lesson.id === 'sdp-independent-use')!
      .practiceExercises.find((exercise) => exercise.type === 'fill-blank')!;
    test.exercises[index] = {
      ...structuredClone(practice),
      id: old.id,
      targetSkill: old.targetSkill,
      parallelExerciseId: old.parallelExerciseId,
    };
    expect(validateSource(changed).join('\n')).toContain('duplicates the response task');
    expect(() => validateRuntime(changed)).toThrow('duplicates the response task');
  });

  it('treats full-sentence gaps and Finnish translation as the same production demand', () => {
    const changed = structuredClone(pack);
    const test = changed.tests.find((test) => test.id === IDS[0])!;
    const original = test.exercises.find((exercise) => exercise.id.endsWith('-e001'))!;
    const added = test.exercises.find((exercise) => exercise.id.endsWith('-e019'))!;
    added.acceptedAnswers = [...original.acceptedAnswers];
    added.sentenceExplanation = structuredClone(original.sentenceExplanation);
    expect(validateSource(changed).join('\n')).toContain('duplicates the response task');
    expect(() => validateRuntime(changed)).toThrow('duplicates the response task');
  });

  it('rejects a repeated task even when the target skill changes', () => {
    const changed = structuredClone(pack);
    const source = changed.tests
      .find((test) => test.id === 'pdp-ne-he-test')!
      .exercises.find(
        (exercise) =>
          exercise.type === 'multiple-choice' && exercise.acceptedAnswers[0] === 'Ne ovat kotona.',
      )!;
    const added = changed.tests
      .find((test) => test.id === IDS[1])!
      .exercises.find((exercise) => exercise.id.endsWith('-e018'))!;
    expect(source.targetSkill).not.toBe(added.targetSkill);
    added.acceptedAnswers = [...source.acceptedAnswers];
    added.sentenceExplanation = structuredClone(source.sentenceExplanation);
    expect(validateSource(changed).join('\n')).toContain('duplicates the response task');
    expect(() => validateRuntime(changed)).toThrow('duplicates the response task');
  });

  it('rejects adjacent new mastery partners without changing counts', () => {
    const changed = structuredClone(pack);
    const test = changed.tests.find((test) => test.id === IDS[0])!;
    const first = test.exercises.findIndex((exercise) => exercise.id.endsWith('-e017'));
    const partner = test.exercises.splice(
      test.exercises.findIndex((exercise) => exercise.id.endsWith('-e018')),
      1,
    )[0];
    test.exercises.splice(first + 1, 0, partner);
    expect(validateSource(changed).join('\n')).toContain('space the new mastery partner');
    expect(() => validateRuntime(changed)).toThrow('space the new mastery partner');
  });
});
