#!/usr/bin/env node
// Validate a WordPress block theme's theme.json against production-readiness rules.

import { readFileSync, existsSync } from 'fs';
import { resolve, join, dirname } from 'path';

const themeDir = resolve(process.argv[2] ?? '.');
const themeJsonPath = join(themeDir, 'theme.json');

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

// ── Check 1: File exists ────────────────────────────────────────────────────
if (!existsSync(themeJsonPath)) {
  fail(`theme.json not found at ${themeJsonPath}`);
  console.log(`\n${passed} checks passed, ${failed} failed.`);
  process.exit(Math.min(failed, 127));
}
pass(`theme.json exists at ${themeJsonPath}`);

// ── Check 2: Valid JSON ─────────────────────────────────────────────────────
let theme;
try {
  theme = JSON.parse(readFileSync(themeJsonPath, 'utf8'));
  pass('theme.json is valid JSON');
} catch (err) {
  fail(`theme.json is not valid JSON: ${err.message}`);
  console.log(`\n${passed} checks passed, ${failed} failed.`);
  process.exit(Math.min(failed, 127));
}

// ── Check 3: version === 3 ──────────────────────────────────────────────────
if (theme.version === 3) {
  pass('version is 3');
} else {
  fail(`version must be 3, got: ${JSON.stringify(theme.version)}`);
}

// ── Check 4: $schema present ────────────────────────────────────────────────
if (typeof theme.$schema === 'string' && theme.$schema.length > 0) {
  pass('$schema key is present');
} else {
  fail('$schema key is missing or empty');
}

// ── Check 5: settings.appearanceTools === true ──────────────────────────────
if (theme.settings?.appearanceTools === true) {
  pass('settings.appearanceTools is true');
} else {
  fail(`settings.appearanceTools must be true, got: ${JSON.stringify(theme.settings?.appearanceTools)}`);
}

// ── Check 6: settings.useRootPaddingAwareAlignments === true ─────────────────
if (theme.settings?.useRootPaddingAwareAlignments === true) {
  pass('settings.useRootPaddingAwareAlignments is true');
} else {
  fail(`settings.useRootPaddingAwareAlignments must be true, got: ${JSON.stringify(theme.settings?.useRootPaddingAwareAlignments)}`);
}

// ── Check 7: No hardcoded hex colors in styles ───────────────────────────────
const HEX_RE = /#[0-9a-fA-F]{3,6}\b/;

function collectStringValues(obj, path = '') {
  const hits = [];
  if (obj === null || typeof obj !== 'object') return hits;
  for (const [key, val] of Object.entries(obj)) {
    const p = path ? `${path}.${key}` : key;
    if (typeof val === 'string') {
      if (HEX_RE.test(val)) hits.push({ path: p, val });
    } else if (typeof val === 'object') {
      hits.push(...collectStringValues(val, p));
    }
  }
  return hits;
}

const stylesHexHits = collectStringValues(theme.styles ?? {});
if (stylesHexHits.length === 0) {
  pass('No hardcoded hex colors found in styles');
} else {
  fail(`Hardcoded hex colors found in styles (use var:preset|color| or CSS custom properties):`);
  for (const h of stylesHexHits) {
    console.log(`         styles.${h.path}: ${h.val}`);
  }
}

// ── Check 8: defaultPalette false when custom palette exists ──────────────────
const customPalette = theme.settings?.color?.palette;
const defaultPalette = theme.settings?.color?.defaultPalette;
if (Array.isArray(customPalette) && customPalette.length > 0) {
  if (defaultPalette === undefined) {
    warn('settings.color.defaultPalette is not set; consider setting it to false to suppress default colors');
  } else if (defaultPalette === false) {
    pass('settings.color.defaultPalette is false (custom palette present)');
  } else {
    fail(`settings.color.defaultPalette should be false when a custom palette exists, got: ${JSON.stringify(defaultPalette)}`);
  }
} else {
  pass('settings.color.defaultPalette check skipped (no custom palette defined)');
}

// ── Check 9: fontFace src file:// entries exist on disk ───────────────────────
const fontFamilies = theme.settings?.typography?.fontFamilies ?? [];
let fontFaceFailures = 0;
for (const family of fontFamilies) {
  for (const face of family.fontFace ?? []) {
    for (const src of face.src ?? []) {
      if (typeof src === 'string' && src.startsWith('file:./')) {
        const rel = src.slice('file:./'.length);
        const abs = join(themeDir, rel);
        if (!existsSync(abs)) {
          fail(`Font file not found on disk: ${src} → ${abs}`);
          fontFaceFailures++;
        }
      }
    }
  }
}
if (fontFaceFailures === 0) {
  pass('All fontFace file:// src entries resolve to existing files');
}

// ── Check 10: templateParts slugs have matching .html files ──────────────────
const templateParts = theme.settings?.templateParts ?? [];
let tplFailures = 0;
for (const part of templateParts) {
  if (!part.slug) continue;
  const htmlPath = join(themeDir, 'parts', `${part.slug}.html`);
  if (!existsSync(htmlPath)) {
    fail(`templateParts slug "${part.slug}" has no matching file: parts/${part.slug}.html`);
    tplFailures++;
  }
}
if (tplFailures === 0 && templateParts.length > 0) {
  pass(`All ${templateParts.length} templateParts slug(s) have matching .html files in parts/`);
} else if (templateParts.length === 0) {
  pass('No templateParts defined (check skipped)');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed} checks passed, ${failed} failed.`);
process.exit(Math.min(failed, 127));
