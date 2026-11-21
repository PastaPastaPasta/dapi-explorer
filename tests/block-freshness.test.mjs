import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/lib/block-freshness.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { blockTimestamp, blockFreshness, headerTimestamp } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('block age uses reported seconds, milliseconds or ISO time and rejects absent times', () => {
  const timestamp = Date.parse('2026-11-09T18:00:00Z');
  for (const value of [timestamp, String(timestamp), timestamp / 1000, String(timestamp / 1000), '2026-11-09T18:00:00Z']) assert.equal(blockTimestamp(value), timestamp);
  for (const value of [undefined, '', 'bad', 0, -1]) assert.equal(blockTimestamp(value), null);
});

test('freshness is good through exactly twice the interval; missing, failed and future reads stay unknown', () => {
  const now = 1_000_000;
  for (const target of [150, 180]) {
    assert.equal(blockFreshness(now - target * 2000, target, now), 'good');
    assert.equal(blockFreshness(now - target * 2000 - 1, target, now), 'warn');
  }
  assert.equal(blockFreshness(null, 150, now), 'unknown');
  assert.equal(blockFreshness(now, 150, now, true), 'unknown');
  assert.equal(blockFreshness(now + 1, 150, now), 'unknown');
});

test('header timestamps respect byte offsets and reject truncated responses', () => {
  const bytes = new Uint8Array(100);
  const header = bytes.subarray(10, 90);
  new DataView(bytes.buffer).setUint32(78, 1_700_000_000, true);
  assert.equal(headerTimestamp(header), 1_700_000_000);
  assert.throws(() => headerTimestamp(header.subarray(0, 79)), /incomplete/);
});
