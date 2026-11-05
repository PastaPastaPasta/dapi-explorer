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
