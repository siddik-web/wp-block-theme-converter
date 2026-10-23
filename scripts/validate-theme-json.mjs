#!/usr/bin/env node
// Validate a WordPress block theme's theme.json against production-readiness rules.

import { readFileSync, existsSync, readdirSync } from 'fs';
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

// ── Check 4: $schema points at the official WordPress schema ─────────────────
const SCHEMA_RE = /^https:\/\/schemas\.wp\.org\/(?:trunk|wp\/\d+\.\d+)\/theme\.json$/;
if (typeof theme.$schema !== 'string' || theme.$schema.length === 0) {
  fail('$schema key is missing or empty');
} else if (SCHEMA_RE.test(theme.$schema)) {
  pass('$schema points at schemas.wp.org');
} else {
  fail(`$schema should be https://schemas.wp.org/trunk/theme.json (or /wp/X.Y/theme.json), got: ${theme.$schema}`);
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

// ── Check 7: No hardcoded colors in styles ──────────────────────────────────
// Hex (#rgb, #rgba, #rrggbb, #rrggbbaa) and functional notation (rgb/hsl/…).
const HEX_RE = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b|\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\s*\(/i;

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
  pass('No hardcoded colors found in styles');
} else {
  fail(`Hardcoded colors found in styles (use var:preset|color| or CSS custom properties):`);
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

// ── Check 10: templateParts names have matching .html files ──────────────────
// templateParts / customTemplates are top-level keys; WordPress ignores them under settings.
for (const key of ['templateParts', 'customTemplates']) {
  if (theme.settings?.[key] !== undefined) {
    fail(`settings.${key} is ignored by WordPress — move it to the top level of theme.json`);
  }
}
const templateParts = theme.templateParts ?? [];
let tplFailures = 0;
for (const part of templateParts) {
  // theme.json keys template parts by "name" (the parts/ filename without .html).
  const name = part.name ?? part.slug;
  if (!name) continue;
  const htmlPath = join(themeDir, 'parts', `${name}.html`);
  if (!existsSync(htmlPath)) {
    fail(`templateParts name "${name}" has no matching file: parts/${name}.html`);
    tplFailures++;
  }
}
if (tplFailures === 0 && templateParts.length > 0) {
  pass(`All ${templateParts.length} templateParts have matching .html files in parts/`);
} else if (templateParts.length === 0) {
  pass('No templateParts defined (check skipped)');
}

// ── Check 11: customTemplates names have matching .html files ────────────────
const customTemplates = theme.customTemplates ?? [];
let customTplFailures = 0;
for (const tpl of customTemplates) {
  if (!tpl.name) continue;
  if (!existsSync(join(themeDir, 'templates', `${tpl.name}.html`))) {
    fail(`customTemplates name "${tpl.name}" has no matching file: templates/${tpl.name}.html`);
    customTplFailures++;
  }
}
if (customTplFailures === 0) {
  pass(customTemplates.length > 0
    ? `All ${customTemplates.length} customTemplates have matching .html files in templates/`
    : 'No customTemplates defined (check skipped)');
}

// ── Check 12: style variations (styles/*.json) ───────────────────────────────
const stylesDir = join(themeDir, 'styles');
const variationFiles = existsSync(stylesDir)
  ? readdirSync(stylesDir, { recursive: true }).filter(f => String(f).endsWith('.json'))
  : [];
let variationFailures = 0;
for (const f of variationFiles) {
  const rel = `styles/${f}`;
  let variation;
  try {
    variation = JSON.parse(readFileSync(join(stylesDir, String(f)), 'utf8'));
  } catch (err) {
    fail(`${rel} is not valid JSON: ${err.message}`);
    variationFailures++;
    continue;
  }
  if (variation.version !== 3) {
    fail(`${rel}: version must be 3, got: ${JSON.stringify(variation.version)}`);
    variationFailures++;
  }
  if (!variation.title) {
    fail(`${rel}: missing "title" (required for the variation to appear in the Site Editor)`);
    variationFailures++;
  }
  const hits = collectStringValues(variation.styles ?? {});
  if (hits.length > 0) {
    fail(`${rel}: hardcoded colors found in styles (use var:preset|color|):`);
    for (const h of hits) console.log(`         styles.${h.path}: ${h.val}`);
    variationFailures++;
  }
}
if (variationFailures === 0) {
  pass(variationFiles.length > 0
    ? `All ${variationFiles.length} style variation(s) in styles/ are valid`
    : 'No style variations in styles/ (check skipped)');
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${passed} checks passed, ${failed} failed.`);
process.exit(Math.min(failed, 127));
