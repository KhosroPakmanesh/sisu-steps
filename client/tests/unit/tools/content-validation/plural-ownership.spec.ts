import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validateTopicPack } from '@/features/learning/shared/content/validation/topic-pack.validator';
import { validatePossessiveOwnerGroups } from '@/features/learning/shared/content/validation/possessive-owner-groups.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePack } from '../../../../tools/content-validation/ownership/possessive-owner-groups.mjs';
import { validatePackContent } from '../../../../tools/content-validation/shared/pack-content.validator.mjs';

describe('merged ownership pack with retained owner-number groups', () => {
  let merged: TopicPack;
  let packs: TopicPack[];
  beforeAll(async () => {
    const source = await loadContentSource('content');
    merged = source.packs.find(
      (item) => item['id'] === 'possessive-pronouns-endings',
    ) as unknown as TopicPack;
    packs = ['ppe-', 'pop-'].map((prefix) => ({
      ...merged,
      lessons: merged.lessons.filter((lesson) => lesson.id.startsWith(prefix)),
      tests: merged.tests.filter((test) => test.id.startsWith(prefix)),
    }));
  });

  it('loads the merged pack through complete runtime and source boundaries', async () => {
    for (const pack of packs) {
      expect(validateTopicPack(merged).id).toBe(merged.id);
      expect(validatePack(merged)).toEqual([]);
      expect((await validatePackContent(merged)).errors).toEqual([]);
      expect(pack.tests.map((item) => item.stage)).toEqual([
        ...Array<string>(10).fill('focused'),
        'review',
      ]);
      for (const test of pack.tests.slice(0, 10)) {
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
        ...Array<number>(10).fill(20),
        32,
      ]);
      expect(pack.tests.reduce((sum, item) => sum + item.exercises.length, 0)).toBe(232);
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

  it('grades all 512 items, every natural answer and every authored diagnostic', () => {
    const items = packs.flatMap((pack) => [
      ...pack.tests.flatMap((test) => test.exercises),
      ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
    ]);
    expect(items).toHaveLength(512);
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
      const mutated = structuredClone(merged);
      const lesson = packs[pack].lessons[test];
      const id = `${lesson.id}-test-e${String(index + 1).padStart(3, '0')}`;
      mutated.tests
        .flatMap((item) => item.exercises)
        .find((exercise) => exercise.id === id)!.acceptedAnswers = [answer];
      expect(validatePack(mutated).join('\n')).toContain(message);
      expect(() => validatePossessiveOwnerGroups(mutated)).toThrow(message);
      expect(() => validateTopicPack(mutated)).toThrow();
    },
  );

  it.each([
    ['ppe-review', 'pop-owner-forms'],
    ['pop-review', 'ppe-owner-forms'],
  ])('rejects changed Review references in %s at both boundaries', (testId, foreignLessonId) => {
    const pack = structuredClone(merged);
    const review = pack.tests.find((test) => test.id === testId)!;
    review.lessonIds.push(foreignLessonId);
    const message = 'preserve the original owner-group Review lesson references';
    expect(validatePack(pack).join('\n')).toContain(message);
    expect(() => validatePossessiveOwnerGroups(pack)).toThrow(message);
    expect(() => validateTopicPack(pack)).toThrow(message);
  });

  it.each(['lessons', 'tests'] as const)(
    'rejects a reversed owner-number topic pair in %s at both boundaries',
    (field) => {
      const pack = structuredClone(merged);
      [pack[field][0], pack[field][1]] = [pack[field][1], pack[field][0]];
      const message = 'lessons and tests must follow paired singular/plural topics before Reviews';
      expect(validatePack(pack).join('\n')).toContain(message);
      expect(() => validatePossessiveOwnerGroups(pack)).toThrow(message);
      expect(() => validateTopicPack(pack)).toThrow(message);
    },
  );

  it('rejects opposite-owner teaching and contracted counts', () => {
    for (const [index, source] of packs.entries()) {
      const pack = structuredClone(merged);
      pack.lessons
        .find((lesson) => lesson.id === source.lessons[0].id)!
        .sections[0].paragraphs.push(index === 0 ? 'Teach meidän here.' : 'Teach minun here.');
      expect(validatePack(pack).join('\n')).toContain('owner-number boundary');
      expect(() => validatePossessiveOwnerGroups(pack)).toThrow('owner-number boundary');
      pack.tests.find((test) => test.id === source.tests[0].id)!.exercises.pop();
      expect(validatePack(pack).join('\n')).toContain('equal owner-group counts');
    }
  });

  it('accepts both question orders and optional owners while rejecting wrong number', () => {
    const question = packs[0].tests
      .flatMap((test) => test.exercises)
      .find((exercise) => exercise.id === 'ppe-whose-test-e005')!;
    const model = question.acceptedAnswers[0];
    for (const answer of question.acceptedAnswers)
      expect(gradeAnswer(question, answer).correct).toBe(true);
    expect(question.acceptedAnswers).toHaveLength(2);
    expect(gradeAnswer(question, model.replace('on?', 'ovat?')).correct).toBe(false);
    const statement = packs[1].tests
      .flatMap((test) => test.exercises)
      .find((exercise) => exercise.id === 'pop-pronoun-omission-test-e013')!;
    expect(statement.acceptedAnswers).toHaveLength(2);
    for (const answer of statement.acceptedAnswers)
      expect(gradeAnswer(statement, answer).correct).toBe(true);
  });
});
