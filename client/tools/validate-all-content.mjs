import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContentSource } from './content-source-loader.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await loadContentSource(resolve(root, 'content'));

for (const pack of source.packs) {
  execFileSync(process.execPath, [resolve(root, 'tools', 'validate-content.mjs'), '--stdin'], {
    cwd: root,
    input: JSON.stringify(pack),
    stdio: ['pipe', 'inherit', 'inherit'],
  });
}

console.log(
  `Validated ${source.catalog.packs.length} pack-owned content source(s) with global IDs.`,
);
