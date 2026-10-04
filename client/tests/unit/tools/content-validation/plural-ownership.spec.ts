import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validatePluralOwnership } from '@/features/learning/shared/content/validation/plural-ownership.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePack } from '../../../../tools/content-validation/ownership/plural-ownership-possessive-endings.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('ownership split by owner number', () => {
  let packs: TopicPack[];
  beforeAll(async () => {
    const source = await loadContentSource('content');
    packs = ['possessive-pronouns-endings', 'plural-ownership-possessive-endings'].map(
      (id) => source.packs.find((item) => item['id'] === id) as unknown as TopicPack,
    );
  });

  it('loads both authored packs through complete runtime and source boundaries', async () => {
    for (const pack of packs) {
      expect(validateTopicPack(pack).id).toBe(pack.id);
      expect(validatePack(pack)).toEqual([]);
      expect((await validatePackContent(pack)).errors).toEqual([]);
      expect(pack.tests.map((item) => item.stage)).toEqual([
        ...Array<string>(8).fill('focused'),
        'review',
      ]);
      for (const test of pack.tests.slice(0, 8)) {
        expect(test.lessonIds).toHaveLength(1);
        expect(
          pack.lessons.find((lesson) => lesson.id === test.lessonIds[0])!.targetSkills,
        ).toEqual(test.targetSkills);
      }
    }
  });

  it('keeps equal totals and matching test counts without reducing singular peers', () => {
    for (const pack of packs) {
      expect(pack.tests.map((item) => item.exercises.length)).toEqual([
        ...Array<number>(8).fill(20),
        32,
      ]);
      expect(pack.tests.reduce((sum, item) => sum + item.exercises.length, 0)).toBe(192);
      expect(pack.lessons.reduce((sum, item) => sum + item.practiceExercises.length, 0)).toBe(24);
      expect(pack.tests.at(-1)!.exercises.length).toBeGreaterThanOrEqual(28);
    }
  });

  it('separates owner forms while covering both object numbers and shared third-person harmony', () => {
    for (const [index, pack] of packs.entries()) {
      const allowed = index === 0 ? ['minun', 'sinun', 'hänen'] : ['meidän', 'teidän', 'heidän'];
      const items = pack.tests.flatMap((test) => test.exercises);
      const owners = items.flatMap((item) =>
        item.tags
          .filter((tag) => tag.startsWith('owner-') && tag !== 'owner-reference')
          .map((tag) => tag.slice(6)),
      );
      expect([...new Set(owners)].sort()).toEqual([...allowed].sort());
      for (const owner of allowed) {
        expect(
          items.some(
            (item) =>
              item.tags.includes(`owner-${owner}`) && item.tags.includes('objects-singular'),
          ),
        ).toBe(true);
        expect(
          items.some(
            (item) => item.tags.includes(`owner-${owner}`) && item.tags.includes('objects-plural'),
          ),
        ).toBe(true);
      }
      expect(
        pack.tests[3].exercises.some((item) => item.acceptedAnswers[0].includes('pelinsä')),
      ).toBe(true);
      expect(
        pack.tests[3].exercises.some((item) => item.acceptedAnswers[0].includes('autonsa')),
      ).toBe(true);
      expect(pack.tests[6].exercises).toHaveLength(packs[1 - index].tests[6].exercises.length);
    }
  });

  it('grades all 432 items, every natural answer and every authored diagnostic', () => {
    const items = packs.flatMap((pack) => [
      ...pack.tests.flatMap((test) => test.exercises),
      ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
    ]);
    expect(items).toHaveLength(432);
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
    }
  });

  it('keeps same-format mutual mastery partners with different answers', () => {
    for (const pack of packs) {
      const items = pack.tests.flatMap((test) => test.exercises);
      const byId = new Map(items.map((item) => [item.id, item]));
      for (const item of items) {
        const partner = byId.get(item.parallelExerciseId!)!;
        expect(partner.parallelExerciseId).toBe(item.id);
        expect(partner.targetSkill).toBe(item.targetSkill);
        expect(partner.type).toBe(item.type);
        expect(partner.acceptedAnswers[0]).not.toBe(item.acceptedAnswers[0]);
      }
    }
  });

  it.each([
    [0, 0, 0, 'meidän', 'owner form'],
    [1, 0, 0, 'minun', 'owner form'],
    [0, 5, 0, 'autotni', 'drop plural -t'],
    [1, 5, 0, 'autotmme', 'drop plural -t'],
    [0, 3, 1, 'kynänsa', 'vowel harmony'],
    [1, 3, 1, 'kynänsa', 'vowel harmony'],
    [0, 4, 6, 'Tämä ovat minun palloni.', 'noun-number agreement'],
    [1, 5, 12, 'kynämme', 'complete ownership'],
    [0, 6, 16, 'Tämä on kissansa.', 'retain the third-person'],
    [1, 6, 16, 'Tämä on kissansa.', 'retain the third-person'],
    [0, 6, 16, 'kissansa', 'complete ownership'],
    [1, 6, 16, 'kissansa', 'complete ownership'],
    [0, 7, 2, 'Kenen autonsa nämä ovat?', 'unsuffixed plural noun'],
    [1, 7, 0, 'Kenen kirja tämä ovat?', 'matching agreement'],
  ] as const)(
    'rejects incorrect owner grammar %s/%s/%s at both boundaries',
    (pack, test, index, answer, message) => {
      const mutated = structuredClone(packs[pack]);
      const id = `${mutated.tests[test].id}-e${String(index + 1).padStart(3, '0')}`;
      mutated.tests[test].exercises.find((exercise) => exercise.id === id)!.acceptedAnswers = [
        answer,
      ];
      expect(validatePack(mutated).join('\n')).toContain(message);
      expect(() => validatePluralOwnership(mutated)).toThrow(message);
      expect(() => validateTopicPack(mutated)).toThrow();
    },
  );

  it('rejects opposite-owner teaching and contracted counts', () => {
    for (const [index, source] of packs.entries()) {
      const pack = structuredClone(source);
      pack.lessons[0].sections[0].paragraphs.push(
        index === 0 ? 'Teach meidän here.' : 'Teach minun here.',
      );
      expect(validatePack(pack).join('\n')).toContain('owner-number boundary');
      expect(() => validatePluralOwnership(pack)).toThrow('owner-number boundary');
      pack.tests[0].exercises.pop();
      expect(validatePack(pack).join('\n')).toContain('equal owner-pack counts');
    }
  });

  it('accepts both question orders and optional owners while rejecting wrong number', () => {
    const question = packs[0].tests[7].exercises.find(
      (exercise) => exercise.id === 'ppe-whose-test-e005',
    )!;
    const model = question.acceptedAnswers[0];
    for (const answer of question.acceptedAnswers)
      expect(gradeAnswer(question, answer).correct).toBe(true);
    expect(question.acceptedAnswers).toHaveLength(2);
    expect(gradeAnswer(question, model.replace('on?', 'ovat?')).correct).toBe(false);
    const statement = packs[1].tests[6].exercises.find(
      (exercise) => exercise.id === 'pop-pronoun-omission-test-e013',
    )!;
    expect(statement.acceptedAnswers).toHaveLength(2);
    for (const answer of statement.acceptedAnswers)
      expect(gradeAnswer(statement, answer).correct).toBe(true);
  });
});
