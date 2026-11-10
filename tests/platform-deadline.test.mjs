import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText).toString('base64')}`;
const deadline = asModule(readFileSync(new URL('../src/lib/request.ts', import.meta.url), 'utf8'));
const stub = asModule(`export class EvoSDK {
  static connections = 0;
  static hang = false;
  async connect() { EvoSDK.connections++; if (EvoSDK.hang) await new Promise(() => {}); }
}`);
const source = readFileSync(new URL('../src/lib/platform.ts', import.meta.url), 'utf8')
  .replace("'@dashevo/evo-sdk'", JSON.stringify(stub))
  .replace("'./request'", JSON.stringify(deadline));
const { platformRead } = await import(asModule(source));
const { EvoSDK } = await import(stub);

test('a stalled epoch read settles at its deadline and Retry establishes a fresh session', async () => {
  await assert.rejects(platformRead('mainnet', () => new Promise(() => {}), 5), /did not answer/);
  assert.equal(await platformRead('mainnet', async () => 88, 100), 88);
  assert.equal(EvoSDK.connections, 2);
});

test('the epoch deadline also bounds a connection that never finishes', async () => {
  EvoSDK.hang = true;
  await assert.rejects(platformRead('testnet', async () => 1, 5), /did not answer/);
  EvoSDK.hang = false;
  assert.equal(await platformRead('testnet', async () => 1, 100), 1);
});
