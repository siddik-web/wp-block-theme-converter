#!/usr/bin/env node
// Validate block pattern PHP files for required header fields and slug conventions.

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join, extname, relative, basename } from 'path';

const themeDir = resolve(process.argv[2] ?? '.');
const patternsDir = join(themeDir, 'patterns');

/** Recursively collect .php files under a directory. */
function collectPhpFiles(dir) {
  if (!existsSync(dir)) return [];
  const results = [];
  for (const entry of readdirSync(dir)) {
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

const files = collectPhpFiles(patternsDir);

let totalViolations = 0;

/** Extract the first 20 lines of a file as a single string. */
function getHeader(src) {
  return src.split('\n').slice(0, 20).join('\n');
}

/** Extract a header field value, e.g. "Title: My Pattern" → "My Pattern". */
function extractField(header, field) {
  const re = new RegExp(`^\\s*\\*?\\s*${field}:\\s*(.+)$`, 'mi');
  const m = re.exec(header);
  return m ? m[1].trim() : null;
}

const seenSlugs = new Map(); // slug → file path

function report(file, message) {
  const rel = relative(themeDir, file);
  console.log(`${rel}: ${message}`);
  totalViolations++;
}

if (!existsSync(patternsDir)) {
  console.log(`patterns/ directory not found at ${patternsDir} — nothing to check.`);
  process.exit(0);
}

if (files.length === 0) {
  console.log('No .php files found in patterns/ — nothing to check.');
  process.exit(0);
}

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  const header = getHeader(src);

  // Check: Title present
  const title = extractField(header, 'Title');
  if (!title) {
    report(file, 'Missing "Title:" in header comment block');
  }

  // Check: Slug present
  const slug = extractField(header, 'Slug');
  if (!slug) {
    report(file, 'Missing "Slug:" in header comment block');
  } else {
    // Check: Slug format — must be namespaced (contain a slash or dash-namespace)
    // WordPress block pattern slugs should be "namespace/pattern-name"
    if (!slug.includes('/')) {
      report(file, `Slug "${slug}" appears to lack a namespace — expected format: theme-slug/pattern-name`);
    }

    // Check: duplicate slugs
    if (seenSlugs.has(slug)) {
      report(file, `Duplicate slug "${slug}" — already defined in ${relative(themeDir, seenSlugs.get(slug))}`);
    } else {
      seenSlugs.set(slug, file);
    }
  }

  // Check: Categories present
  const categories = extractField(header, 'Categories');
  if (!categories) {
    report(file, 'Missing "Categories:" in header comment block');
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\nChecked ${files.length} pattern file(s). ${totalViolations} violation(s) found.`);
process.exit(Math.min(totalViolations, 127));
