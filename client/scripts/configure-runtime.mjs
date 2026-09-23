import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const CLIENT_ID_PATTERN = /^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/u;
const arguments_ = process.argv.slice(2);
const useLocalEnvironment = arguments_.includes('--local');
const outputPath = resolve(
  arguments_.find((argument) => !argument.startsWith('--')) ?? 'public/runtime-config.js',
);
const localClientId = useLocalEnvironment ? await readLocalClientId(resolve('.env.local')) : '';
const googleOAuthClientId = (process.env.GOOGLE_OAUTH_CLIENT_ID ?? localClientId).trim();

if (googleOAuthClientId && !CLIENT_ID_PATTERN.test(googleOAuthClientId)) {
  throw new Error('GOOGLE_OAUTH_CLIENT_ID is not a valid Google browser OAuth client ID.');
}

const source = `globalThis.__SISU_STEPS_CONFIG__ = Object.freeze({
  googleOAuthClientId: '${googleOAuthClientId}',
});
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, source, 'utf8');

console.log(
  googleOAuthClientId
    ? 'Generated runtime configuration with optional Google Drive recovery enabled.'
    : 'Generated runtime configuration with Google Drive recovery unconfigured.',
);

async function readLocalClientId(path) {
  let source;
  try {
    source = await readFile(path, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return '';
    throw error;
  }

  const assignments = source
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .filter((line) => line.startsWith('GOOGLE_OAUTH_CLIENT_ID='));

  if (assignments.length > 1) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID appears more than once in .env.local.');
  }
  if (!assignments.length) return '';

  return unquote(assignments[0].slice(assignments[0].indexOf('=') + 1).trim());
}

function unquote(value) {
  if (value.length >= 2 && value[0] === value.at(-1) && ['"', "'"].includes(value[0])) {
    return value.slice(1, -1);
  }
  return value;
}
