/**
 * Deterministic string generation from syntax tree, grouped by length.
 * Sample generation via random tree traversal.
 */

const MAX_SAMPLE_ATTEMPTS = 8000;

/**
 * @param {object} tree
 * @param {number} maxLength
 * @returns {Map<number, Set<string>>}
 */
function generateStrings(tree, maxLength) {
  if (maxLength < 0 || !Number.isFinite(maxLength)) {
    throw new Error('maxLength must be a non-negative finite number');
  }
  const cap = Math.floor(maxLength);
  const map = visit(tree, cap);
  const ordered = new Map();
  for (let len = 0; len <= cap; len++) {
    const set = map.get(len);
    if (set && set.size > 0) {
      ordered.set(len, set);
    }
  }
  return ordered;
}

/**
 * @returns {Map<number, Set<string>>}
 */
function visit(node, maxLength) {
  switch (node.type) {
    case 'LITERAL': {
      const m = new Map();
      if (maxLength >= 1) {
        m.set(1, new Set([node.value]));
      }
      return m;
    }
    case 'UNION':
      return unionMaps(visit(node.left, maxLength), visit(node.right, maxLength), maxLength);
    case 'CONCAT':
      return concatMaps(visit(node.left, maxLength), visit(node.right, maxLength), maxLength);
    case 'STAR':
      return starMap(visit(node.child, maxLength), maxLength);
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
}

function unionMaps(a, b, maxLength) {
  const out = new Map();
  for (let i = 0; i <= maxLength; i++) {
    const sa = a.get(i);
    const sb = b.get(i);
    if (!sa && !sb) continue;
    const merged = new Set([...(sa || []), ...(sb || [])]);
    out.set(i, merged);
  }
  return out;
}

function concatMaps(left, right, maxLength) {
  const out = new Map();
  for (let i = 0; i <= maxLength; i++) {
    const A = left.get(i);
    if (!A) continue;
    for (let j = 0; j <= maxLength - i; j++) {
      const B = right.get(j);
      if (!B) continue;
      for (const x of A) {
        for (const y of B) {
          const len = x.length + y.length;
          if (len <= maxLength) {
            if (!out.has(len)) out.set(len, new Set());
            out.get(len).add(x + y);
          }
        }
      }
    }
  }
  return out;
}

/**
 * Kleene star: strings formed by concatenating zero or more words from L(child), length ≤ maxLength.
 */
function starMap(childMap, maxLength) {
  const nonEmpty = [];
  for (let i = 1; i <= maxLength; i++) {
    const s = childMap.get(i);
    if (s) {
      for (const w of s) nonEmpty.push(w);
    }
  }

  const starSet = new Set(['']);
  let changed = true;
  while (changed) {
    changed = false;
    const snapshot = [...starSet];
    for (const prefix of snapshot) {
      for (const w of nonEmpty) {
        const next = prefix + w;
        if (next.length <= maxLength && !starSet.has(next)) {
          starSet.add(next);
          changed = true;
        }
      }
    }
  }

  const out = new Map();
  for (const w of starSet) {
    const len = w.length;
    if (!out.has(len)) out.set(len, new Set());
    out.get(len).add(w);
  }
  return out;
}

/**
 * Flatten grouped map to a Set of all strings.
 * @param {Map<number, Set<string>>} grouped
 */
function allStringsFromGrouped(grouped) {
  const all = new Set();
  for (const set of grouped.values()) {
    for (const w of set) all.add(w);
  }
  return all;
}

/**
 * Random string via stochastic tree walk; respects maxLength (retries internally).
 * @param {object} tree
 * @param {number} maxLength
 * @param {() => number} rng returns [0,1)
 */
function randomStringFromTree(tree, maxLength, rng = Math.random) {
  const roll = () => rng();

  function pickStarRepetitions() {
    const weights = [];
    let sum = 0;
    for (let k = 0; k <= maxLength + 1; k++) {
      const w = 1 / (1 + k * k);
      weights.push(w);
      sum += w;
    }
    let r = roll() * sum;
    for (let k = 0; k < weights.length; k++) {
      r -= weights[k];
      if (r <= 0) return k;
    }
    return 0;
  }

  function walk(node) {
    switch (node.type) {
      case 'LITERAL':
        return node.value;
      case 'UNION':
        return roll() < 0.5 ? walk(node.left) : walk(node.right);
      case 'CONCAT':
        return walk(node.left) + walk(node.right);
      case 'STAR': {
        let k = pickStarRepetitions();
        let out = '';
        for (let i = 0; i < k; i++) {
          out += walk(node.child);
          if (out.length > maxLength) return out;
        }
        return out;
      }
      default:
        throw new Error(`Unknown node: ${node.type}`);
    }
  }

  let s = walk(tree);
  let guard = 0;
  while (s.length > maxLength && guard < 50) {
    s = walk(tree);
    guard += 1;
  }
  return s.length <= maxLength ? s : '';
}

/**
 * @param {object} tree
 * @param {number} maxLength
 * @param {Iterable<string>} existingStrings — from deterministic generation
 * @param {Iterable<string>} sampledStrings — previously sampled
 * @param {() => number} [rng]
 * @returns {{ samples: string[] } | { message: string }}
 */
function generateSample(tree, maxLength, existingStrings, sampledStrings, rng = Math.random) {
  const existing = new Set(existingStrings);
  const sampled = new Set(sampledStrings);
  const blocked = new Set([...existing, ...sampled]);

  const found = [];
  let attempts = 0;

  while (found.length < 5 && attempts < MAX_SAMPLE_ATTEMPTS) {
    attempts += 1;
    const w = randomStringFromTree(tree, maxLength, rng);
    if (w === '' && !blocked.has('')) {
      if (!existing.has('') && !sampled.has('')) {
        found.push('');
        blocked.add('');
      }
      continue;
    }
    if (w.length <= maxLength && !blocked.has(w)) {
      found.push(w);
      blocked.add(w);
    }
  }

  if (found.length === 0) {
    return { message: 'No more unique strings can be generated' };
  }
  return { samples: found };
}

module.exports = {
  generateStrings,
  allStringsFromGrouped,
  generateSample,
  randomStringFromTree,
};
