// Shared helpers for the theme-quality scripts. Pure Node stdlib.

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';

const SKIP_DIRS = new Set(['vendor', 'node_modules', '.git']);

/** Recursively collect files with the given extensions under a directory. */
export function collectFiles(dir, exts) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectFiles(full, exts));
    } else if (exts.includes(extname(entry).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

/** 1-based line number of a character offset in a string. */
export function lineAt(src, index) {
  let line = 1;
  for (let i = 0; i < index && i < src.length; i++) {
    if (src.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * Parse the header comment of a theme's style.css into a { Field: value } map.
 * Returns null when style.css does not exist.
 */
export function readStyleHeader(themeDir) {
  const path = join(themeDir, 'style.css');
  if (!existsSync(path)) return null;
  const src = readFileSync(path, 'utf8');
  const m = /\/\*([\s\S]*?)\*\//.exec(src);
  const fields = {};
  if (!m) return fields;
  for (const line of m[1].split('\n')) {
    const fm = /^\s*\*?\s*([A-Za-z][A-Za-z ]*?)\s*:\s*(.+?)\s*$/.exec(line);
    if (fm) fields[fm[1]] = fm[2];
  }
  return fields;
}

/** The theme's text domain from style.css, or null if unavailable. */
export function readTextDomain(themeDir) {
  return readStyleHeader(themeDir)?.['Text Domain'] ?? null;
}

/**
 * Replace every `<?php ... ?>` block (and a trailing unclosed one) with
 * whitespace of the same length, keeping newlines so offsets and line numbers
 * still line up with the original source.
 */
export function blankPhp(src) {
  return src.replace(/<\?(?:php|=)[\s\S]*?(?:\?>|$)/g, (m) => m.replace(/[^\n]/g, ' '));
}

/**
 * Tokenize WordPress block delimiters the same way core's block parser does:
 *   <!-- wp:ns/name {"attrs"} -->   opener
 *   <!-- /wp:ns/name -->            closer
 *   <!-- wp:ns/name {"attrs"} /-->  void (self-closing)
 * Attributes may span lines. Returns [{ type, name, attrs, index, end }].
 */
export function tokenizeBlocks(src) {
  const re = /<!--\s+(\/)?wp:([a-z][a-z0-9_-]*(?:\/[a-z][a-z0-9_-]*)?)\s+(\{[\s\S]*?\}\s+)?(\/)?-->/g;
  const tokens = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, closer, name, attrs, isVoid] = m;
    const type = closer ? 'close' : isVoid ? 'void' : 'open';
    tokens.push({ type, name, attrs: attrs ? attrs.trim() : '', index: m.index, end: re.lastIndex });
  }
  return tokens;
}
