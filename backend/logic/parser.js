/**
 * Recursive descent parser for:
 *   expr  → term ('|' term)*
 *   term  → factor ('CONCAT' factor)*
 *   factor → base ('*')?
 *   base  → LITERAL | '(' expr ')'
 */

/**
 * @param {{ type: string, value?: string }[]} tokens
 */
function parse(tokens) {
  if (!tokens || tokens.length === 0) {
    throw new Error('Nothing to parse');
  }
  const ctx = { tokens, i: 0 };
  const node = parseExpr(ctx);
  if (ctx.i !== tokens.length) {
    throw new Error(`Unexpected token at position ${ctx.i}`);
  }
  return node;
}

function peek(ctx) {
  return ctx.tokens[ctx.i];
}

function consume(ctx, type) {
  const t = peek(ctx);
  if (!t || t.type !== type) {
    throw new Error(`Expected ${type}, got ${t ? t.type : 'EOF'}`);
  }
  ctx.i += 1;
  return t;
}

function parseExpr(ctx) {
  let left = parseTerm(ctx);
  while (peek(ctx) && peek(ctx).type === 'UNION') {
    consume(ctx, 'UNION');
    const right = parseTerm(ctx);
    left = { type: 'UNION', left, right };
  }
  return left;
}

function parseTerm(ctx) {
  let left = parseFactor(ctx);
  while (peek(ctx) && peek(ctx).type === 'CONCAT') {
    consume(ctx, 'CONCAT');
    const right = parseFactor(ctx);
    left = { type: 'CONCAT', left, right };
  }
  return left;
}

function parseFactor(ctx) {
  let node = parseBase(ctx);
  if (peek(ctx) && peek(ctx).type === 'STAR') {
    consume(ctx, 'STAR');
    node = { type: 'STAR', child: node };
  }
  return node;
}

function parseBase(ctx) {
  const t = peek(ctx);
  if (!t) throw new Error('Unexpected end of input');
  if (t.type === 'LITERAL') {
    consume(ctx, 'LITERAL');
    return { type: 'LITERAL', value: t.value };
  }
  if (t.type === 'LPAREN') {
    consume(ctx, 'LPAREN');
    const inner = parseExpr(ctx);
    consume(ctx, 'RPAREN');
    return inner;
  }
  throw new Error(`Unexpected token in base: ${t.type}`);
}

/**
 * Debug: pretty-print syntax tree (indented).
 * @param {object} node
 * @param {number} [indent]
 * @returns {string}
 */
function printSyntaxTree(node, indent = 0) {
  const pad = '  '.repeat(indent);
  if (!node) return `${pad}<null>\n`;
  switch (node.type) {
    case 'LITERAL':
      return `${pad}LITERAL(${JSON.stringify(node.value)})\n`;
    case 'STAR':
      return `${pad}STAR\n${printSyntaxTree(node.child, indent + 1)}`;
    case 'UNION':
      return (
        `${pad}UNION\n` +
        printSyntaxTree(node.left, indent + 1) +
        printSyntaxTree(node.right, indent + 1)
      );
    case 'CONCAT':
      return (
        `${pad}CONCAT\n` +
        printSyntaxTree(node.left, indent + 1) +
        printSyntaxTree(node.right, indent + 1)
      );
    default:
      return `${pad}UNKNOWN(${node.type})\n`;
  }
}

module.exports = { parse, printSyntaxTree };
