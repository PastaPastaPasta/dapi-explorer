import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
function moduleUrl(path) {
  const source = readFileSync(path, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } });
  const resolved = outputText.replace(/from ["']([^"']+)["']/g, (_, name) => {
    if (!name.startsWith('.')) return `from ${JSON.stringify(pathToFileURL(require.resolve(name)).href)}`;
    const base = new URL(name, path);
    const target = ['.ts', '.tsx'].map(ext => new URL(base.href + ext)).find(existsSync);
    return `from ${JSON.stringify(moduleUrl(target))}`;
  });
  return `data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`;
}
globalThis.window = { location: { search: '' }, addEventListener() {} };
const { Stat } = await import(moduleUrl(new URL('../src/components/Card.tsx', import.meta.url)));
const { BalanceStat } = await import(moduleUrl(new URL('../src/components/BalanceStat.tsx', import.meta.url)));
const { HashValue } = await import(moduleUrl(new URL('../src/components/HashValue.tsx', import.meta.url)));
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('missing values have a reason while zero is an actual value', () => {
  for (const value of [undefined, null, '', 'N/A']) assert.match(render(Stat, { label: 'Peers', value }), /— · Not reported by this node/);
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
