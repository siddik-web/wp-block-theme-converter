#!/usr/bin/env node
// Check that a block theme has the files WordPress needs to activate it, a complete
// style.css header, resolvable template-part / pattern / color references, and PHP that parses.

import { readFileSync, existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { resolve, join, relative } from 'path';
import { collectFiles, readStyleHeader, tokenizeBlocks, blankPhp } from './lib/theme-utils.mjs';

const themeDir = resolve(process.argv[2] ?? '.');

let passed = 0;
let failed = 0;

function pass(msg) {
  console.log(`  PASS  ${msg}`);
  passed++;
}

function fail(msg) {
  console.log(`  FAIL  ${msg}`);
  failed++;
}

function warn(msg) {
  console.log(`  WARN  ${msg}`);
}

// ── Check 1: required files ─────────────────────────────────────────────────
// WordPress refuses to activate a block theme without style.css and templates/index.html.
for (const required of ['style.css', 'templates/index.html']) {
  if (existsSync(join(themeDir, required))) {
    pass(`${required} exists`);
  } else {
    fail(`${required} is missing — WordPress cannot activate a block theme without it`);
  }
}

// ── Check 2: style.css header fields ─────────────────────────────────────────
const REQUIRED_HEADER_FIELDS = [
  'Theme Name', 'Version', 'Requires at least', 'Tested up to',
  'Requires PHP', 'License', 'Text Domain',
];
const header = readStyleHeader(themeDir);
if (header) {
  const missing = REQUIRED_HEADER_FIELDS.filter(f => !header[f]);
  if (missing.length === 0) {
    pass('style.css header has all required fields');
  } else {
    fail(`style.css header is missing: ${missing.join(', ')}`);
  }
  const placeholders = Object.entries(header).filter(([, v]) => /\{\{.+?\}\}/.test(v));
  if (placeholders.length > 0) {
    fail(`style.css header still has template placeholders: ${placeholders.map(([k]) => k).join(', ')}`);
  }
  const textDomain = header['Text Domain'];
  if (textDomain && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(textDomain)) {
    fail(`Text Domain "${textDomain}" should be lowercase kebab-case (matching the theme folder slug)`);
  }
}

// ── Check 3: template-part, pattern, and palette color references resolve ────
const blockFiles = ['templates', 'parts', 'patterns']
  .flatMap(d => collectFiles(join(themeDir, d), ['.html', '.php']));

const patternSlugs = new Set();
for (const file of collectFiles(join(themeDir, 'patterns'), ['.php'])) {
  const m = /^\s*\*?\s*Slug:\s*(.+)$/mi.exec(readFileSync(file, 'utf8').split('\n').slice(0, 20).join('\n'));
  if (m) patternSlugs.add(m[1].trim());
}

// Color slugs a theme may reference: its own palette, plus core's when not disabled.
const CORE_PALETTE = [
  'black', 'cyan-bluish-gray', 'white', 'pale-pink', 'vivid-red', 'luminous-vivid-orange',
  'luminous-vivid-amber', 'light-green-cyan', 'vivid-green-cyan', 'pale-cyan-blue',
  'vivid-cyan-blue', 'vivid-purple',
];
let themeJson = null;
try {
  themeJson = JSON.parse(readFileSync(join(themeDir, 'theme.json'), 'utf8'));
} catch {
  // Missing or invalid theme.json is validate-theme-json's concern.
}
const palette = themeJson?.settings?.color?.palette;
const colorSlugs = Array.isArray(palette)
  ? new Set([
      ...palette.map(c => c.slug),
      ...(themeJson.settings.color.defaultPalette === false ? [] : CORE_PALETTE),
    ])
  : null;

const COLOR_ATTRS = new Set(['backgroundColor', 'textColor', 'borderColor', 'overlayColor']);

/** Every color preset slug referenced in a block-attrs / theme.json value. */
function colorRefs(value, out = []) {
  if (typeof value === 'string') {
    for (const m of value.matchAll(/var:preset\|color\|([a-z0-9-]+)|var\(--wp--preset--color--([a-z0-9-]+)\)/g)) {
      out.push(m[1] ?? m[2]);
    }
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (COLOR_ATTRS.has(k) && typeof v === 'string') out.push(v);
      else colorRefs(v, out);
    }
  }
  return out;
}

let refFailures = 0;
function checkColors(where, value) {
  if (!colorSlugs) return;
  for (const slug of new Set(colorRefs(value))) {
    if (!colorSlugs.has(slug)) {
      fail(`${where}: color "${slug}" is not in the theme.json palette`);
      refFailures++;
    }
  }
}
checkColors('theme.json styles', themeJson?.styles ?? {});

for (const file of blockFiles) {
  const raw = readFileSync(file, 'utf8');
  const src = file.endsWith('.php') ? blankPhp(raw) : raw;
  const rel = relative(themeDir, file);
  for (const tok of tokenizeBlocks(src)) {
    if (tok.type === 'close' || !tok.attrs) continue;
    let attrs;
    try {
      attrs = JSON.parse(tok.attrs);
    } catch {
      continue; // Malformed attrs are lint-block-markup's concern.
    }
    checkColors(`${rel} (wp:${tok.name})`, attrs);
    if (tok.name === 'template-part' && attrs.slug && !attrs.theme) {
      if (!existsSync(join(themeDir, 'parts', `${attrs.slug}.html`))) {
        fail(`${rel}: template part "${attrs.slug}" has no parts/${attrs.slug}.html`);
        refFailures++;
      }
    }
    if (tok.name === 'pattern' && attrs.slug && attrs.slug.split('/')[0] === header?.['Text Domain']) {
      if (!patternSlugs.has(attrs.slug)) {
        fail(`${rel}: pattern "${attrs.slug}" is not registered by any file in patterns/`);
        refFailures++;
      }
    }
  }
}
if (refFailures === 0) {
  pass('All template-part, pattern, and palette color references resolve');
}

// ── Check 4: PHP syntax (php -l) ─────────────────────────────────────────────
const phpFiles = collectFiles(themeDir, ['.php']);
const php = spawnSync('php', ['--version'], { encoding: 'utf8' });
if (phpFiles.length === 0) {
  pass('No PHP files (php -l skipped)');
} else if (php.error || php.status !== 0) {
  warn('php not found on PATH — skipping php -l syntax check');
} else {
  let phpFailures = 0;
  for (const file of phpFiles) {
    const res = spawnSync('php', ['-l', file], { encoding: 'utf8' });
    if (res.status !== 0) {
      const msg = `${res.stdout}${res.stderr}`.split('\n').find(l => /error/i.test(l)) ?? 'syntax error';
      fail(`${relative(themeDir, file)}: ${msg.trim()}`);
      phpFailures++;
    }
  }
  if (phpFailures === 0) pass(`All ${phpFiles.length} PHP file(s) pass php -l`);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed} checks passed, ${failed} failed.`);
process.exit(Math.min(failed, 127));
