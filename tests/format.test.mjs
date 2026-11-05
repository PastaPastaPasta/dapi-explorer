import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/format.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { formatTimestamp } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Platform epoch millisecond BigInts render without mixing numeric types', () => {
  const expected = new Date(1725004800000).toLocaleString();
  assert.equal(formatTimestamp(1725004800000n, 'milliseconds'), expected);
  assert.equal(formatTimestamp('1725004800000', 'milliseconds'), expected);
});
test('Core seconds and ISO dates preserve their meaning', () => {
  const expected = new Date(1725004800000).toLocaleString();
  assert.equal(formatTimestamp(1725004800), expected);
  assert.equal(formatTimestamp(1725004800n), expected);
  assert.equal(formatTimestamp('2024-08-30T08:00:00.000Z'), new Date('2024-08-30T08:00:00.000Z').toLocaleString());
});
test('Malformed and out of range timestamps cannot crash a render', () => {
  assert.equal(formatTimestamp('invalid'), 'Unavailable');
  assert.equal(formatTimestamp(999999999999999999999n), 'Unavailable');
});
