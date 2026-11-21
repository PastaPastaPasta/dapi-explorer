import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText).toString('base64')}`;
const deadline = asModule(readFileSync(new URL('../src/lib/request.ts', import.meta.url), 'utf8'));
const stub = asModule(`export const sessions = { connections: 0, hang: false };
export async function createPlatformReader() {
  sessions.connections++;
  if (sessions.hang) await new Promise(() => {});
  return {};
}`);
const source = readFileSync(new URL('../src/lib/platform.ts', import.meta.url), 'utf8')
  .replace("'./platformReader'", JSON.stringify(stub))
  .replace("'./request'", JSON.stringify(deadline));
const { platformRead } = await import(asModule(source));
const { sessions } = await import(stub);

test('a stalled epoch read settles at its deadline and Retry establishes a fresh session', async () => {
  await assert.rejects(platformRead('mainnet', () => new Promise(() => {}), 5), /did not answer/);
  assert.equal(await platformRead('mainnet', async () => 88, 100), 88);
  assert.equal(sessions.connections, 2);
});

test('the epoch deadline also bounds a connection that never finishes', async () => {
  sessions.hang = true;
  await assert.rejects(platformRead('testnet', async () => 1, 5), /did not answer/);
  sessions.hang = false;
  assert.equal(await platformRead('testnet', async () => 1, 100), 1);
});
