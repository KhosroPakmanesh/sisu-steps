import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';

const FIXTURE_PREFIX = 'sisu-steps-content-fixture-';

function resolveFixtureEntry(fixtureDirectory, entry) {
  if (typeof entry !== 'string' || !entry.trim()) {
    throw new Error('Temporary content fixture entries must use non-empty relative paths.');
  }
  const target = resolve(fixtureDirectory, entry);
  const relativeTarget = relative(fixtureDirectory, target);
  if (isAbsolute(relativeTarget) || relativeTarget.startsWith('..')) {
    throw new Error(`Temporary content fixture entry escapes its root: ${entry}`);
  }
  return target;
}

function assertSafeCleanupTarget(fixtureDirectory) {
  const resolvedTemporaryRoot = resolve(tmpdir());
  const resolvedFixture = resolve(fixtureDirectory);
  const relativeFixture = relative(resolvedTemporaryRoot, resolvedFixture);
  if (
    isAbsolute(relativeFixture) ||
    relativeFixture.startsWith('..') ||
    !basename(resolvedFixture).startsWith(FIXTURE_PREFIX)
  ) {
    throw new Error(`Refusing to remove unexpected fixture directory: ${resolvedFixture}`);
  }
}

export async function createContentSourceFixture({ directories = [], files }) {
  const fixtureDirectory = await mkdtemp(join(tmpdir(), FIXTURE_PREFIX));
  try {
    for (const directory of directories) {
      await mkdir(resolveFixtureEntry(fixtureDirectory, directory), { recursive: true });
    }
    for (const [path, value] of Object.entries(files)) {
      const target = resolveFixtureEntry(fixtureDirectory, path);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
    }
    return {
      directory: fixtureDirectory,
      cleanup: async () => {
        assertSafeCleanupTarget(fixtureDirectory);
        await rm(fixtureDirectory, { recursive: true, force: true });
      },
    };
  } catch (error) {
    assertSafeCleanupTarget(fixtureDirectory);
    await rm(fixtureDirectory, { recursive: true, force: true });
    throw error;
  }
}
