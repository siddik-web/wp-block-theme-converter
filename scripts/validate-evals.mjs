#!/usr/bin/env node
/**
 * validate-evals.mjs
 *
 * Static checks for the `claude plugin eval` suite in evals/ — free and offline,
 * so CI catches a broken case without paying for a model run:
 *   - every case has a non-empty prompt and at least one grader
 *   - prompt.md and grader frontmatter use only known keys and grader types
 *   - regex patterns compile, limits are within what `claude plugin eval` accepts
 *   - every slash command in commands/ has a case under evals/commands/<name>/
 *
 * Usage: node scripts/validate-evals.mjs
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const EVALS = join(ROOT, 'evals');

const PROMPT_KEYS = new Set([
  'schema_version', 'name', 'description', 'tags', 'plugins', 'runs', 'expected_outcome', 'model',
  'max_turns', 'timeout_seconds', 'allowed_tools', 'append_system_prompt', 'env',
]);
const COMMON_GRADER_KEYS = ['type', 'weight', 'arm'];
const GRADER_KEYS = {
  regex: ['pattern', 'flags', 'match', 'target'],
  tool_used: ['tool', 'input_match', 'min', 'max'],
  tool_order: ['before', 'after'],
  file_exists: ['path', 'exists'],
  llm: ['criteria', 'focus'],
  baseline: ['baseline_file', 'criteria'],
};

let passed = 0;
let failed = 0;
const pass = (msg) => { console.log(`  PASS  ${msg}`); passed++; };
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failed++; };

// ── Minimal frontmatter parser ───────────────────────────────────────────────
// Covers what the suite uses: scalars, 'single'/"double" quoted strings, flow
// lists [a, b] and flow maps { k: v }. Anything fancier should fail loudly.
function parseScalar(raw) {
  const v = raw.trim();
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith('"') && v.endsWith('"')) return JSON.parse(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    return inner ? inner.split(',').map(parseScalar) : [];
  }
  if (v.startsWith('{') && v.endsWith('}')) {
    const obj = {};
    for (const pair of v.slice(1, -1).split(',')) {
      const i = pair.indexOf(':');
      if (i === -1) throw new Error(`bad flow map entry: ${pair}`);
      obj[pair.slice(0, i).trim()] = parseScalar(pair.slice(i + 1));
    }
    return obj;
  }
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

function parseFrontmatter(src, file) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!m) throw new Error(`${file}: missing --- frontmatter ---`);
  const meta = {};
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue;
    const i = line.indexOf(':');
    if (i === -1 || /^\s/.test(line)) throw new Error(`${file}: unsupported frontmatter line: ${line}`);
    meta[line.slice(0, i).trim()] = parseScalar(line.slice(i + 1));
  }
  return { meta, body: m[2].trim() };
}

/** Case directories: any directory under evals/ (except results/, mocks/) holding prompt.md. */
function findCases(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (!statSync(full).isDirectory() || entry === 'results' || entry === 'mocks') continue;
    if (existsSync(join(full, 'prompt.md')) || existsSync(join(full, 'case.yaml'))) out.push(full);
    else out.push(...findCases(full));
  }
  return out;
}

function checkRegex(where, pattern, flags) {
  try {
    new RegExp(pattern, flags ?? '');
    return true;
  } catch (err) {
    fail(`${where}: regex does not compile: ${err.message}`);
    return false;
  }
}

console.log('\nwp-block-theme-converter — eval suite check\n');

if (!existsSync(EVALS)) {
  fail('evals/ directory exists');
  process.exit(1);
}

const cases = findCases(EVALS);
console.log(`Check 1: each of ${cases.length} case(s) is well-formed`);
let caseFailures = 0;
for (const dir of cases) {
  const rel = relative(ROOT, dir);
  const before = failed;
  if (!existsSync(join(dir, 'prompt.md'))) {
    fail(`${rel}: only case.yaml cases are not checked by this script — add a prompt.md`);
    caseFailures++;
    continue;
  }
  try {
    const { meta, body } = parseFrontmatter(readFileSync(join(dir, 'prompt.md'), 'utf8'), `${rel}/prompt.md`);
    for (const k of Object.keys(meta)) if (!PROMPT_KEYS.has(k)) fail(`${rel}/prompt.md: unknown key "${k}"`);
    if (!body) fail(`${rel}/prompt.md: empty prompt body`);
    if (!Array.isArray(meta.tags) || meta.tags.length === 0) fail(`${rel}/prompt.md: add tags so the suite can be filtered`);
    if (meta.max_turns !== undefined && !(meta.max_turns >= 1 && meta.max_turns <= 200)) fail(`${rel}/prompt.md: max_turns must be 1–200`);
    if (meta.timeout_seconds !== undefined && !(meta.timeout_seconds >= 1 && meta.timeout_seconds <= 3600)) fail(`${rel}/prompt.md: timeout_seconds must be 1–3600`);
    if (meta.runs !== undefined && !(meta.runs >= 1 && meta.runs <= 50)) fail(`${rel}/prompt.md: runs must be 1–50`);

    const gdir = join(dir, 'graders');
    const graders = existsSync(gdir) ? readdirSync(gdir).filter(f => f.endsWith('.md')) : [];
    if (graders.length === 0) fail(`${rel}: no graders/*.md — the case would fail to load`);
    for (const g of graders) {
      const where = `${rel}/graders/${g}`;
      const { meta: gm, body: gbody } = parseFrontmatter(readFileSync(join(gdir, g), 'utf8'), where);
      const allowed = GRADER_KEYS[gm.type];
      if (!allowed) {
        fail(`${where}: unknown grader type "${gm.type}"`);
        continue;
      }
      for (const k of Object.keys(gm)) {
        if (!COMMON_GRADER_KEYS.includes(k) && !allowed.includes(k)) fail(`${where}: key "${k}" is not valid for type ${gm.type}`);
      }
      if (gm.arm !== undefined && !['with-only', 'both'].includes(gm.arm)) fail(`${where}: arm must be with-only or both`);
      if (gm.type === 'regex') {
        if (!gm.pattern) fail(`${where}: regex grader needs a pattern`);
        else checkRegex(where, gm.pattern, gm.flags);
        if (gm.match !== undefined && !/^(contains|not_contains|count:\d+)$/.test(gm.match)) fail(`${where}: match must be contains, not_contains, or count:N`);
        if (typeof gm.target === 'object' && (gm.target.source !== 'file' || !gm.target.path || gm.target.path.includes('..'))) {
          fail(`${where}: file target needs { source: file, path: <relative path> }`);
        }
      }
      if (gm.type === 'tool_used') {
        if (!gm.tool) fail(`${where}: tool_used grader needs a tool`);
        if (gm.input_match) checkRegex(where, gm.input_match);
      }
      if (gm.type === 'file_exists' && !gm.path) fail(`${where}: file_exists grader needs a path`);
      if (gm.type === 'llm' && !gbody && !gm.criteria) fail(`${where}: llm grader needs criteria (file body)`);
    }
  } catch (err) {
    fail(err.message);
  }
  if (failed > before) caseFailures++;
}
if (caseFailures === 0) pass(`All ${cases.length} cases are well-formed`);

// ── Check 2: every slash command has an eval case ────────────────────────────
console.log('\nCheck 2: every command in commands/ has a case in evals/commands/');
const commands = readdirSync(join(ROOT, 'commands')).filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
const missing = commands.filter(c => !existsSync(join(EVALS, 'commands', c, 'prompt.md')));
if (missing.length > 0) fail(`No eval case for: ${missing.map(c => `/${c}`).join(', ')} (add evals/commands/<name>/prompt.md)`);
else pass(`All ${commands.length} commands have an eval case`);

console.log('\n─────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
