import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { readFileSync } from 'node:fs';

async function load(name) {
  const source = readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { identifierToBytes, identifierToBase58, bytesToHex } = await load('identifier');
const { withDeadline, coreHealth } = await load('request');

test('Explorer base58 identities and hex refer to exactly the same 32 bytes', () => {
  const id = '7P3ZsJHh61jhvVwaxh1xyNx7wkCqiDdkhw2EpCfTn9J';
  const bytes = identifierToBytes(id);
  assert.equal(bytes.length, 32);
  assert.equal(identifierToBase58(bytesToHex(bytes)), id);
  assert.equal(identifierToBase58('0x' + bytesToHex(bytes)), id);
  assert.equal(identifierToBase58('0'.repeat(64)), '1'.repeat(32));
  assert.throws(() => identifierToBytes('1'.repeat(44)), /32 bytes/);
  assert.throws(() => identifierToBytes('0'.repeat(43)), /base58/);
});
test('health errors and unknown health can never produce green reachability', () => {
  assert.equal(coreHealth('READY').label, 'Reachable');
  assert.equal(coreHealth('ERROR').label, 'Health error');
  assert.notEqual(coreHealth('ERROR').tone, coreHealth('READY').tone);
  assert.equal(coreHealth(undefined).label, 'Health unknown');
});
test('reads settle at their deadline and retain successful responses', async () => {
  await assert.rejects(withDeadline(new Promise(() => {}), 5), /did not answer/);
  assert.equal(await withDeadline(Promise.resolve(12), 100), 12);
  await assert.rejects(withDeadline(Promise.reject(new Error('bad response')), 100), /bad response/);
});
