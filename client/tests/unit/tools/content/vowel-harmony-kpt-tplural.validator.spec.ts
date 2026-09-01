import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePack } from '../../../../tools/content-validation/vowel-harmony-kpt-tplural.mjs';

describe('vowel-harmony-kpt-tplural content validation', () => {
  let installedPack: TopicPack;

  beforeAll(async () => {
    const source = await loadContentSource('content');
    installedPack = source.packs[0] as unknown as TopicPack;
  });

  it('accepts the installed pack-specific pedagogy constraints', () => {
    expect(validatePack(installedPack)).toEqual([]);
  });

  it('rejects missing KPT-specific teaching depth', () => {
    const pack = structuredClone(installedPack);
    const lesson = pack.lessons.find((candidate) => candidate.id === 'kpt-doubles');
    if (!lesson) throw new Error('The installed fixture is missing kpt-doubles.');
    lesson.examples = lesson.examples.slice(0, 1);
    lesson.practiceExercises = lesson.practiceExercises.slice(0, 3);

    expect(validatePack(pack)).toEqual(
      expect.arrayContaining([
        'kpt-doubles: needs at least two worked contrasts',
        'kpt-doubles: difficult KPT lesson needs at least four practice exercises',
      ]),
    );
  });

  it('rejects restoring a second review or dropping the single review', () => {
    const pack = structuredClone(installedPack);
    const review = pack.tests.at(-1)!;
    pack.tests.push({ ...review, id: 'guided-review' });
    expect(validatePack(pack)).toContain(
      'foundations-review: must be the single review after all focused tests',
    );
    pack.tests = pack.tests.filter((test) => test.stage !== 'review');
    expect(validatePack(pack)).toContain(
      'foundations-review: must be the single review after all focused tests',
    );
  });

  it('rejects uneven coverage, including silently losing special-k questions', () => {
    const pack = structuredClone(installedPack);
    const review = pack.tests.at(-1)!;
    for (const exercise of review.exercises) {
      if (exercise.targetSkill === 'KPT special k changes')
        exercise.targetSkill = 'KPT recognition';
    }
    expect(validatePack(pack)).toEqual(
      expect.arrayContaining([
        'foundations-review: KPT special k changes needs two or three primary-skill questions',
        'foundations-review: KPT recognition needs two or three primary-skill questions',
      ]),
    );
  });

  it('rejects duplicate tasks even when IDs and ancillary hints differ', () => {
    const pack = structuredClone(installedPack);
    const review = pack.tests.at(-1)!;
    const first = review.exercises[1];
    const second = review.exercises.find((exercise) => exercise.parallelExerciseId === first.id)!;
    second.prompt = `${first.prompt.split('·')[0]} · another hint`;
    second.acceptedAnswers = [...first.acceptedAnswers];
    expect(validatePack(pack)).toContain(`${second.id}: duplicate review question and answer`);
  });

  it('rejects duplicated preparation and unrelated skill declarations', () => {
    const pack = structuredClone(installedPack);
    const review = pack.tests.at(-1)!;
    review.lessonIds[0] = review.lessonIds[1];
    review.exercises[0].requiredSkills = [...pack.importantSkills];
    expect(validatePack(pack)).toEqual(
      expect.arrayContaining([
        'foundations-review: preparation must reference every lesson exactly once',
        `${review.exercises[0].id}: list the skills used by this question, not the whole pack`,
      ]),
    );
  });

  it('rejects KPT questions that hide the supporting ending or reveal the assessed change', () => {
    const pack = structuredClone(installedPack);
    const exercise = pack.tests.at(-1)!.exercises[1];
    exercise.prompt = exercise.prompt.split('·')[0];
    expect(validatePack(pack)).toContain(
      `${exercise.id}: KPT-only review production must supply the ending and any verb stem`,
    );
    exercise.prompt += ' · use the supplied genitive ending -n; apply tt → t';
    expect(validatePack(pack)).toContain(
      `${exercise.id}: retrieve the KPT change without giving it away in the prompt`,
    );
  });
});
