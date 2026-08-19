import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// Register one deterministic generator per cataloged topic pack.
const generators = ['generate-content.mjs'];

for (const generator of generators) {
  execFileSync(process.execPath, [resolve(root, 'tools', generator)], {
    cwd: root,
    stdio: 'inherit',
  });
}

console.log(`Generated ${generators.length} content pack(s).`);
