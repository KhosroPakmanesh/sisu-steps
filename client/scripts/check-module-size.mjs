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

const root = cwd();
const files = await productionFiles(join(root, 'src'));
const violations = [];

for (const file of files) {
  const limit = limits.get(extname(file));
  if (!limit || file.endsWith('.d.ts')) continue;
  const lineCount = (await readFile(file, 'utf8')).split(/\r?\n/u).length;
  if (lineCount > limit) violations.push({ file: relative(root, file), lineCount, limit });
}

if (violations.length) {
  console.error('Purposeful-module size review failed:');
  for (const violation of violations) {
    console.error(`- ${violation.file}: ${violation.lineCount} lines (limit ${violation.limit})`);
  }
  console.error(
    'Decompose the module or document a justified file-local exception per specs/architecture/purposeful-modules.md.',
  );
  process.exitCode = 1;
} else {
  console.log('Purposeful-module size review passed.');
}
