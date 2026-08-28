import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const SAFE_ID = /^[a-z0-9][a-z0-9-]*$/u;
const PACK_MANIFEST_KEYS = new Set([
  'schemaVersion',
  'id',
  'version',
  'title',
  'level',
  'summary',
  'objectives',
  'importantSkills',
  'sources',
  'lessonIds',
  'testIds',
]);

const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const displayPath = (path) => path.replaceAll('\\', '/');

async function readJson(path, description) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'could not be read';
    throw new Error(`${description} at ${displayPath(path)} is invalid: ${detail}`);
  }
}

function requireSafeIds(values, description) {
  if (
    !Array.isArray(values) ||
    values.length === 0 ||
    values.some((value) => typeof value !== 'string' || !SAFE_ID.test(value)) ||
    new Set(values).size !== values.length
  ) {
    throw new Error(`${description} must contain unique safe IDs in authored order.`);
  }
  return values;
}

function requireExactKeys(value, keys, description) {
  const actual = Object.keys(value);
  if (actual.length !== keys.size || actual.some((key) => !keys.has(key))) {
    throw new Error(`${description} contains missing or unsupported fields.`);
  }
}

async function requireDirectoryShape(directory, expectedFiles, expectedDirectories, description) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'could not be read';
    throw new Error(`${description} at ${displayPath(directory)} is invalid: ${detail}`);
  }
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
  const directories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const unsupported = entries.filter((entry) => !entry.isFile() && !entry.isDirectory());
  const sameMembers = (actual, expected) =>
    actual.length === expected.length && actual.every((item) => expected.includes(item));
  if (
    unsupported.length > 0 ||
    !sameMembers(files, expectedFiles) ||
    !sameMembers(directories, expectedDirectories)
  ) {
    throw new Error(`${description} contains missing or undeclared entries.`);
  }
}

async function loadOwnedCollection(packDirectory, collectionName, ids, kind) {
  const directory = join(packDirectory, collectionName);
  const filenames = ids.map((id) => `${id}.json`);
  await requireDirectoryShape(directory, filenames, [], `${kind} directory`);
  return Promise.all(
    ids.map(async (id) => {
      const item = await readJson(join(directory, `${id}.json`), `${kind} ${id}`);
      if (!isRecord(item) || item.id !== id) {
        throw new Error(`${kind} file ${id}.json must contain the matching stable ID.`);
      }
      return item;
    }),
  );
}

function validateGlobalContentIds(packs) {
  const owners = new Map();
  const record = (id, owner) => {
    if (typeof id !== 'string' || !id.trim()) throw new Error(`${owner} has no stable ID.`);
    const previous = owners.get(id);
    if (previous) throw new Error(`Content ID ${id} is used by both ${previous} and ${owner}.`);
    owners.set(id, owner);
  };
  for (const pack of packs) {
    for (const lesson of pack.lessons) {
      record(lesson.id, `${pack.id} lesson`);
      for (const exercise of lesson.practiceExercises ?? []) {
        record(exercise.id, `${pack.id} practice exercise`);
      }
    }
    for (const test of pack.tests) {
      record(test.id, `${pack.id} learning test`);
      for (const exercise of test.exercises ?? []) {
        record(exercise.id, `${pack.id} scored exercise`);
      }
    }
  }
}

export async function loadContentSource(sourceDirectory) {
  const sourceRoot = resolve(sourceDirectory);
  const catalog = await readJson(join(sourceRoot, 'index.json'), 'source catalog');
  if (!isRecord(catalog)) throw new Error('The source catalog must be a JSON object.');
  requireExactKeys(catalog, new Set(['schemaVersion', 'packs']), 'The source catalog');
  if (catalog.schemaVersion !== 1) throw new Error('The source catalog must use schema 1.');
  const packIds = requireSafeIds(catalog.packs, 'The source catalog pack list');
  await requireDirectoryShape(sourceRoot, ['index.json'], packIds, 'The content source root');

  const packs = [];
  for (const packId of packIds) {
    const packDirectory = join(sourceRoot, packId);
    await requireDirectoryShape(
      packDirectory,
      ['pack.json'],
      ['lessons', 'tests'],
      `Pack folder ${packId}`,
    );
    const manifest = await readJson(join(packDirectory, 'pack.json'), `pack manifest ${packId}`);
    if (!isRecord(manifest)) throw new Error(`Pack manifest ${packId} must be a JSON object.`);
    requireExactKeys(manifest, PACK_MANIFEST_KEYS, `Pack manifest ${packId}`);
    if (manifest.schemaVersion !== 1 || manifest.id !== packId) {
      throw new Error(`Pack folder ${packId} must contain a matching schema-1 manifest.`);
    }
    const lessonIds = requireSafeIds(manifest.lessonIds, `Pack ${packId} lessonIds`);
    const testIds = requireSafeIds(manifest.testIds, `Pack ${packId} testIds`);
    const lessons = await loadOwnedCollection(packDirectory, 'lessons', lessonIds, 'Lesson');
    const tests = await loadOwnedCollection(packDirectory, 'tests', testIds, 'Learning test');
    const metadata = { ...manifest };
    delete metadata.lessonIds;
    delete metadata.testIds;
    packs.push({ ...metadata, lessons, tests });
  }

  validateGlobalContentIds(packs);
  return { catalog: { schemaVersion: 1, packs: [...packIds] }, packs };
}
