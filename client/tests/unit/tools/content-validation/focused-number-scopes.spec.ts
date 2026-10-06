import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validateFocusedNumberScopes as validateRuntime } from '@/features/learning/shared/content/validation/focused-number-scopes.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validateFocusedNumberScopes as validateSource } from '../../../../tools/content-validation/shared/focused-number-scopes.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('Focused tests separated by grammatical number', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    packs = (await loadContentSource('content')).packs as unknown as TopicPack[];
  });

  it('keeps the full inventory and 44 groups sharing 22 unchanged preparation lessons', async () => {
    expect(packs).toHaveLength(14);
    expect(packs.flatMap((pack) => pack.lessons)).toHaveLength(81);
    expect(packs.flatMap((pack) => pack.tests)).toHaveLength(125);
    expect(packs.flatMap((pack) => pack.tests.flatMap((test) => test.exercises))).toHaveLength(
      2386,
    );
    expect(
      packs.flatMap((pack) => pack.lessons.flatMap((lesson) => lesson.practiceExercises)),
    ).toHaveLength(290);
    const groups = packs.flatMap((pack) => pack.tests.filter((test) => test.numberScope));
    expect(groups).toHaveLength(44);
    expect(new Set(groups.flatMap((test) => test.lessonIds)).size).toBe(22);
    expect(new Set(groups.flatMap((test) => test.exercises.map((item) => item.id))).size).toBe(508);
    for (const pack of packs) {
      expect(validateSource(pack)).toEqual([]);
      expect(() => validateRuntime(pack)).not.toThrow();
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect((await validatePackContent(pack)).errors).toEqual([]);
      for (const test of pack.tests.filter((item) => item.numberScope?.number === 'singular')) {
        const plural = pack.tests.find((item) => item.id === test.lessonIds[0] + '-plural-test')!;
        expect(plural.lessonIds).toEqual(test.lessonIds);
        expect(plural.targetSkills).toEqual(test.targetSkills);
        expect(plural.prerequisiteSkills).toEqual(test.prerequisiteSkills);
        const lesson = pack.lessons.find((item) => item.id === test.lessonIds[0])!;
        expect(lesson.targetSkills).toEqual(test.targetSkills);
        expect(lesson.practiceExercises.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('grades all 508 repartitioned questions, alternatives, and authored diagnostics', () => {
    const items = packs.flatMap((pack) =>
      pack.tests.filter((test) => test.numberScope).flatMap((test) => test.exercises),
    );
    expect(items).toHaveLength(508);
    for (const item of items) {
      for (const answer of item.acceptedAnswers)
        expect(gradeAnswer(item, answer).correct, item.id).toBe(true);
      for (const diagnostic of item.answerDiagnostics ?? [])
        for (const answer of diagnostic.answers) {
          const result = gradeAnswer(item, answer);
          expect(result.correct, item.id).toBe(false);
          expect(result.diagnosticExplanation, item.id).toBe(diagnostic.explanation);
        }
      const partner = packs
        .flatMap((pack) => pack.tests.flatMap((test) => test.exercises))
        .find((candidate) => candidate.id === item.parallelExerciseId)!;
      expect(partner.parallelExerciseId).toBe(item.id);
      expect(partner.type).toBe(item.type);
      expect(partner.targetSkill).toBe(item.targetSkill);
    }
  });

  it.each(['person', 'owner', 'object'] as const)(
    'rejects opposite-number questions for the %s axis at both complete boundaries',
    async (axis) => {
      const original = packs.find((pack) =>
        pack.tests.some((test) => test.numberScope?.axis === axis),
      )!;
      for (const number of ['singular', 'plural'] as const) {
        const pack = structuredClone(original);
        const target = pack.tests.find(
          (test) => test.numberScope?.axis === axis && test.numberScope.number === number,
        )!;
        const peer = pack.tests.find(
          (test) =>
            test.lessonIds[0] === target.lessonIds[0] && test.numberScope?.number !== number,
        )!;
        [target.exercises[0], peer.exercises[0]] = [peer.exercises[0], target.exercises[0]];
        expect(validateSource(pack).join('\n')).toContain('question must stay in its declared');
        expect(() => validateRuntime(pack)).toThrow('question must stay in its declared');
        expect((await validatePackContent(pack)).errors.join('\n')).toContain(
          'question must stay in its declared',
        );
        expect(() => validateTopicPack(pack)).toThrow();
      }
    },
  );

  it.each(['missing scope', 'wrong axis', 'extra scope field', 'missing plural', 'Review scope'])(
    'rejects %s at both boundaries',
    async (mutation) => {
      const pack = structuredClone(packs.find((item) => item.id === 'affirmative-possession')!);
      const focused = pack.tests[0];
      if (mutation === 'missing scope') delete focused.numberScope;
      if (mutation === 'wrong axis') focused.numberScope!.axis = 'object';
      if (mutation === 'extra scope field') Object.assign(focused.numberScope!, { extra: true });
      if (mutation === 'missing plural') pack.tests.splice(1, 1);
      if (mutation === 'Review scope') pack.tests.at(-1)!.numberScope = focused.numberScope;
      expect(validateSource(pack).length).toBeGreaterThan(0);
      expect(() => validateRuntime(pack)).toThrow();
      expect((await validatePackContent(pack)).errors.length).toBeGreaterThan(0);
      expect(() => validateTopicPack(pack)).toThrow();
    },
  );

  it('places polite te with plural grammatical forms and retains cross-number mastery partners', () => {
    const pack = packs.find((item) => item.id === 'personal-pronouns-affirmative-olla')!;
    const reference = pack.tests.filter((test) => test.lessonIds[0] === 'ppo-written-reference');
    expect(reference.map((test) => test.exercises.length)).toEqual([8, 16]);
    const polite = reference
      .flatMap((test) => test.exercises)
      .filter((item) => item.tags.includes('te-polite'));
    expect(polite.length).toBeGreaterThan(0);
    for (const item of polite) expect(reference[1].exercises).toContain(item);
    const allTests = packs.flatMap((item) => item.tests);
    expect(
      allTests.some(
        (test) =>
          test.numberScope &&
          test.exercises.some((item) =>
            allTests.some(
              (peer) =>
                peer.lessonIds[0] === test.lessonIds[0] &&
                peer.numberScope?.number !== test.numberScope?.number &&
                peer.exercises.some((candidate) => candidate.id === item.parallelExerciseId),
            ),
          ),
      ),
    ).toBe(true);
  });
});
