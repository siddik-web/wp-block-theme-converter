#!/usr/bin/env node
// Lint block markup in templates/, parts/, and patterns/ for common anti-patterns.

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join, extname, relative } from 'path';

const themeDir = resolve(process.argv[2] ?? '.');

/** Recursively collect files with given extensions under a directory. */
function collectFiles(dir, exts) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...collectFiles(full, exts));
    } else if (exts.includes(extname(entry).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

const scanDirs = ['templates', 'parts', 'patterns'];
const files = scanDirs.flatMap(d => collectFiles(join(themeDir, d), ['.html', '.php']));

// violations: { file, line, message }
const violations = [];
const filesWithViolations = new Set();

function report(file, line, message) {
  const rel = relative(themeDir, file);
  console.log(`${rel}:${line}: ${message}`);
  violations.push({ file, line, message });
  filesWithViolations.add(file);
}

const INLINE_STYLE_ATTR_RE = /style\s*=/i;
const STYLE_TAG_RE = /<style[\s>]/i;
const SCRIPT_TAG_RE = /<script[\s>]/i;
// PHP: echo $var not followed by esc_
const ECHO_UNESCAPED_RE = /echo\s+\$[a-zA-Z]/;
const ECHO_ESC_RE = /echo\s+esc_/;
// CSS directional properties inside style="" attributes
const DIRECTIONAL_IN_STYLE_RE = /style\s*=\s*["'][^"']*(?:margin-(?:left|right)|padding-(?:left|right)|text-align\s*:\s*(?:left|right))[^"']*["']/i;

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const src = readFileSync(file, 'utf8');
  const lines = src.split('\n');

  // ── Per-line checks ──────────────────────────────────────────────────────
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    // Check: no style="" attribute
    if (INLINE_STYLE_ATTR_RE.test(line)) {
      report(file, lineNum, 'Inline style="" attribute found — use block supports or theme.json instead');
    }

    // Check: no <style tag
    if (STYLE_TAG_RE.test(line)) {
      report(file, lineNum, '<style> tag found in block markup — enqueue via wp_enqueue_style instead');
    }

    // Check: no <script tag
    if (SCRIPT_TAG_RE.test(line)) {
      report(file, lineNum, '<script> tag found in block markup — enqueue via wp_enqueue_script instead');
    }

    // Check: PHP echo without escaping
    if (ext === '.php' && ECHO_UNESCAPED_RE.test(line) && !ECHO_ESC_RE.test(line)) {
      report(file, lineNum, 'Possibly unescaped echo of variable — wrap with esc_html(), esc_attr(), etc.');
    }

    // Check: directional CSS inside style attribute
    if (DIRECTIONAL_IN_STYLE_RE.test(line)) {
      report(file, lineNum, 'Physical CSS directional property found in style attribute — use logical properties (margin-inline-start, etc.)');
    }
  }

  // ── Block delimiter integrity ────────────────────────────────────────────
  // Collect all opening and closing block comments
  const openRe = /<!--\s*wp:([a-zA-Z0-9/_-]+)(?:\s[^>]*)?\s*-->/g;
  const closeRe = /<!--\s*\/wp:([a-zA-Z0-9/_-]+)\s*-->/g;
  const selfCloseRe = /<!--\s*wp:[a-zA-Z0-9/_-]+(?:\s[^>]*)?\s*\/-->/g;

  // Build a line-aware token stream
  const tokens = []; // { type: 'open'|'close'|'self', name, lineNum }

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    let m;
    // Self-closing (must check before open to avoid false match)
    const selfRe = /<!--\s*wp:([a-zA-Z0-9/_-]+)(?:\s[^>]*)?\s*\/-->/g;
    while ((m = selfRe.exec(line)) !== null) {
      tokens.push({ type: 'self', name: m[1], lineNum });
    }

    // Opening (not self-closing — exclude lines that already fully matched self-close)
    const opRe = /<!--\s*wp:([a-zA-Z0-9/_-]+)(?:\s[^\/\-][^>]*)?\s*-->/g;
    while ((m = opRe.exec(line)) !== null) {
      tokens.push({ type: 'open', name: m[1], lineNum });
    }

    // Closing
    const clRe = /<!--\s*\/wp:([a-zA-Z0-9/_-]+)\s*-->/g;
    while ((m = clRe.exec(line)) !== null) {
      tokens.push({ type: 'close', name: m[1], lineNum });
    }
  }

  // Validate with a stack
  const stack = []; // { name, lineNum }
  for (const tok of tokens) {
    if (tok.type === 'self') continue;
    if (tok.type === 'open') {
      stack.push({ name: tok.name, lineNum: tok.lineNum });
    } else if (tok.type === 'close') {
      if (stack.length === 0) {
        report(file, tok.lineNum, `Unmatched closing block comment <!-- /wp:${tok.name} --> (no open tag on stack)`);
      } else {
        const top = stack[stack.length - 1];
        if (top.name !== tok.name) {
          report(file, tok.lineNum, `Block comment mismatch: expected <!-- /wp:${top.name} --> (opened at line ${top.lineNum}), got <!-- /wp:${tok.name} -->`);
          // Don't pop — let subsequent closes potentially match
        } else {
          stack.pop();
        }
      }
    }
  }
  for (const unclosed of stack) {
    report(file, unclosed.lineNum, `Unclosed block comment <!-- wp:${unclosed.name} --> has no matching <!-- /wp:${unclosed.name} -->`);
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
const totalFiles = files.length;
const violationFiles = filesWithViolations.size;
console.log(`\nScanned ${totalFiles} file(s). ${violations.length} violation(s) in ${violationFiles} file(s).`);
process.exit(violationFiles);
