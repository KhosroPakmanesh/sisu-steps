import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const clientRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const browserRoot = resolve(clientRoot, 'dist/sisu-steps/browser');
const entryFile = resolve(browserRoot, 'index.html');

for (const route of ['privacy', 'terms']) {
  const routeDirectory = resolve(browserRoot, route);
  await mkdir(routeDirectory, { recursive: true });
  await copyFile(entryFile, resolve(routeDirectory, 'index.html'));
}
