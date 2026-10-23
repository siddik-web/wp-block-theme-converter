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

// Claude Code substitutes this in skill, command, and agent Markdown with the
// plugin's install path. It is NOT exported to the Bash tool's environment.
const PLUGIN_ROOT_VAR = '${CLAUDE_PLUGIN_ROOT}';

// Agent Skills spec limit for `description` (enforced on claude.ai / .skill upload;
// Claude Code additionally truncates description + when_to_use at 1,536 chars).
const MAX_DESCRIPTION = 1024;

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
  // Plugin-file paths are written as ${CLAUDE_PLUGIN_ROOT}/<path> (see Check 11);
  // strip the prefix so the checks below see repo-relative paths.
  skillSrc = readFile('SKILL.md').replaceAll(`${PLUGIN_ROOT_VAR}/`, '');
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

// ── Check 6: SKILL.md description length and slash-command coverage ─────────
console.log(`\nCheck 6: SKILL.md description is 50–${MAX_DESCRIPTION} chars and names every command`);
{
  if (!frontmatter || !frontmatter.description) {
    fail('description field accessible', 'frontmatter not parsed or missing description');
  } else {
    const desc = frontmatter.description;
    if (desc.length < 50) {
      fail(`description length ${desc.length}`, 'Too short (min 50 chars)');
    } else if (desc.length > MAX_DESCRIPTION) {
      fail(`description length ${desc.length}`, `Too long (max ${MAX_DESCRIPTION} chars, the Agent Skills limit)`);
    } else {
      pass(`description length OK (${desc.length} chars)`);
    }
    // Every slash command must appear so natural-language triggers route to it.
    const missing = listFiles('commands')
      .map(f => `/${f.replace(/\.md$/, '')}`)
      .filter(cmd => !new RegExp(`${cmd.replace(/[-/]/g, '\\$&')}(?![\\w-])`).test(desc));
    if (missing.length > 0) {
      fail('description names every slash command', `Missing: ${missing.join(', ')}`);
    } else {
      pass('description names every slash command');
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

// ── Check 11: plugin-file paths resolve from the plugin root ────────────────
// Installed, Claude's working directory is the user's project, so a bare
// `references/x.md` or `node scripts/x.mjs` points at the wrong place. Paths to
// plugin files in skill/command/agent Markdown must use ${CLAUDE_PLUGIN_ROOT}.
console.log(`\nCheck 11: plugin-file paths in SKILL.md, commands/, agents/ use ${PLUGIN_ROOT_VAR}`);
{
  const PLUGIN_PATH = String.raw`(?:references/[\w-]+\.md|commands/[\w-]+\.md|examples/[\w-]+\.md|templates/[\w/.-]+\.tpl|scripts/[\w/.-]+\.(?:mjs|sh))`;
  const bareRe = new RegExp(String.raw`(?<![\[/])\`` + PLUGIN_PATH + '`|node scripts/', 'g');
  const files = ['SKILL.md', ...collectMdFiles('commands'), ...collectMdFiles('agents')];
  let allOk = true;
  for (const f of files) {
    const lines = readFile(f).split('\n');
    lines.forEach((line, i) => {
      for (const m of line.matchAll(bareRe)) {
        fail(`${f}:${i + 1} uses ${PLUGIN_ROOT_VAR}`, `Bare plugin path ${m[0]} — write ${PLUGIN_ROOT_VAR}/${m[0].replace(/^`|`$/g, '').replace(/^node /, '')}`);
        allOk = false;
      }
      // $CLAUDE_PLUGIN_ROOT (no braces) is neither substituted nor set in Bash.
      if (/\$CLAUDE_PLUGIN_ROOT\b/.test(line)) {
        fail(`${f}:${i + 1} uses ${PLUGIN_ROOT_VAR}`, 'Write ${CLAUDE_PLUGIN_ROOT} with braces; $CLAUDE_PLUGIN_ROOT is not substituted');
        allOk = false;
      }
    });
  }
  if (allOk) pass(`All plugin-file paths in ${files.length} files use ${PLUGIN_ROOT_VAR}`);
}

// ── Check 12: version is identical everywhere and has a CHANGELOG entry ─────
console.log('\nCheck 12: SKILL.md, plugin.json, marketplace.json, README, and CHANGELOG agree on the version');
{
  const versions = {};
  versions['SKILL.md'] = frontmatter?.version;
  try { versions['.claude-plugin/plugin.json'] = JSON.parse(readFile('.claude-plugin/plugin.json')).version; } catch { /* Check 10 reports */ }
  try {
    const entry = JSON.parse(readFile('.claude-plugin/marketplace.json')).plugins?.[0];
    versions['.claude-plugin/marketplace.json'] = entry?.version;
  } catch { /* validate-plugin reports */ }
  versions['README.md'] = /\*\*Version:\*\*\s*(\S+)/.exec(readFile('README.md'))?.[1];

  const distinct = new Set(Object.values(versions));
  if (distinct.size !== 1 || distinct.has(undefined)) {
    fail('versions match', Object.entries(versions).map(([f, v]) => `${f}=${v}`).join(', '));
  } else {
    const version = [...distinct][0];
    pass(`all four files say ${version}`);
    const changelog = readFile('CHANGELOG.md');
    if (new RegExp(`^## \\[${version.replace(/\./g, '\\.')}\\]`, 'm').test(changelog)) {
      pass(`CHANGELOG.md has a [${version}] entry`);
    } else {
      fail(`CHANGELOG.md has a [${version}] entry`, 'Add a "## [x.y.z] — date" heading (not only [Unreleased]) for the version you are shipping');
    }
  }
}

// ── Check 13: repo paths named in prose exist ───────────────────────────────
// The link checker only sees [text](url) links, so a stale `examples/foo.md` in
// backticks (as CHANGELOG once had) slipped through.
console.log('\nCheck 13: backticked repo paths in docs point at files that exist');
{
  const PATH_RE = /^(?:examples|references|templates|scripts|commands|agents|evals|hooks|\.claude-plugin|\.github)\/[\w./-]+\.\w+$/;
  const docs = ['README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', 'scripts/README.md', 'evals/README.md', 'SKILL.md',
    ...collectMdFiles('commands'), ...collectMdFiles('agents')];
  let allOk = true;
  for (const f of docs) {
    if (!exists(f)) continue;
    // Changelog history may legitimately name files that were later removed or renamed.
    const text = readFile(f).replaceAll(`${PLUGIN_ROOT_VAR}/`, '');
    const section = f === 'CHANGELOG.md' ? text.split(/^## \[2\.0\.0\]/m)[0] : text;
    for (const m of section.matchAll(/`([^`\s]+)`/g)) {
      const ref = m[1];
      if (!PATH_RE.test(ref) || /[*<>{}]|_generated|\/results\//.test(ref)) continue;
      // templates/ in prose usually means the generated theme's templates/*.html; only .tpl files live here.
      if (ref.startsWith('templates/') && !ref.endsWith('.tpl')) continue;
      if (!exists(ref)) {
        fail(`${f} references ${ref}`, 'File does not exist');
        allOk = false;
      }
    }
  }
  if (allOk) pass(`All backticked repo paths in ${docs.length} docs exist`);
}

// ── Check 14: commands that generate a whole theme tell Claude to run the doctor ──
// SKILL.md's Step 5 does not drive a slash-command run; the command file does. Without
// this, a /convert-to-wp-theme run can finish with a theme that fails the doctor.
console.log('\nCheck 14: theme-generating commands require running doctor.mjs');
{
  const GENERATORS = ['convert-to-wp-theme', 'scaffold-wp-theme', 'wp-classic-to-fse'];
  let allOk = true;
  for (const name of GENERATORS) {
    const f = `commands/${name}.md`;
    if (!exists(f)) continue;
    const src = readFile(f);
    if (!/scripts\/doctor\.mjs/.test(src) || !/exits? 0|until it passes/i.test(src)) {
      fail(`${f} runs doctor.mjs until it passes`, 'Add a Verify step: run the doctor and fix violations until it exits 0');
      allOk = false;
    }
  }
  if (allOk) pass(`All ${GENERATORS.length} theme-generating commands require a passing doctor run`);
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
