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
});
