/**
 * Tokenize a restricted regular expression and insert explicit CONCAT.
 * Allowed: single-char literals (any char except | * ( )), |, *, parentheses.
 */

const META = new Set(['|', '*', '(', ')']);

function isLiteralChar(c) {
  return !META.has(c);
}

/**
 * @param {string} regex
 * @returns {{ type: string, value?: string }[]}
 */
function tokenize(regex) {
  if (regex === undefined || regex === null || String(regex).trim() === '') {
    throw new Error('Empty input');
  }

  const s = String(regex);
  const raw = [];
  let depth = 0;
  let prevType = null;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (c === '(') {
      if (prevType === 'UNION' || prevType === 'LPAREN') {
        // ok
      }
      depth += 1;
      raw.push({ type: 'LPAREN' });
      prevType = 'LPAREN';
      continue;
    }

    if (c === ')') {
      depth -= 1;
      if (depth < 0) {
        throw new Error('Unbalanced parentheses');
      }
      if (prevType === 'UNION' || prevType === 'LPAREN') {
        throw new Error('Invalid operator placement');
      }
      raw.push({ type: 'RPAREN' });
      prevType = 'RPAREN';
      continue;
    }

    if (c === '|') {
      if (raw.length === 0 || prevType === 'UNION' || prevType === 'LPAREN') {
        throw new Error('Invalid operator placement');
      }
      raw.push({ type: 'UNION' });
      prevType = 'UNION';
      continue;
    }

    if (c === '*') {
      if (
        prevType === null ||
        prevType === 'UNION' ||
        prevType === 'LPAREN' ||
        prevType === 'STAR'
      ) {
        throw new Error('Invalid operator placement');
      }
      raw.push({ type: 'STAR' });
      prevType = 'STAR';
      continue;
    }

    if (isLiteralChar(c)) {
      raw.push({ type: 'LITERAL', value: c });
      prevType = 'LITERAL';
      continue;
    }

    throw new Error(`Invalid character: ${c}`);
  }

  if (depth !== 0) {
    throw new Error('Unbalanced parentheses');
  }

  if (raw.length > 0 && raw[raw.length - 1].type === 'UNION') {
    throw new Error('Invalid operator placement');
  }

  return insertConcat(raw);
}

/**
 * Insert CONCAT between adjacent factors.
 */
function insertConcat(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    out.push(tokens[i]);
    if (i + 1 >= tokens.length) break;
    const a = tokens[i].type;
    const b = tokens[i + 1].type;
    const needConcat =
      (a === 'LITERAL' || a === 'RPAREN' || a === 'STAR') &&
      (b === 'LITERAL' || b === 'LPAREN');
    if (needConcat) {
      out.push({ type: 'CONCAT' });
    }
  }
  return out;
}

module.exports = { tokenize, insertConcat };
