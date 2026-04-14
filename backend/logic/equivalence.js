/**
 * Bounded equivalence: compare full string sets up to maxLength.
 */

const { generateStrings, allStringsFromGrouped } = require('./generator');

/**
 * @param {object} tree1
 * @param {object} tree2
 * @param {number} maxLength
 * @returns {{
 *   equivalent: boolean,
 *   onlyInFirst: string[],
 *   onlyInSecond: string[],
 *   checkedUpToLength: number
 * }}
 */
function checkEquivalence(tree1, tree2, maxLength) {
  const cap = Math.floor(maxLength);
  const g1 = generateStrings(tree1, cap);
  const g2 = generateStrings(tree2, cap);
  const s1 = allStringsFromGrouped(g1);
  const s2 = allStringsFromGrouped(g2);

  const onlyInFirst = [...s1].filter((w) => !s2.has(w)).sort((a, b) => a.length - b.length || a.localeCompare(b));
  const onlyInSecond = [...s2].filter((w) => !s1.has(w)).sort((a, b) => a.length - b.length || a.localeCompare(b));

  return {
    equivalent: onlyInFirst.length === 0 && onlyInSecond.length === 0,
    onlyInFirst,
    onlyInSecond,
    checkedUpToLength: cap,
  };
}

module.exports = { checkEquivalence };
