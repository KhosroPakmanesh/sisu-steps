import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { cwd } from 'node:process';

const SOURCE_EXTENSIONS = new Set(['.css', '.ts']);
const IMPORT_PATTERN = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/gu;
const BROWSER_API_PATTERN =
  /\b(?:window\.|globalThis\.(?:window|document)|document\.(?:body|createElement|querySelector|querySelectorAll)|FileReader\b|indexedDB\b|URL\.(?:createObjectURL|revokeObjectURL))/u;
const DOMAIN_DIRECTORIES = new Set(['mappers', 'policies', 'queries', 'services']);
const VAGUE_DIRECTORIES = new Set(['common', 'core', 'helpers', 'lib', 'utils']);
const FEATURE_ROOT_DIRECTORIES = new Map([
  ['learning', new Set(['dashboard', 'data-management', 'lessons', 'reports', 'shared', 'study'])],
]);

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? sourceFiles(path) : [path];
    }),
  );
  return nested.flat().filter((file) => SOURCE_EXTENSIONS.has(extname(file)));
}

function normalizedRelative(root, file) {
  return relative(root, file).split(sep).join('/');
}

function importsFrom(source) {
  return [...source.matchAll(IMPORT_PATTERN)].map((match) => match[1]);
}

function featureOwner(path) {
  return /^src\/features\/([^/]+)\//u.exec(path)?.[1];
}

function resolvedSourcePath(root, file, specifier) {
  if (specifier.startsWith('@/')) return `src/${specifier.slice(2)}`;
  if (specifier.startsWith('.')) return normalizedRelative(root, resolve(dirname(file), specifier));
  return undefined;
}

function featureTarget(path) {
  return /^src\/features\/([^/]+)(?:\/|$)/u.exec(path ?? '')?.[1];
}

function containsDomainDirectory(path) {
  return path.split('/').some((segment) => DOMAIN_DIRECTORIES.has(segment));
}

function ownedPathParts(path, pattern) {
  const match = pattern.exec(path);
  return match ? { owner: match[1], segments: match[2].split('/') } : undefined;
}

function topologyViolations(path, ownedPath) {
  if (!ownedPath) return [];
  const results = [];
  const directorySegments = ownedPath.segments.slice(0, -1);
  const vagueDirectory = directorySegments.find((segment) => VAGUE_DIRECTORIES.has(segment));
  if (vagueDirectory) {
    results.push(`${path}: production/test code must not use the vague ${vagueDirectory}/ owner`);
  }
  const allowedRoots = FEATURE_ROOT_DIRECTORIES.get(ownedPath.owner);
  const rootDirectory = directorySegments[0];
  if (allowedRoots && rootDirectory && !allowedRoots.has(rootDirectory)) {
    results.push(
      `${path}: ${ownedPath.owner} code must use a configured workflow root, not ${rootDirectory}/`,
    );
  }
  return results;
}

function featureCycles(graph) {
  const cycles = new Set();
  const active = [];
  const visited = new Set();

  function visit(owner) {
    const activeIndex = active.indexOf(owner);
    if (activeIndex >= 0) {
      cycles.add([...active.slice(activeIndex), owner].join(' -> '));
      return;
    }
    if (visited.has(owner)) return;
    active.push(owner);
    for (const target of graph.get(owner) ?? []) visit(target);
    active.pop();
    visited.add(owner);
  }

  for (const owner of graph.keys()) visit(owner);
  return [...cycles].sort();
}

const root = resolve(cwd());
const files = await sourceFiles(join(root, 'src'));
const unitTestFiles = await sourceFiles(join(root, 'tests', 'unit'));
const violations = [];
const graph = new Map();

for (const file of files) {
  const path = normalizedRelative(root, file);
  const source = await readFile(file, 'utf8');
  const owner = featureOwner(path);
  const featurePath = ownedPathParts(path, /^src\/features\/([^/]+)\/(.+)$/u);
  violations.push(...topologyViolations(path, featurePath));

  for (const specifier of importsFrom(source)) {
    const targetPath = resolvedSourcePath(root, file, specifier);
    if (
      (path.startsWith('src/shared/') || path.startsWith('src/design-system/')) &&
      /^src\/(?:app|features)(?:\/|$)/u.test(targetPath ?? '')
    ) {
      violations.push(`${path}: shared/design-system code must not import ${specifier}`);
    }
    if (owner && /^src\/app(?:\/|$)/u.test(targetPath ?? '')) {
      violations.push(`${path}: feature code must not import app implementation ${specifier}`);
    }
    const target = featureTarget(targetPath);
    if (owner && target && owner !== target) {
      const targets = graph.get(owner) ?? new Set();
      targets.add(target);
      graph.set(owner, targets);
    }
  }

  if (
    path.startsWith('src/features/') &&
    containsDomainDirectory(path) &&
    BROWSER_API_PATTERN.test(source)
  ) {
    violations.push(
      `${path}: domain/application modules must access browser APIs through an adapter`,
    );
  }
}

for (const file of unitTestFiles) {
  const path = normalizedRelative(root, file);
  const testPath = ownedPathParts(path, /^tests\/unit\/features\/([^/]+)\/(.+)$/u);
  violations.push(...topologyViolations(path, testPath));
}

for (const cycle of featureCycles(graph)) violations.push(`feature dependency cycle: ${cycle}`);

if (files.some((file) => file.endsWith('.spec.ts'))) {
  violations.push('src/: unit tests must live under the mirrored tests/unit/ tree');
}

if (violations.length) {
  console.error('Architecture boundary review failed:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Architecture boundary review passed.');
}
