import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
function moduleUrl(path, mocks = {}) {
  const source = readFileSync(path, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  const resolved = outputText.replace(/from ["']([^"']+)["']/g, (_, name) => {
    if (mocks[name]) return `from ${JSON.stringify('data:text/javascript;base64,' + Buffer.from(mocks[name]).toString('base64'))}`;
    if (!name.startsWith('.')) return `from ${JSON.stringify(pathToFileURL(require.resolve(name)).href)}`;
    const base = new URL(name, path);
    const target = ['.ts', '.tsx'].map(ext => new URL(base.href + ext)).find(existsSync);
    return `from ${JSON.stringify(moduleUrl(target, mocks))}`;
  });
  return `data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`;
}
globalThis.window = { location: { search: '' }, addEventListener() {} };
const { Stat } = await import(moduleUrl(new URL('../src/components/Card.tsx', import.meta.url)));
const { BalanceStat } = await import(moduleUrl(new URL('../src/components/BalanceStat.tsx', import.meta.url)));
const { HashValue } = await import(moduleUrl(new URL('../src/components/HashValue.tsx', import.meta.url)));
const { NetworkRecovery } = await import(moduleUrl(new URL('../src/components/NetworkRecovery.tsx', import.meta.url), {
  '../store/network': "export const useNetworkStore = select => select({ network: 'testnet' });",
  '../lib/platform': "export const platformRead = () => { throw new Error('Server render must not issue a lookup'); };",
}));
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('missing values have a reason while zero is an actual value', () => {
  for (const value of [undefined, null, '', ' ', 'N/A', NaN, Infinity]) assert.match(render(Stat, { label: 'Peers', value }), /— · Not reported by this node/);
  assert.match(render(Stat, { label: 'Peers', value: 0 }), />0<\/dd>/);
});
test('credit units render only beside a valid amount, including zero', () => {
  for (const credits of [null, undefined, '', 'bad', -1, NaN, Infinity, {}]) {
    const html = render(BalanceStat, { credits, unit: 'tDASH', label: 'Balance' });
    assert.match(html, /— · Balance not returned/);
    assert.doesNotMatch(html, /tDASH| credits/);
  }
  const zero = render(BalanceStat, { credits: 0n, unit: 'tDASH', label: 'Balance' });
  assert.match(zero, />0 <span/);
  assert.match(zero, />0<\/dashhq-hash> credits/);
  const amount = render(BalanceStat, { credits: 98647006122n, unit: 'DASH', label: 'Balance' });
  assert.match(amount, /0\.98647006/);
  assert.match(amount, />98647006122<\/dashhq-hash> credits/);
});
test('hashes have visible fallback text and missing hashes have an explanation', () => {
  for (const value of ['', null, undefined, 7, {}]) assert.match(render(HashValue, { value, label: 'Hash' }), /Not reported/);
  assert.match(render(HashValue, { value: new Uint8Array([1, 255]), label: 'Hash' }), />01ff<\/dashhq-hash>/);
  assert.match(render(HashValue, { value: [1, 255], label: 'Hash' }), />01ff<\/dashhq-hash>/);
  const html = render(HashValue, { value: 'abc123', label: 'Hash' });
  assert.match(html, />abc123<\/dashhq-hash>/);
});

test('network recovery preserves both lookups and distinguishes pending, absent and failed reads', () => {
  const id = '7P3ZsJHh61jhvVwaxh1xyNx7wkCqiDdkhw2EpCfTn9J';
  window.location.href = `https://dapi.dashhq.org/?tab=platform&identity=${id}&contract=${id}&network=testnet`;
  window.dashhq = { href: (_product, path, { network }) => {
    const url = new URL(path, window.location.href);
    url.searchParams.set('network', network);
    return url.href;
  } };
  for (const kind of ['identity', 'contract']) {
    for (const state of ['pending', 'found', 'absent', 'failed']) {
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const key = ['network-recovery', kind, 'mainnet', id];
      if (state !== 'pending') client.setQueryData(key, state === 'found');
      if (state === 'failed') client.getQueryCache().find({ queryKey: key }).setState({ status: 'error', error: new Error('Offline') });
      const html = renderToStaticMarkup(React.createElement(QueryClientProvider, { client }, React.createElement(NetworkRecovery, { kind, id })));
      const expected = { found: 'mainnet', absent: 'none', failed: 'unknown' }[state];
      if (expected) assert.match(html, new RegExp(`found="${expected}"`));
      else assert.doesNotMatch(html, / found=/);
      const href = new URL(html.match(/ href="([^"]+)"/)[1].replaceAll('&amp;', '&'));
      assert.equal(href.searchParams.get('identity'), id);
      assert.equal(href.searchParams.get('contract'), id);
      assert.equal(href.searchParams.get('network'), 'mainnet');
      client.clear();
    }
  }
});

const epochHooks = await import(moduleUrl(new URL('../src/hooks/usePlatformStatus.ts', import.meta.url), {
  '@tanstack/react-query': 'export const useQuery = options => options;',
  './useDapi': 'export const useDapi = () => ({});',
  '../store/network': "export const useNetworkStore = select => select({ network: 'mainnet' });",
  '../lib/platform': 'export const platformRead = async (network, read) => read(globalThis.epochSdk);',
}));

test('epoch queries wait for the current index and request descending, bounded pages including genesis', async () => {
  let query;
  globalThis.epochSdk = { epoch: {
    current: async () => ({ index: 87 }),
    epochsInfo: async (options) => {
      query = options;
      return new Map([[0, { index: 0 }], [2, undefined], [1, { index: 1 }]]);
    },
  } };
  assert.equal(epochHooks.useEpochsInfo(undefined).enabled, false);
  assert.equal((await epochHooks.useCurrentEpoch().queryFn()).index, 87);
  for (const start of [87, 77, 0]) {
    const options = epochHooks.useEpochsInfo(start);
    assert.equal(options.enabled, true);
    assert.deepEqual(options.queryKey, ['epochsInfo', 'mainnet', start, 10]);
    const result = await options.queryFn();
    assert.deepEqual(query, { startEpoch: start, count: 10, ascending: false });
    assert.deepEqual(result.epochsInfo.map(epoch => epoch.index), [1, 0]);
  }
});

const { EpochInfo } = await import(moduleUrl(new URL('../src/features/platform/EpochInfo.tsx', import.meta.url), {
  '../../lib/location': "export const useUrlParam = () => [globalThis.epochPage ?? '', () => {}];",
  '../../hooks/usePlatformStatus': `
    export const useCurrentEpoch = () => globalThis.currentEpochState;
    export const useEpochsInfo = start => { globalThis.requestedEpoch = start; return globalThis.epochsState; };
    export const useConsensusParams = () => ({});`,
}));

test('epoch rendering marks current and bounds older pages without falling back to genesis on failed current reads', () => {
  globalThis.currentEpochState = { data: { index: 1 } };
  globalThis.epochsState = { data: { epochsInfo: [{ index: 1, firstBlockHeight: 0 }, { index: 0 }] } };
  globalThis.epochPage = '';
  const html = render(EpochInfo);
  assert.equal(globalThis.requestedEpoch, 1);
  assert.match(html, /Epoch #1/);
  assert.match(html, /Current epoch/);
  assert.match(html, /Start block 0/);
  assert.doesNotMatch(html, /Show earlier|Back to latest/);
  globalThis.epochPage = '999';
  assert.match(render(EpochInfo), /Back to latest/);
  assert.equal(globalThis.requestedEpoch, 1);
  globalThis.epochPage = '0';
  render(EpochInfo);
  assert.equal(globalThis.requestedEpoch, 0);
  globalThis.epochPage = '-1';
  render(EpochInfo);
  assert.equal(globalThis.requestedEpoch, 1);
  globalThis.epochPage = '';
  globalThis.currentEpochState = { error: new Error('Offline') };
  globalThis.epochsState = {};
  const failed = render(EpochInfo);
  assert.equal(globalThis.requestedEpoch, undefined);
  assert.match(failed, /Couldn’t read the current epoch/);
  assert.doesNotMatch(failed, /Current epoch<|Epoch #0/);
});

const { CoreSummary } = await import(moduleUrl(new URL('../src/features/core/BlockchainStatus.tsx', import.meta.url), {
  '../../hooks/useBlockchainStatus': 'export const useBlockchainStatus = () => globalThis.coreSummaryState;',
  '../../store/network': "export const useNetworkStore = select => select({ network: 'testnet' });",
}));
test('compact Core status retains source and freshness on failed refreshes without inventing readiness', () => {
  globalThis.coreSummaryState = { isLoading: true };
  assert.match(render(CoreSummary), /Reading Core status/);
  globalThis.coreSummaryState = { error: new Error('Offline') };
  const failed = render(CoreSummary);
  assert.match(failed, /no health status/);
  assert.match(failed, /no response yet/);
  assert.match(failed, /Retry Core status/);
  assert.doesNotMatch(failed, /READY/);
  globalThis.coreSummaryState.data = { status: { status: 'READY', chain: { blocksCount: 0 } }, source: 'last-node:443', readAt: Date.now() };
  const stale = render(CoreSummary);
  assert.match(stale, /Height 0/);
  assert.match(stale, /last-node:443/);
  assert.match(stale, /showing the last successful read/);
  assert.match(stale, /tab=dashboard/);
  assert.match(stale, /network=testnet/);
});
