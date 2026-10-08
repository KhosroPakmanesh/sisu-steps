import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { cwd } from 'node:process';

const limits = new Map([
  ['.ts', 300],
  ['.css', 400],
]);

async function productionFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? productionFiles(path) : [path];
    }),
  );
  return nested.flat();
}

function reviewFile(file, source, limit) {
  const lines = source.replace(/^\uFEFF/u, '').split(/\r?\n/u);
  if (lines.at(-1) === '') lines.pop();
  const lineCount = lines.length;
  const annotations = lines.filter((line) => line.includes('module-size-exception:'));
  if (annotations.length === 0)
    return lineCount > limit ? `${lineCount} lines (limit ${limit})` : undefined;

  const header = lines.find((line) => line.trim())?.trim();
  const pattern =
    extname(file) === '.ts'
      ? /^\/\/ module-size-exception: (declarative|generated); max=(\d+); reason=(.+)$/u
      : /^\/\* module-size-exception: (declarative|generated); max=(\d+); reason=(.+) \*\/$/u;
  const match = header?.match(pattern);
  if (annotations.length !== 1 || !match || !match[3].trim())
    return 'exception must be one first-content-line comment with kind, max and justification';
  const maximum = Number(match[2]);
  if (!Number.isSafeInteger(maximum) || maximum <= limit)
    return `exception maximum must be a safe integer greater than ${limit}`;
  if (lineCount <= limit) return 'remove the stale exception: this file fits the ordinary limit';
  if (lineCount > maximum) return `${lineCount} lines (documented exception limit ${maximum})`;
  return undefined;
}

const root = cwd();
const files = await productionFiles(join(root, 'src'));
const violations = [];

for (const file of files) {
  const limit = limits.get(extname(file));
  if (!limit || file.endsWith('.d.ts')) continue;
  const violation = reviewFile(file, await readFile(file, 'utf8'), limit);
  if (violation) violations.push({ file: relative(root, file), violation });
}

if (violations.length) {
  console.error('Purposeful-module size review failed:');
  for (const { file, violation } of violations) console.error(`- ${file}: ${violation}`);
  console.error(
    'Decompose the module or use a bounded, justified declarative/generated header exception per specs/architecture/purposeful-modules.md.',
  );
  process.exitCode = 1;
} else {
  console.log('Purposeful-module size review passed.');
}
