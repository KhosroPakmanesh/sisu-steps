import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/topic-pack.models';
import { validatePossessiveOwnerGroups } from '@/features/learning/shared/content/validation/possessive-owner-groups.validator';
import { gradeAnswer } from '@/features/learning/shared/progress/grading.policy';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePack } from '../../../../tools/content-validation/ownership/possessive-owner-groups.mjs';
import { validateOwnershipPack } from '../../../../tools/content-validation/ownership/ownership-pack-family.mjs';

describe('whose-question word and noun blanks', () => {
  let pack: TopicPack;

  beforeAll(async () => {
    const source = await loadContentSource('content');
    pack = source.packs.find(
      (item) => item['id'] === 'possessive-pronouns-endings',
    ) as unknown as TopicPack;
  });

  it('accepts all eight prefixes and rejects copying only the supplied noun', () => {
    expect(validatePack(pack)).toEqual([]);
    expect(validateOwnershipPack(pack)).toEqual([]);
    expect(() => validatePossessiveOwnerGroups(pack)).not.toThrow();
    const blanks = pack.tests
      .flatMap((test) => test.exercises)
      .filter((exercise) => exercise.instruction === 'Write the question word and noun.');
    expect(blanks).toHaveLength(8);
    for (const exercise of blanks) {
      const answer = exercise.acceptedAnswers[0];
      expect(gradeAnswer(exercise, answer).correct).toBe(true);
      expect(gradeAnswer(exercise, answer.split(' ').slice(1).join(' ')).correct).toBe(false);
    }
  });

  it.each([
    ['ppe-whose-singular-test-e107', 'kissa'],
    ['ppe-whose-singular-test-e107', 'Kuka kissa'],
    ['ppe-whose-singular-test-e107', 'Kenen kissani'],
    ['ppe-whose-singular-test-e107', 'Kenen kissat'],
    ['ppe-whose-plural-test-e105', 'Kenen omena'],
  ])('rejects invalid prefix %s: %s at both boundaries', (id, answer) => {
    const changed = structuredClone(pack);
    const exercise = changed.tests
      .flatMap((test) => test.exercises)
      .find((item) => item.id === id)!;
    exercise.acceptedAnswers = [answer];
    expect(validatePack(changed).join('\n')).toContain('the two-word blank needs kenen');
    expect(validateOwnershipPack(changed).join('\n')).toContain('Whose questions must keep');
    expect(() => validatePossessiveOwnerGroups(changed)).toThrow('the two-word blank needs kenen');
  });

  it('rejects a prefix paired with the wrong supplied number frame at both boundaries', () => {
    const changed = structuredClone(pack);
    const exercise = changed.tests
      .flatMap((test) => test.exercises)
      .find((item) => item.id === 'ppe-whose-plural-test-e105')!;
    exercise.prompt = exercise.prompt.replace('___ nämä ovat?', '___ tämä on?');
    expect(validatePack(changed).join('\n')).toContain('supplied matching frame');
    expect(validateOwnershipPack(changed).join('\n')).toContain('Whose questions must keep');
    expect(() => validatePossessiveOwnerGroups(changed)).toThrow('supplied matching frame');
  });
});
