#!/usr/bin/env node
/**
 * validate-skill.mjs
 *
 * Checks the structural integrity of the wp-block-theme-converter skill itself.
 * Run from the repo root: node scripts/validate-skill.mjs
 *
 * Exit 0 if all checks pass. Exit 1 if any check fails.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Helpers ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function pass(label) {
  console.log(`  PASS  ${label}`);
  passed++;
}

function fail(label, detail = '') {
  console.log(`  FAIL  ${label}${detail ? `\n        ${detail}` : ''}`);
  failed++;
}

function exists(relPath) {
  return existsSync(join(ROOT, relPath));
}

function readFile(relPath) {
  return readFileSync(join(ROOT, relPath), 'utf8');
}

function listFiles(relDir, ext = '.md') {
  const dir = join(ROOT, relDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith(ext));
}

// ─── Parse SKILL.md frontmatter ─────────────────────────────────────────────

function parseFrontmatter(src) {
  const lines = src.split('\n');
  if (lines[0].trim() !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const block = lines.slice(1, end).join('\n');
  const fields = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

// ─── Parse SKILL.md command/reference/template tables ───────────────────────

/**
 * Extract file paths from markdown pipe-tables.
 * Looks for cells containing a markdown link like [text](path).
 * Returns the raw link target strings.
 */
function extractLinksFromTable(src, headerPattern) {
  const lines = src.split('\n');
  const results = [];
  let inTable = false;
  let passedSeparator = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!inTable) {
      if (headerPattern.test(line)) {
        inTable = true;
        passedSeparator = false;
      }
      continue;
    }

    if (!line.startsWith('|')) {
      if (results.length > 0) break; // table ended
      continue;
    }

    // Separator row
    if (/^\|[-: |]+\|$/.test(line)) {
      passedSeparator = true;
      continue;
    }

    if (!passedSeparator) continue;

    // Data row — find all markdown links
    const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
    let m;
    while ((m = linkRe.exec(line)) !== null) {
      results.push(m[2]);
    }
  }

  return results;
}

/**
 * Extract template bullet list paths from SKILL.md.
 * Looks for lines like `- \`templates/...\`` or `- \`templates/.../...\``
 */
function extractTemplatePaths(src) {
  const re = /`(templates\/[^`]+)`/g;
  const results = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    results.push(m[1]);
  }
  return results;
}

// ─── Dead-link scanner ───────────────────────────────────────────────────────

/**
 * Scan a markdown file for relative links [text](path) and return any that
 * point to non-existent files. Skips http(s):// links and anchor-only links.
 */
function findDeadLinks(relFilePath) {
  const src = readFile(relFilePath);
  const dir = dirname(join(ROOT, relFilePath));
  const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g;
  const dead = [];
  let m;
  while ((m = linkRe.exec(src)) !== null) {
    const target = m[2];
    // Skip external and anchor-only
    if (target.startsWith('http://') || target.startsWith('https://')) continue;
    if (target.startsWith('#')) continue;
    // Strip fragment
    const path = target.split('#')[0];
    if (!path) continue;
    const abs = resolve(dir, path);
    if (!existsSync(abs)) {
      dead.push(target);
    }
  }
  return dead;
}

/**
 * Recursively collect all .md files under a directory (relative to ROOT).
 */
function collectMdFiles(relDir) {
  const results = [];
  const abs = join(ROOT, relDir);
  if (!existsSync(abs)) return results;
  function walk(dir, rel) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), join(rel, entry.name));
      } else if (entry.name.endsWith('.md')) {
        results.push(join(rel, entry.name));
      }
    }
  }
  walk(abs, relDir);
  return results;
}

// ─── Run checks ─────────────────────────────────────────────────────────────

console.log('\nwp-block-theme-converter — skill integrity check\n');

// ── Check 1: SKILL.md exists and has valid YAML frontmatter ─────────────────
console.log('Check 1: SKILL.md exists and has valid YAML frontmatter');
let skillSrc = '';
let frontmatter = null;

if (!exists('SKILL.md')) {
  fail('SKILL.md exists', 'File not found');
} else {
  skillSrc = readFile('SKILL.md');
  frontmatter = parseFrontmatter(skillSrc);
  if (!frontmatter) {
    fail('SKILL.md frontmatter', 'Does not start with --- or missing closing ---');
  } else if (!frontmatter.name) {
    fail('SKILL.md frontmatter has name:', 'Missing "name:" field');
  } else if (!frontmatter.description) {
    fail('SKILL.md frontmatter has description:', 'Missing "description:" field');
  } else {
    pass('SKILL.md exists with valid frontmatter (name + description present)');
  }
}

// ── Check 2: Every command listed in SKILL.md command table exists ───────────
console.log('\nCheck 2: Every command listed in SKILL.md exists in commands/');
{
  const commandLinks = extractLinksFromTable(skillSrc, /\|\s*Command\s*\|/i);
  const commandFiles = commandLinks.filter(l => l.startsWith('commands/'));
  if (commandFiles.length === 0) {
    fail('Command table parsed', 'No commands/... links found in SKILL.md command table');
  } else {
    let allOk = true;
    for (const f of commandFiles) {
      if (!exists(f)) {
        fail(`commands file exists: ${f}`);
        allOk = false;
      }
    }
    if (allOk) pass(`All ${commandFiles.length} command files listed in SKILL.md exist`);
  }
}

// ── Check 3: Every reference listed in SKILL.md reference table exists ───────
console.log('\nCheck 3: Every reference listed in SKILL.md exists in references/');
{
  const refLinks = extractLinksFromTable(skillSrc, /\|\s*File\s*\|/i);
  const refFiles = refLinks.filter(l => l.startsWith('references/'));
  // Also look for backtick references in the table (not hyperlinked)
  const backtickRe = /`(references\/[^`]+\.md)`/g;
  let bm;
  const backtickRefs = [];
  while ((bm = backtickRe.exec(skillSrc)) !== null) {
    backtickRefs.push(bm[1]);
  }
  const allRefs = [...new Set([...refFiles, ...backtickRefs])];

  if (allRefs.length === 0) {
    fail('Reference table parsed', 'No references/... entries found in SKILL.md reference table');
  } else {
    let allOk = true;
    for (const f of allRefs) {
      if (!exists(f)) {
        fail(`reference file exists: ${f}`);
        allOk = false;
      }
    }
    if (allOk) pass(`All ${allRefs.length} reference files listed in SKILL.md exist`);
  }
}

// ── Check 4: Every template listed in SKILL.md exists ───────────────────────
console.log('\nCheck 4: Every template listed in SKILL.md exists in templates/');
{
  const templatePaths = extractTemplatePaths(skillSrc);
  if (templatePaths.length === 0) {
    fail('Template list parsed', 'No templates/... entries found in SKILL.md');
  } else {
    let allOk = true;
    for (const f of templatePaths) {
      if (!exists(f)) {
        fail(`template file exists: ${f}`);
        allOk = false;
      }
    }
    if (allOk) pass(`All ${templatePaths.length} template files listed in SKILL.md exist`);
  }
}

// ── Check 5: No dead internal links in any .md file ─────────────────────────
console.log('\nCheck 5: No dead internal links in any .md file');
{
  const scanDirs = ['commands', 'references', 'agents', 'evals', '.github'];
  const mdFiles = [
    'SKILL.md',
    'CONTRIBUTING.md',
    'CHANGELOG.md',
    ...collectMdFiles('commands'),
    ...collectMdFiles('references'),
    ...collectMdFiles('agents'),
    ...collectMdFiles('evals'),
    ...collectMdFiles('.github'),
  ];

  let anyDead = false;
  for (const f of mdFiles) {
    if (!exists(f)) continue;
    const dead = findDeadLinks(f);
    if (dead.length > 0) {
      fail(`No dead links in ${f}`, `Dead: ${dead.join(', ')}`);
      anyDead = true;
    }
  }
  if (!anyDead) pass(`No dead internal links found across ${mdFiles.length} .md files`);
}

// ── Check 6: SKILL.md description between 50 and 500 chars ──────────────────
console.log('\nCheck 6: SKILL.md description field length (50–500 chars)');
{
  if (!frontmatter || !frontmatter.description) {
    fail('description field accessible', 'frontmatter not parsed or missing description');
  } else {
    const len = frontmatter.description.length;
    if (len < 50) {
      fail(`description length ${len}`, `Too short (min 50 chars)`);
    } else if (len > 2000) {
      fail(`description length ${len}`, `Too long (max 2000 chars)`);
    } else {
      pass(`description length OK (${len} chars)`);
    }
  }
}

// ── Check 7: Every .md in commands/ is listed in SKILL.md ───────────────────
console.log('\nCheck 7: Every .md in commands/ is listed in SKILL.md');
{
  const onDisk = listFiles('commands');
  let allOk = true;
  for (const f of onDisk) {
    const relPath = `commands/${f}`;
    if (!skillSrc.includes(relPath)) {
      fail(`commands/${f} listed in SKILL.md`, `Not found in SKILL.md`);
      allOk = false;
    }
  }
  if (allOk) pass(`All ${onDisk.length} command files in commands/ are listed in SKILL.md`);
}

// ── Check 8: CHANGELOG.md, LICENSE, CONTRIBUTING.md exist ───────────────────
console.log('\nCheck 8: CHANGELOG.md, LICENSE, and CONTRIBUTING.md exist');
{
  const required = ['CHANGELOG.md', 'LICENSE', 'CONTRIBUTING.md'];
  let allOk = true;
  for (const f of required) {
    if (!exists(f)) {
      fail(`${f} exists`);
      allOk = false;
    }
  }
  if (allOk) pass('CHANGELOG.md, LICENSE, and CONTRIBUTING.md all present');
}

// ── Check 9: scripts/doctor.mjs exists ──────────────────────────────────────
console.log('\nCheck 9: scripts/doctor.mjs exists');
{
  if (!exists('scripts/doctor.mjs')) {
    fail('scripts/doctor.mjs exists');
  } else {
    pass('scripts/doctor.mjs exists');
  }
}

// ── Check 10: Claude Code plugin manifest exists ────────────────────────────
console.log('\nCheck 10: .claude-plugin/plugin.json exists (Claude Code plugin)');
{
  if (!exists('.claude-plugin/plugin.json')) {
    fail('.claude-plugin/plugin.json exists');
  } else {
    try {
      const m = JSON.parse(readFile('.claude-plugin/plugin.json'));
      if (!m.name) fail('plugin.json has a name field');
      else pass(`plugin manifest present (name: ${m.name})`);
    } catch (err) {
      fail('.claude-plugin/plugin.json is valid JSON', err.message);
    }
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n─────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\nSkill validation FAILED. Fix the issues above before submitting.\n');
  process.exit(1);
} else {
  console.log('\nSkill validation PASSED.\n');
  process.exit(0);
}
