import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const host = '127.0.0.1';
const port = 4200;
const baseUrl = `http://${host}:${port}`;
const browserRoot = resolve('dist/personal-finnish-learning-app/browser');
const contentTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

async function existingServerIsAvailable(): Promise<boolean> {
  try {
    const response = await fetch(baseUrl);
    return response.ok;
  } catch {
    return false;
  }
}

async function findResponseFile(pathname: string): Promise<string | undefined> {
  const relativePath = decodeURIComponent(pathname).replace(/^\/+/, '') || 'index.html';
  const candidate = resolve(browserRoot, relativePath);
  if (candidate !== browserRoot && !candidate.startsWith(`${browserRoot}${sep}`)) return undefined;

  try {
    const file = await stat(candidate);
    if (file.isFile()) return candidate;
  } catch {
    if (extname(candidate)) return undefined;
  }

  return resolve(browserRoot, 'index.html');
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  if (await existingServerIsAvailable()) return async () => undefined;

  const server = createServer((request, response) => {
    void (async () => {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        response.writeHead(405).end();
        return;
      }

      const pathname = new URL(request.url ?? '/', baseUrl).pathname;
      const filePath = await findResponseFile(pathname);
      if (!filePath) {
        response.writeHead(404).end();
        return;
      }

      const body = await readFile(filePath);
      response.writeHead(200, {
        'content-length': body.byteLength,
        'content-type': contentTypes[extname(filePath)] ?? 'application/octet-stream',
      });
      response.end(request.method === 'HEAD' ? undefined : body);
    })().catch(() => response.writeHead(500).end());
  });

  await new Promise<void>((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, host, resolveListen);
  });

  return async () => {
    await new Promise<void>((resolveClose, rejectClose) => {
      server.close((error) => (error ? rejectClose(error) : resolveClose()));
    });
  };
}
