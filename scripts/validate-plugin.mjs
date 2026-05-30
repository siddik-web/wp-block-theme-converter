#!/usr/bin/env node
/**
 * validate-plugin.mjs
 *
 * Checks the Claude Code plugin packaging: the manifest, the marketplace entry,
 * and the presence of every declared/auto-discovered component.
 * Run from the repo root: node scripts/validate-plugin.mjs
 *
 * Exit 0 if all checks pass. Exit 1 if any check fails.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

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

function exists(rel) {
  return existsSync(join(ROOT, rel));
}

function readJson(rel) {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8'));
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

console.log('\nwp-block-theme-converter — plugin packaging check\n');

// ── Check 1: plugin.json exists and is valid JSON ──────────────────────────
console.log('Check 1: .claude-plugin/plugin.json exists and is valid JSON');
let manifest = null;
if (!exists('.claude-plugin/plugin.json')) {
  fail('.claude-plugin/plugin.json exists', 'File not found');
} else {
  try {
    manifest = readJson('.claude-plugin/plugin.json');
    pass('.claude-plugin/plugin.json is valid JSON');
  } catch (err) {
    fail('.claude-plugin/plugin.json is valid JSON', err.message);
  }
}

// ── Check 2: manifest required + recommended fields ────────────────────────
console.log('\nCheck 2: plugin.json has a valid name and metadata');
if (manifest) {
  if (!manifest.name) {
    fail('plugin.json has name', 'Missing required "name" field');
  } else if (!KEBAB.test(manifest.name)) {
    fail('plugin.json name is kebab-case', `Got "${manifest.name}"`);
  } else {
    pass(`plugin.json name OK ("${manifest.name}")`);
  }
  for (const field of ['version', 'description', 'license']) {
    if (manifest[field]) pass(`plugin.json has ${field}`);
    else fail(`plugin.json has ${field}`, 'Recommended field missing');
  }
}

// ── Check 3: components exist (auto-discovered locations) ──────────────────
console.log('\nCheck 3: declared / auto-discovered components exist');
{
  // Skill: standalone SKILL.md at plugin root.
  if (exists('SKILL.md')) pass('skill: SKILL.md present at plugin root');
  else fail('skill: SKILL.md present at plugin root');

  // Commands.
  const cmdDir = join(ROOT, 'commands');
  if (existsSync(cmdDir)) {
    const cmds = readdirSync(cmdDir).filter((f) => f.endsWith('.md'));
    if (cmds.length > 0) pass(`commands/: ${cmds.length} command files`);
    else fail('commands/: at least one .md command', 'Directory is empty');
  } else {
    fail('commands/ directory exists');
  }

  // Agents.
  if (exists('agents') && readdirSync(join(ROOT, 'agents')).some((f) => f.endsWith('.md'))) {
    pass('agents/: at least one agent file');
  } else {
    fail('agents/: at least one agent file');
  }

  // Hooks.
  if (exists('hooks/hooks.json')) {
    try {
      readJson('hooks/hooks.json');
      pass('hooks/hooks.json is valid JSON');
    } catch (err) {
      fail('hooks/hooks.json is valid JSON', err.message);
    }
  } else {
    fail('hooks/hooks.json exists');
  }
}

// ── Check 4: every command has a description in frontmatter ────────────────
console.log('\nCheck 4: every command declares a description in frontmatter');
{
  const cmdDir = join(ROOT, 'commands');
  if (existsSync(cmdDir)) {
    let allOk = true;
    for (const f of readdirSync(cmdDir).filter((x) => x.endsWith('.md'))) {
      const src = readFileSync(join(cmdDir, f), 'utf8');
      const fmMatch = src.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch || !/^description:\s*\S/m.test(fmMatch[1])) {
        fail(`commands/${f} has description frontmatter`);
        allOk = false;
      }
    }
    if (allOk) pass('all commands declare a description');
  }
}

// ── Check 5: marketplace.json is valid and self-consistent ─────────────────
console.log('\nCheck 5: .claude-plugin/marketplace.json is valid');
if (!exists('.claude-plugin/marketplace.json')) {
  fail('.claude-plugin/marketplace.json exists');
} else {
  try {
    const mk = readJson('.claude-plugin/marketplace.json');
    if (!mk.name || !KEBAB.test(mk.name)) fail('marketplace name is kebab-case', `Got "${mk.name}"`);
    else pass(`marketplace name OK ("${mk.name}")`);
    if (!mk.owner || !mk.owner.name) fail('marketplace owner.name present');
    else pass('marketplace owner.name present');
    if (!Array.isArray(mk.plugins) || mk.plugins.length === 0) {
      fail('marketplace plugins array non-empty');
    } else {
      pass(`marketplace lists ${mk.plugins.length} plugin(s)`);
      const entry = mk.plugins.find((p) => p.name === (manifest && manifest.name));
      if (!entry) fail('marketplace lists this plugin', `No entry named "${manifest && manifest.name}"`);
      else if (!entry.source) fail('marketplace entry has a source');
      else pass('marketplace entry resolves to this plugin');
    }
  } catch (err) {
    fail('.claude-plugin/marketplace.json is valid JSON', err.message);
  }
}

// ─── Summary ────────────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log('\nPlugin validation FAILED. Fix the issues above before publishing.\n');
  process.exit(1);
} else {
  console.log('\nPlugin validation PASSED.\n');
  process.exit(0);
}
