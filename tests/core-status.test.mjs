import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText).toString('base64')}`;
const request = moduleUrl(readFileSync(new URL('../src/lib/request.ts', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../src/lib/core-status.ts', import.meta.url), 'utf8').replace("'./request'", JSON.stringify(request));
const { readCoreStatus } = await import(moduleUrl(source));

function client(addresses, read) {
  const provider = {
    async getLiveAddress() { return { toString: () => addresses.shift() }; },
    async hasLiveAddresses() { return true; },
  };
  return { dapiAddressProvider: provider, core: { getBlockchainStatus: read } };
}

test('source follows the final attempted node and timestamps only successful reads', async () => {
  const before = Date.now();
  const transport = client(['first:1443', 'retry:1443'], async ({ dapiAddressProvider }) => {
    await dapiAddressProvider.getLiveAddress();
    assert.equal(await dapiAddressProvider.hasLiveAddresses(), true);
    await dapiAddressProvider.getLiveAddress();
    return { chain: { blocksCount: 123 } };
  });
  const result = await readCoreStatus(transport);
  assert.equal(result.source, 'retry:1443');
  assert.equal(result.status.chain.blocksCount, 123);
  assert.ok(result.readAt >= before && result.readAt <= Date.now());
});

test('concurrent status reads retain their own endpoint and failed reads publish nothing', async () => {
  const read = async ({ dapiAddressProvider }) => {
    await dapiAddressProvider.getLiveAddress();
    return { status: 'READY' };
  };
  const [a, b] = await Promise.all([
    readCoreStatus(client(['a:1443'], read)),
    readCoreStatus(client(['b:1443'], read)),
  ]);
  assert.equal(a.source, 'a:1443');
  assert.equal(b.source, 'b:1443');
  await assert.rejects(readCoreStatus(client(['bad:1443'], async ({ dapiAddressProvider }) => {
    await dapiAddressProvider.getLiveAddress();
    throw new Error('Offline');
  })), /Offline/);
});
