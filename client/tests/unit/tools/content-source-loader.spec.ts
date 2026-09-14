import { afterEach, describe, expect, it } from 'vitest';
import { loadContentSource } from '../../../tools/content-source-loader.mjs';
import {
  ContentSourceFixtureDefinition,
  createContentSourceFixture,
  TemporaryContentSourceFixture,
} from '@testing/helpers/unit/content-source-fixture.mjs';

const activeFixtures: TemporaryContentSourceFixture[] = [];

const catalog = (packs: string[]): unknown => ({ schemaVersion: 1, packs });

const manifest = (id: string, lessonIds: string[], testIds: string[]): unknown => ({
  schemaVersion: 1,
  id,
  version: '1.0.0',
  title: id,
  level: 'A1 grammar',
  summary: `${id} summary`,
  objectives: [],
  importantSkills: ['Rule'],
  sources: [],
  lessonIds,
  testIds,
  lessonSummaries: lessonIds.map((lessonId) => ({ id: lessonId, version: '1.0.0' })),
  testSummaries: testIds.map((testId) => ({
    id: testId,
    title: testId,
    stage: 'focused',
    lessonIds: [lessonIds[0]],
    exerciseIds: [testId.replace(/test$/u, 'exercise')],
  })),
});

const lesson = (id: string, practiceId: string): unknown => ({
  id,
  version: '1.0.0',
  practiceExercises: [{ id: practiceId }],
});

const learningTest = (id: string, exerciseId: string, lessonId: string): unknown => ({
  id,
  title: id,
  stage: 'focused',
  lessonIds: [lessonId],
  exercises: [{ id: exerciseId }],
});

function twoPackFixture(sharedLessonId = false): ContentSourceFixtureDefinition {
  const alphaLessonId = sharedLessonId ? 'shared-lesson' : 'alpha-lesson';
  const betaLessonId = sharedLessonId ? 'shared-lesson' : 'beta-lesson';
  return {
    files: {
      'index.json': catalog(['alpha-pack', 'beta-pack']),
      'alpha-pack/pack.json': manifest('alpha-pack', [alphaLessonId], ['alpha-test']),
      [`alpha-pack/lessons/${alphaLessonId}.json`]: lesson(alphaLessonId, 'alpha-practice'),
      'alpha-pack/tests/alpha-test.json': learningTest(
        'alpha-test',
        'alpha-exercise',
        alphaLessonId,
      ),
      'beta-pack/pack.json': manifest('beta-pack', [betaLessonId], ['beta-test']),
      [`beta-pack/lessons/${betaLessonId}.json`]: lesson(betaLessonId, 'beta-practice'),
      'beta-pack/tests/beta-test.json': learningTest('beta-test', 'beta-exercise', betaLessonId),
    },
  };
}

function singlePackFixture(
  packManifest: unknown,
  files: Record<string, unknown> = {},
): ContentSourceFixtureDefinition {
  return {
    directories: ['alpha-pack/lessons', 'alpha-pack/tests'],
    files: {
      'index.json': catalog(['alpha-pack']),
      'alpha-pack/pack.json': packManifest,
      ...files,
    },
  };
}

async function materialize(definition: ContentSourceFixtureDefinition): Promise<string> {
  const fixture = await createContentSourceFixture(definition);
  activeFixtures.push(fixture);
  return fixture.directory;
}

afterEach(async () => {
  for (const fixture of activeFixtures.splice(0).reverse()) await fixture.cleanup();
});

describe('pack-owned content source loader', () => {
  it('assembles multiple packs and their learning tests in explicit authored order', async () => {
    const source = await loadContentSource(await materialize(twoPackFixture()));

    expect(source.catalog.packs).toEqual(['alpha-pack', 'beta-pack']);
    expect(source.packs.map((pack) => pack['id'])).toEqual(['alpha-pack', 'beta-pack']);
    expect(source.packs[0]['lessons']).toEqual([
      {
        id: 'alpha-lesson',
        version: '1.0.0',
        practiceExercises: [{ id: 'alpha-practice' }],
      },
    ]);
    expect(source.packs[0]['tests']).toEqual([
      {
        id: 'alpha-test',
        title: 'alpha-test',
        stage: 'focused',
        lessonIds: ['alpha-lesson'],
        exercises: [{ id: 'alpha-exercise' }],
      },
    ]);
  });

  it('reassembles unchanged sources identically in memory', async () => {
    const first = await loadContentSource(await materialize(twoPackFixture()));
    const second = await loadContentSource(await materialize(twoPackFixture()));

    expect(second).toEqual(first);
  });

  it('rejects unsafe pack registrations before resolving folders', async () => {
    const fixture = await materialize({ files: { 'index.json': catalog(['../unsafe']) } });

    await expect(loadContentSource(fixture)).rejects.toThrow(
      'The source catalog pack list must contain unique safe IDs in authored order.',
    );
  });

  it('rejects a pack folder whose manifest has another identity', async () => {
    const fixture = await materialize(
      singlePackFixture(manifest('beta-pack', ['lesson'], ['test'])),
    );

    await expect(loadContentSource(fixture)).rejects.toThrow(
      'Pack folder alpha-pack must contain a matching schema-1 manifest.',
    );
  });

  it('rejects missing manifests and undeclared source folders', async () => {
    const missingManifest = await materialize({
      directories: ['alpha-pack/lessons', 'alpha-pack/tests'],
      files: { 'index.json': catalog(['alpha-pack']) },
    });
    await expect(loadContentSource(missingManifest)).rejects.toThrow(
      'Pack folder alpha-pack contains missing or undeclared entries.',
    );

    const undeclaredFolder = await materialize({
      directories: ['alpha-pack', 'rogue-pack'],
      files: { 'index.json': catalog(['alpha-pack']) },
    });
    await expect(loadContentSource(undeclaredFolder)).rejects.toThrow(
      'The content source root contains missing or undeclared entries.',
    );
  });

  it('rejects duplicate pack registrations and ordered references', async () => {
    const duplicatePack = await materialize({
      files: { 'index.json': catalog(['alpha-pack', 'alpha-pack']) },
    });
    await expect(loadContentSource(duplicatePack)).rejects.toThrow(
      'The source catalog pack list must contain unique safe IDs in authored order.',
    );

    const duplicateReference = await materialize(
      singlePackFixture(manifest('alpha-pack', ['lesson', 'lesson'], ['test'])),
    );
    await expect(loadContentSource(duplicateReference)).rejects.toThrow(
      'Pack alpha-pack lessonIds must contain unique safe IDs in authored order.',
    );
  });

  it('rejects missing or undeclared lesson and learning-test files', async () => {
    const fixture = await materialize(
      singlePackFixture(manifest('alpha-pack', ['missing-lesson'], ['missing-test']), {
        'alpha-pack/lessons/undeclared-lesson.json': { id: 'undeclared-lesson' },
        'alpha-pack/tests/undeclared-test.json': { id: 'undeclared-test' },
      }),
    );

    await expect(loadContentSource(fixture)).rejects.toThrow(
      'Lesson directory contains missing or undeclared entries.',
    );
  });

  it('rejects stable IDs duplicated across pack-owned content', async () => {
    await expect(loadContentSource(await materialize(twoPackFixture(true)))).rejects.toThrow(
      'Content ID shared-lesson is used by both alpha-pack lesson and beta-pack lesson.',
    );
  });

  it('rejects manifest summaries that drift from their source fragments', async () => {
    const packManifest = manifest('alpha-pack', ['alpha-lesson'], ['alpha-test']) as Record<
      string,
      unknown
    >;
    packManifest['testSummaries'] = [
      {
        id: 'alpha-test',
        title: 'Stale title',
        stage: 'focused',
        lessonIds: ['alpha-lesson'],
        exerciseIds: ['alpha-exercise'],
      },
    ];
    const fixture = await materialize(
      singlePackFixture(packManifest, {
        'alpha-pack/lessons/alpha-lesson.json': lesson('alpha-lesson', 'alpha-practice'),
        'alpha-pack/tests/alpha-test.json': learningTest(
          'alpha-test',
          'alpha-exercise',
          'alpha-lesson',
        ),
      }),
    );

    await expect(loadContentSource(fixture)).rejects.toThrow(
      'Pack alpha-pack manifest summaries do not match their source fragments.',
    );
  });

  it('assembles every installed source pack without topic-specific loading code', async () => {
    const source = await loadContentSource('content');
    expect(source.catalog.packs).toEqual([
      'vowel-harmony-location-endings',
      'kpt-singular-forms',
      't-plural-agreement',
      'personal-pronouns-affirmative-olla',
      'negative-olla-statements',
      'olla-questions-short-answers',
      'singular-demonstrative-pronouns',
      'plural-demonstrative-pronouns',
      'negative-demonstrative-statements',
      'demonstrative-questions',
      'inessive-demonstrative-forms',
    ]);
    expect(source.packs.slice(0, 3).map((pack) => pack['version'])).toEqual([
      '1.0.0',
      '1.0.0',
      '1.0.0',
    ]);
    expect(source.packs.slice(0, 3).map((pack) => (pack['lessons'] as unknown[]).length)).toEqual([
      4, 8, 6,
    ]);
    expect(source.packs.slice(0, 3).map((pack) => (pack['tests'] as unknown[]).length)).toEqual([
      6, 11, 8,
    ]);
  });
});
