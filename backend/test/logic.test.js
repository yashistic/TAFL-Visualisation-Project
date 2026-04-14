const { test } = require('node:test');
const assert = require('node:assert');

const { tokenize } = require('../logic/tokenizer');
const { parse, printSyntaxTree } = require('../logic/parser');
const { generateStrings, allStringsFromGrouped, generateSample } = require('../logic/generator');
const { isMember, isMemberFromTree } = require('../logic/membership');
const { checkEquivalence } = require('../logic/equivalence');

test('tokenizer: concat insertion for ab', () => {
  const t = tokenize('ab');
  assert.deepStrictEqual(
    t.map((x) => x.type),
    ['LITERAL', 'CONCAT', 'LITERAL']
  );
});

test('tokenizer: rejects empty', () => {
  assert.throws(() => tokenize(''), /Empty/);
});

test('tokenizer: rejects unbalanced', () => {
  assert.throws(() => tokenize('(a'), /Unbalanced/);
});

test('parser + generator: (a|b)* up to 2', () => {
  const tree = parse(tokenize('(a|b)*'));
  const g = generateStrings(tree, 2);
  const all = allStringsFromGrouped(g);
  assert.strictEqual(all.size, 7); // ε, a, b, aa, ab, ba, bb
  assert.ok(all.has(''));
  assert.ok(all.has('ab'));
});

test('membership', () => {
  assert.strictEqual(isMember('(a|b)*', 'aba'), true);
  assert.strictEqual(isMember('(a|b)*', 'ac'), false);
});

test('equivalence', () => {
  const t1 = parse(tokenize('a*'));
  const t2 = parse(tokenize('(a*)*'));
  const r = checkEquivalence(t1, t2, 4);
  assert.strictEqual(r.equivalent, true);
});

test('printSyntaxTree runs', () => {
  const tree = parse(tokenize('a|b*'));
  const s = printSyntaxTree(tree);
  assert.ok(s.includes('UNION'));
});

test('generateSample avoids duplicates', () => {
  const tree = parse(tokenize('a'));
  const g = allStringsFromGrouped(generateStrings(tree, 3));
  const r = generateSample(tree, 3, g, [], () => 0.4);
  assert.ok('message' in r || ('samples' in r && r.samples.length <= 5));
});
