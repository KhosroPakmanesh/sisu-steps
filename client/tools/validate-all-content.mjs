import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = resolve(root, 'public', 'content');
const catalog = JSON.parse(readFileSync(resolve(contentDirectory, 'index.json'), 'utf8'));
const errors = [];

if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.packs) || catalog.packs.length === 0) {
  errors.push('content catalog must use schemaVersion 1 and list at least one pack');
}

const catalogIds = new Set();
const catalogFiles = new Set();
const globalIds = new Map();

for (const entry of catalog.packs ?? []) {
  if (!entry?.id?.trim() || !/^[a-z0-9][a-z0-9-]*\.json$/.test(entry?.file ?? '')) {
    errors.push('each catalog entry needs a non-empty id and a safe JSON filename');
    continue;
  }
  if (catalogIds.has(entry.id)) errors.push(`duplicate catalog pack id: ${entry.id}`);
  if (catalogFiles.has(entry.file)) errors.push(`duplicate catalog pack file: ${entry.file}`);
  catalogIds.add(entry.id);
  catalogFiles.add(entry.file);

  let pack;
  try {
    pack = JSON.parse(readFileSync(resolve(contentDirectory, entry.file), 'utf8'));
  } catch (error) {
    errors.push(`${entry.file}: ${error instanceof Error ? error.message : 'could not be read'}`);
    continue;
  }
  if (pack.id !== entry.id) errors.push(`${entry.file}: catalog id does not match pack id`);

  const ids = [
    ...(pack.lessons ?? []).map((lesson) => [lesson.id, 'lesson']),
    ...(pack.tests ?? []).map((test) => [test.id, 'test']),
    ...(pack.tests ?? []).flatMap((test) =>
      (test.exercises ?? []).map((exercise) => [exercise.id, 'scored exercise']),
    ),
    ...(pack.lessons ?? []).flatMap((lesson) =>
      (lesson.practiceExercises ?? []).map((exercise) => [exercise.id, 'practice exercise']),
    ),
  ];
  for (const [id, kind] of ids) {
    if (!id?.trim()) {
      errors.push(`${entry.id}: ${kind} has no id`);
      continue;
    }
    const previous = globalIds.get(id);
    if (previous) errors.push(`global id ${id} is used by ${previous} and ${entry.id} ${kind}`);
    else globalIds.set(id, `${entry.id} ${kind}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

for (const entry of catalog.packs) {
  execFileSync(process.execPath, [resolve(root, 'tools', 'validate-content.mjs'), entry.file], {
    cwd: root,
    stdio: 'inherit',
  });
}

console.log(`Validated ${catalog.packs.length} cataloged content pack(s) with global IDs.`);
