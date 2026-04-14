/**
 * Membership test using AST matching (no DFA/NFA).
 */

const { tokenize } = require('./tokenizer');
const { parse } = require('./parser');

/**
 * Returns set of end positions reachable from start index `i` after matching `node`.
 * @param {object} node
 * @param {string} str
 * @param {number} i
 * @returns {number[]}
 */
function matchFrom(node, str, i) {
  switch (node.type) {
    case 'LITERAL': {
      if (i < str.length && str[i] === node.value) {
        return [i + 1];
      }
      return [];
    }
    case 'CONCAT': {
      let positions = new Set([i]);
      for (const part of [node.left, node.right]) {
        const next = new Set();
        for (const pos of positions) {
          for (const np of matchFrom(part, str, pos)) {
            next.add(np);
          }
        }
        positions = next;
      }
      return [...positions];
    }
    case 'UNION': {
      return [...matchFrom(node.left, str, i), ...matchFrom(node.right, str, i)];
    }
    case 'STAR': {
      let closure = new Set([i]);
      let changed = true;
      while (changed) {
        changed = false;
        const snap = [...closure];
        for (const pos of snap) {
          for (const np of matchFrom(node.child, str, pos)) {
            if (!closure.has(np)) {
              closure.add(np);
              changed = true;
            }
          }
        }
      }
      return [...closure];
    }
    default:
      throw new Error(`Unknown node: ${node.type}`);
  }
}

/**
 * @param {object} tree — parsed regex AST
 * @param {string} string
 * @returns {boolean}
 */
function isMemberFromTree(tree, string) {
  const ends = matchFrom(tree, string, 0);
  return ends.includes(string.length);
}

/**
 * @param {string} regex
 * @param {string} string
 * @returns {boolean}
 */
function isMember(regex, string) {
  const tokens = tokenize(regex);
  const tree = parse(tokens);
  return isMemberFromTree(tree, string);
}

module.exports = { matchFrom, isMemberFromTree, isMember };
