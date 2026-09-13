import { beforeAll, describe, expect, it } from 'vitest';
import { TopicPack } from '@/features/learning/shared/content/content.models';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import { validatePack as validateHarmony } from '../../../../tools/content-validation/vowel-harmony-location-endings.mjs';
import { validatePack as validateKpt } from '../../../../tools/content-validation/kpt-singular-forms.mjs';
import { validatePack as validatePlural } from '../../../../tools/content-validation/t-plural-agreement.mjs';

describe('grammar-foundation successor pack validation', () => {
  let harmony: TopicPack;
  let kpt: TopicPack;
  let plural: TopicPack;

  beforeAll(async () => {
    const source = await loadContentSource('content');
    harmony = requirePack(source.packs as unknown as TopicPack[], 'vowel-harmony-location-endings');
    kpt = requirePack(source.packs as unknown as TopicPack[], 'kpt-singular-forms');
    plural = requirePack(source.packs as unknown as TopicPack[], 't-plural-agreement');
  });

  it('accepts all three installed packs and preserves every legacy exercise id once', () => {
    expect(validateHarmony(harmony)).toEqual([]);
    expect(validateKpt(kpt)).toEqual([]);
    expect(validatePlural(plural)).toEqual([]);

    const legacyIds = [harmony, kpt, plural]
      .flatMap((pack) => [
        ...pack.tests.flatMap((test) => test.exercises),
        ...pack.lessons.flatMap((lesson) => lesson.practiceExercises),
      ])
      .map((exercise) => exercise.id)
      .filter((id) => id.startsWith('ff-a1-'));
    expect(legacyIds).toHaveLength(246);
    expect(new Set(legacyIds).size).toBe(246);
  });

  it('rejects a duplicate scored task even when its id differs', () => {
    const pack = structuredClone(harmony);
    const first = pack.tests[0].exercises[0];
    const second = pack.tests[0].exercises[1];
    second.type = first.type;
    second.prompt = first.prompt;
    second.acceptedAnswers = [...first.acceptedAnswers];

    expect(validateHarmony(pack)).toContain(`${second.id}: duplicates the scored task ${first.id}`);
  });

  it('rejects a changed curriculum topology or count', () => {
    const pack = structuredClone(kpt);
    pack.tests[0].exercises.pop();
    expect(validateKpt(pack)).toEqual(
      expect.arrayContaining([
        'kpt-singular-forms: test counts must remain 20, 20, 20, 20, 20, 20, 21, 21, 32, 32, 34',
        'kpt-singular-forms: pack needs exactly 260 scored exercises',
      ]),
    );
  });

  it('rejects spoken Finnish inside learner-facing content', () => {
    const pack = structuredClone(plural);
    pack.tests[0].exercises[0].prompt = 'Mä olen täällä.';
    expect(validatePlural(pack)).toEqual([
      expect.stringContaining('learner-facing content contains excluded spoken form'),
    ]);
  });

  it('keeps the corrected optional-practice labels and singular-subject explanations', () => {
    const pluralSentences = requireLesson(plural, 'plural-sentences');
    const correctedPrompts = ['ff-a1-l-sent-p01', 'ff-a1-l-sent-p02', 'ff-a1-l-sent-p03'].map(
      (id) => requirePractice(pluralSentences, id).prompt,
    );
    expect(correctedPrompts).toEqual(
      correctedPrompts.map((prompt) =>
        prompt.replace(/^(?:Optional practice:\s*)+/u, 'Optional practice: '),
      ),
    );

    const locationSentences = requireLesson(harmony, 'inessive-location-sentences');
    for (const id of [
      'vhx-location-practice-p01',
      'vhx-location-practice-p02',
      'vhx-location-practice-p03',
      'vhx-location-practice-p04',
    ]) {
      expect(requirePractice(locationSentences, id).explanation).toContain('singular subject');
      expect(requirePractice(locationSentences, id).explanation).not.toContain(
        'subject is plural or supplied',
      );
    }
  });
});

function requirePack(packs: TopicPack[], id: string): TopicPack {
  const pack = packs.find((candidate) => candidate.id === id);
  if (!pack) throw new Error(`Missing installed pack ${id}.`);
  return pack;
}

function requireLesson(pack: TopicPack, id: string): TopicPack['lessons'][number] {
  const lesson = pack.lessons.find((candidate) => candidate.id === id);
  if (!lesson) throw new Error(`Missing lesson ${id}.`);
  return lesson;
}

function requirePractice(
  lesson: TopicPack['lessons'][number],
  id: string,
): TopicPack['lessons'][number]['practiceExercises'][number] {
  const exercise = lesson.practiceExercises.find((candidate) => candidate.id === id);
  if (!exercise) throw new Error(`Missing practice exercise ${id}.`);
  return exercise;
}
