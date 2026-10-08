import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const checker = fileURLToPath(new URL('../../../scripts/check-module-size.mjs', import.meta.url));
const fixtureParent = resolve(tmpdir());

async function check(file, source) {
  const directory = await mkdtemp(join(fixtureParent, 'sisu-module-size-'));
  try {
    await mkdir(join(directory, 'src'));
    await writeFile(join(directory, 'src', file), source);
    const result = spawnSync(process.execPath, [checker], { cwd: directory, encoding: 'utf8' });
    assert.equal(result.error, undefined);
    return { status: result.status, output: result.stdout + result.stderr };
  } finally {
    assert.ok(resolve(directory).startsWith(fixtureParent + sep));
    assert.ok(basename(directory).startsWith('sisu-module-size-'));
    await rm(directory, { recursive: true });
  }
}

const lines = (count, header = '', ending = '\n') =>
  [header || '// content', ...Array(count - 1).fill('// content')].join(ending) + ending;
const tsHeader = (maximum, reason = 'One cohesive declarative table reviewed as a unit.') =>
  `// module-size-exception: declarative; max=${maximum}; reason=${reason}`;

for (const [extension, limit] of [
  ['ts', 300],
  ['css', 400],
]) {
  test(`${extension}: exact physical-line boundary, including CRLF`, async () => {
    assert.equal((await check(`fixture.${extension}`, lines(limit))).status, 0);
    assert.equal((await check(`fixture.${extension}`, lines(limit, '', '\r\n'))).status, 0);
    const result = await check(`fixture.${extension}`, lines(limit + 1));
    assert.equal(result.status, 1);
    assert.ok(result.output.includes(`${limit + 1} lines (limit ${limit})`));
  });
}

test('accepts a bounded declarative TS exception with a BOM and leading blank line', async () => {
  assert.equal((await check('table.ts', '\uFEFF\n' + lines(310, tsHeader(320)))).status, 0);
});
test('accepts a bounded generated CSS exception', async () => {
  const header =
    '/* module-size-exception: generated; max=430; reason=One generated token table. */';
  assert.equal((await check('tokens.css', lines(420, header))).status, 0);
});
test('rejects growth beyond the documented maximum', async () => {
  const result = await check('table.ts', lines(321, tsHeader(320)));
  assert.equal(result.status, 1);
  assert.match(result.output, /documented exception limit 320/u);
});

for (const [label, source] of [
  ['missing reason', lines(310, tsHeader(320, ''))],
  ['blank reason', lines(310, tsHeader(320, '   '))],
  ['unsupported kind', lines(310, tsHeader(320).replace('declarative', 'behavior'))],
  ['unbounded maximum', lines(310, tsHeader('Infinity'))],
  ['unsafe maximum', lines(310, tsHeader('9007199254740992'))],
  ['ordinary-limit maximum', lines(310, tsHeader(300))],
  ['duplicate annotations', lines(309, tsHeader(320)) + tsHeader(320) + '\n'],
  ['buried annotation', '// ordinary first line\n' + lines(309, tsHeader(320))],
  [
    'wrong comment syntax',
    lines(310, '/* module-size-exception: declarative; max=320; reason=Table. */'),
  ],
  ['stale exception', lines(300, tsHeader(320))],
]) {
  test(`rejects ${label}`, async () => {
    assert.equal((await check('table.ts', source)).status, 1);
  });
}

test('CSS rejects misplaced or malformed exceptions too', async () => {
  assert.equal((await check('tokens.css', lines(410, tsHeader(430)))).status, 1);
});
test('does not start enforcing unrelated files or declaration files', async () => {
  assert.equal((await check('types.d.ts', lines(410))).status, 0);
  assert.equal((await check('template.html', lines(410))).status, 0);
});
