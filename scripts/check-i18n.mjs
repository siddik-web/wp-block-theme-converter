#!/usr/bin/env node
// Scan PHP files for i18n issues: unwrapped strings, double-escaping, missing text-domain.

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join, extname, relative, sep } from 'path';
import { readTextDomain, blankPhp, lineAt } from './lib/theme-utils.mjs';

const themeDir = resolve(process.argv[2] ?? '.');

const SKIP_DIRS = new Set(['vendor', 'node_modules', '.git']);

/** Recursively collect .php files, skipping excluded dirs. */
function collectPhpFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectPhpFiles(full));
    } else if (extname(entry).toLowerCase() === '.php') {
      results.push(full);
    }
  }
  return results;
}

const files = collectPhpFiles(themeDir);

// All recognized i18n wrapper functions
const I18N_FUNCTIONS = [
  '__', '_e', 'esc_html__', 'esc_html_e', 'esc_attr__', 'esc_attr_e',
  '_n', '_x', '_ex', '_nx', 'esc_html_x', 'esc_attr_x', '_n_noop', '_nx_noop',
];

// The theme's text domain (style.css "Text Domain"); domain checks are skipped without it.
const textDomain = readTextDomain(themeDir);

/**
 * Split the argument list of a call starting at `open` (the index of its "(")
 * into top-level argument strings, honouring quotes and nested brackets.
 * Returns null if the call is not closed.
 */
function splitCallArgs(src, open) {
  const args = [];
  let depth = 0;
  let quote = null;
  let start = open + 1;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') {
      depth--;
      if (depth === 0) {
        args.push(src.slice(start, i).trim());
        return args;
      }
    } else if (c === ',' && depth === 1) {
      args.push(src.slice(start, i).trim());
      start = i + 1;
    }
  }
  return null;
}

/**
 * Text left after removing PHP, HTML comments, and <script>/<style> bodies. <pre>/<code>
 * contents are code samples (a terminal transcript, a snippet), not UI copy to translate.
 */
function markupOnly(src) {
  const blank = (m) => m.replace(/[^\n]/g, ' ');
  return blankPhp(src)
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<(script|style|pre|code)\b[\s\S]*?<\/\1>/gi, blank);
}

// Regex: any of the i18n function names followed by open-paren
const I18N_CALL_RE = new RegExp(
  `\\b(${I18N_FUNCTIONS.map(f => f.replace(/[_]/g, '_')).join('|')})\\s*\\(`,
  'g'
);

// Anti-pattern: esc_html( __( — double escaping
const DOUBLE_ESCAPE_RE = /esc_html\s*\(\s*__\s*\(/g;

// Heuristic: echo followed by a bare quoted string NOT preceded by an i18n function
// Matches: echo 'some text'  or  echo "some text"
// Does NOT match: echo __('some text', 'domain')  or  echo esc_html__('text', 'domain')
const ECHO_RAW_STRING_RE = /\becho\s+(['"])/;

// Translation function call without a second argument (text-domain missing)
// Matches: __( 'string' )  — no comma before closing paren
// Heuristic: look for i18n( 'string' ) without a comma inside
const MISSING_DOMAIN_RE = new RegExp(
  `\\b(?:${I18N_FUNCTIONS.join('|')})\\s*\\(\\s*(?:'[^']*'|"[^"]*")\\s*\\)`,
  'g'
);

const filesWithIssues = new Set();
let totalIssues = 0;

function report(file, lineNum, message) {
  const rel = relative(themeDir, file);
  console.log(`${rel}:${lineNum}: ${message}`);
  filesWithIssues.add(file);
  totalIssues++;
}

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    // ── Check 1: Double-escaping anti-pattern ─────────────────────────────
    if (DOUBLE_ESCAPE_RE.test(line)) {
      report(file, lineNum, 'Double-escaping anti-pattern: esc_html( __( ... ) ) — use esc_html__() instead');
      DOUBLE_ESCAPE_RE.lastIndex = 0; // reset after test()
    }

    // ── Check 2: echo of bare quoted string (not wrapped in i18n) ─────────
    // Skip lines that already contain an i18n function call
    const hasI18nCall = I18N_CALL_RE.test(line);
    I18N_CALL_RE.lastIndex = 0;

    if (!hasI18nCall && ECHO_RAW_STRING_RE.test(line)) {
      // Make sure it's not echo esc_*( or echo wp_kses(
      const isEscaped = /\becho\s+(?:esc_|wp_kses|intval|absint|number_format)/.test(line);
      const isVar = /\becho\s+\$/.test(line);
      if (!isEscaped && !isVar) {
        report(file, lineNum, 'Possible unwrapped user-facing string after echo — wrap with __() + esc_html__() etc.');
      }
    }

    // ── Check 3: i18n function called without a text-domain ───────────────
    // Look for calls like __( 'string' ) with only one argument
    let m;
    const missingDomainRe = new RegExp(
      `\\b(${I18N_FUNCTIONS.join('|')})\\s*\\(\\s*(?:'[^']*'|"[^"]*")\\s*\\)`,
      'g'
    );
    while ((m = missingDomainRe.exec(line)) !== null) {
      report(file, lineNum, `${m[1]}() called without a text-domain (second argument missing)`);
    }

    // ── Check 4: HTML content between PHP tags that looks like user-facing text ──
    // Pattern: ?> ... text ... <?php  where text is not empty whitespace/tags
    // Heuristic: a line that is pure HTML text (no tags, not empty) outside PHP context
    // We look for lines between ?> and <?php that have printable non-tag content
    if (/\?>\s*[A-Za-z][^<\n]{3,}/.test(line) && !hasI18nCall) {
      // Make sure it's not a comment, a tag, or a PHP statement
      const stripped = line.replace(/<!--.*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\?>[^<]*$/, m => {
        const inner = m.slice(2).trim();
        return inner;
      });
      // Only flag if the remainder looks like meaningful text content (>3 chars, has letters)
      const textContent = line.match(/\?>\s*([A-Za-z][^<?\n]{3,})/);
      if (textContent) {
        report(file, lineNum, `Possible un-translated text in HTML context: "${textContent[1].trim().slice(0, 60)}"`);
      }
    }
  }
}

// ── Check 5: text domain matches style.css ─────────────────────────────────
if (textDomain) {
  const callRe = new RegExp(`\\b(${I18N_FUNCTIONS.join('|')})\\s*\\(`, 'g');
  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    let m;
    while ((m = callRe.exec(src)) !== null) {
      const args = splitCallArgs(src, m.index + m[0].length - 1);
      if (!args || args.length < 2) continue;
      const last = /^(['"])(.*)\1$/.exec(args[args.length - 1]);
      if (last && last[2] !== textDomain) {
        report(file, lineAt(src, m.index), `${m[1]}() uses text domain "${last[2]}" but style.css declares "${textDomain}"`);
      }
    }
  }
}

// ── Check 6: hardcoded text in pattern markup ─────────────────────────────
// Text written directly into a pattern's HTML can't be translated; it must be
// output through esc_html_e() / esc_html__() etc.
for (const file of files) {
  if (!relative(themeDir, file).split(sep).includes('patterns')) continue;
  const src = markupOnly(readFileSync(file, 'utf8'));
  const textRe = />([^<>]+)</g;
  let m;
  while ((m = textRe.exec(src)) !== null) {
    const text = m[1].replace(/&[a-z]+;|&#\d+;/gi, ' ').trim();
    if (/\p{L}{2,}/u.test(text)) {
      report(file, lineAt(src, m.index + 1 + m[1].search(/\S/)), `Hardcoded text in pattern markup: "${text.slice(0, 60)}" — wrap with esc_html_e( '…', '${textDomain ?? 'text-domain'}' )`);
    }
  }
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\nScanned ${files.length} PHP file(s). ${totalIssues} issue(s) in ${filesWithIssues.size} file(s).`);
process.exit(Math.min(filesWithIssues.size, 127));
