const express = require('express');
const { tokenize } = require('../logic/tokenizer');
const { parse } = require('../logic/parser');
const { generateStrings, allStringsFromGrouped, generateSample } = require('../logic/generator');
const { isMember } = require('../logic/membership');
const { checkEquivalence } = require('../logic/equivalence');

const router = express.Router();

function parseMaxLength(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 30) {
    throw new Error('maxLength must be a number between 0 and 30');
  }
  return Math.floor(n);
}

function groupedToSerializable(grouped) {
  const obj = {};
  const keys = [...grouped.keys()].sort((a, b) => a - b);
  for (const len of keys) {
    const set = grouped.get(len);
    obj[String(len)] = [...set].sort((a, b) => a.length - b.length || a.localeCompare(b));
  }
  return obj;
}

function parseRegexOrThrow(regex) {
  const tokens = tokenize(regex);
  return parse(tokens);
}

router.post('/generate', (req, res) => {
  try {
    const { regex, maxLength } = req.body || {};
    const cap = parseMaxLength(maxLength);
    const tree = parseRegexOrThrow(regex);
    const grouped = generateStrings(tree, cap);
    const all = [...allStringsFromGrouped(grouped)].sort(
      (a, b) => a.length - b.length || a.localeCompare(b)
    );
    res.json({
      groupedStrings: groupedToSerializable(grouped),
      allStrings: all,
    });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid request' });
  }
});

router.post('/sample', (req, res) => {
  try {
    const { regex, maxLength, existingStrings, sampledStrings } = req.body || {};
    const cap = parseMaxLength(maxLength);
    const tree = parseRegexOrThrow(regex);
    const existing = Array.isArray(existingStrings) ? existingStrings : [];
    const sampled = Array.isArray(sampledStrings) ? sampledStrings : [];
    const result = generateSample(tree, cap, existing, sampled);
    if (result.message) {
      res.json({ newSamples: [], message: result.message });
    } else {
      res.json({ newSamples: result.samples });
    }
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid request' });
  }
});

router.post('/membership', (req, res) => {
  try {
    const { regex, string } = req.body || {};
    const accepted = isMember(regex, string == null ? '' : String(string));
    res.json({ accepted });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid request' });
  }
});

router.post('/equivalence', (req, res) => {
  try {
    const { regex1, regex2, maxLength } = req.body || {};
    const cap = parseMaxLength(maxLength);
    const tree1 = parseRegexOrThrow(regex1);
    const tree2 = parseRegexOrThrow(regex2);
    const result = checkEquivalence(tree1, tree2, cap);
    res.json({
      equivalent: result.equivalent,
      onlyInFirst: result.onlyInFirst,
      onlyInSecond: result.onlyInSecond,
      checkedUpToLength: result.checkedUpToLength,
    });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid request' });
  }
});

module.exports = router;
