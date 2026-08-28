import { afterEach, describe, expect, it } from 'vitest';
import { loadContentSource } from '../../../../tools/content-source-loader.mjs';
import {
  ContentSourceFixtureDefinition,
  createContentSourceFixture,
  TemporaryContentSourceFixture,
} from './content-source-fixture.mjs';

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
});

const lesson = (id: string, practiceId: string): unknown => ({
  id,
  practiceExercises: [{ id: practiceId }],
});

const learningTest = (id: string, exerciseId: string): unknown => ({
  id,
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
      'alpha-pack/tests/alpha-test.json': learningTest('alpha-test', 'alpha-exercise'),
      'beta-pack/pack.json': manifest('beta-pack', [betaLessonId], ['beta-test']),
      [`beta-pack/lessons/${betaLessonId}.json`]: lesson(betaLessonId, 'beta-practice'),
      'beta-pack/tests/beta-test.json': learningTest('beta-test', 'beta-exercise'),
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
      { id: 'alpha-lesson', practiceExercises: [{ id: 'alpha-practice' }] },
    ]);
    expect(source.packs[0]['tests']).toEqual([
      { id: 'alpha-test', exercises: [{ id: 'alpha-exercise' }] },
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

  it('assembles the installed source pack without topic-specific loading code', async () => {
    const source = await loadContentSource('content');
    const pack = source.packs[0];

    expect(pack['id']).toBe('vowel-harmony-kpt-tplural');
    expect(pack['version']).toBe('5.1.0');
    expect((pack['lessons'] as unknown[]).length).toBe(13);
    expect((pack['tests'] as unknown[]).length).toBe(15);
  });
});
