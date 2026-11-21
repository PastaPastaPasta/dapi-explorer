import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const source = readFileSync(new URL('../src/lib/format.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
const { formatTimestamp, formatDash } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

test('Platform epoch millisecond BigInts render without mixing numeric types', () => {
  const expected = '30 Aug 2024, 08:00 UTC';
  assert.equal(formatTimestamp(1725004800000n, 'milliseconds'), expected);
  assert.equal(formatTimestamp('1725004800000', 'milliseconds'), expected);
});
test('Core seconds and ISO dates preserve their meaning', () => {
  const expected = '30 Aug 2024, 08:00 UTC';
  assert.equal(formatTimestamp(1725004800), expected);
  assert.equal(formatTimestamp(1725004800n), expected);
  assert.equal(formatTimestamp('2024-08-30T08:00:00.000Z'), '30 Aug 2024, 08:00 UTC');
});
test('Malformed and out of range timestamps cannot crash a render', () => {
  assert.equal(formatTimestamp('invalid'), 'Unavailable');
  assert.equal(formatTimestamp(999999999999999999999n), 'Unavailable');
});

test('credit equivalents keep grouping and avoid floating point rounding of exact credits', () => {
  assert.equal(formatDash(98647006122n), '0.98647006');
  assert.equal(formatDash('37414544240000000'), '374,145.4424');
  assert.equal(formatDash(0n), '0');
});
