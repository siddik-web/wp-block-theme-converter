#!/usr/bin/env node
/**
 * build-session.mjs
 *
 * Condenses a recorded `claude -p --output-format stream-json --verbose` run into the small,
 * path-scrubbed session.json that render-demo.mjs plays back as the terminal scene. Nothing is
 * invented: every line shown comes from the recording (tool calls, the doctor's real output, the
 * model's real closing message). Consecutive calls to the same tool are grouped to keep the video short.
 *
 * Usage: node scripts/demo/build-session.mjs <events.jsonl> <run-dir> <out session.json> [--prompt prompt.txt]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const [eventsPath, runDir, outPath] = args;
const promptPath = args.includes('--prompt') ? args[args.indexOf('--prompt') + 1] : null;
if (!eventsPath || !runDir || !outPath) {
  console.error('usage: build-session.mjs <events.jsonl> <run-dir> <out.json> [--prompt prompt.txt]');
  process.exit(2);
}

const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const RUN = resolve(runDir);

/** Replace machine-specific absolute paths so nothing about the recording environment leaks. */
const scrub = (s) => String(s)
  .replaceAll(`${RUN}/`, '')
  .replaceAll(RUN, '.')
  .replaceAll(`${PLUGIN_ROOT}/`, '${CLAUDE_PLUGIN_ROOT}/')
  .replaceAll(PLUGIN_ROOT, '${CLAUDE_PLUGIN_ROOT}');

const events = readFileSync(eventsPath, 'utf8').split('\n').filter(Boolean).flatMap((l) => {
  try { return [JSON.parse(l)]; } catch { return []; }
});

const results = new Map(); // tool_use_id -> { text, isError }
for (const e of events) {
  if (e.type !== 'user') continue;
  for (const c of e.message?.content ?? []) {
    if (c.type !== 'tool_result') continue;
    const text = typeof c.content === 'string' ? c.content : (c.content ?? []).map((p) => p.text ?? '').join('\n');
    results.set(c.tool_use_id, { text, isError: !!c.is_error });
  }
}

const label = (name, input) => {
  const path = input.file_path ?? input.path ?? input.pattern ?? '';
  if (name === 'Skill') return String(input.skill ?? '');
  if (name !== 'Bash') return scrub(path).replace(/^\.\//, '');
  // First meaningful line of a shell command, without `set -e` and a leading `cd … &&`.
  const lines = scrub(input.command ?? '').split('\n').map((l) => l.trim())
    .filter((l) => l && l !== 'set -e' && !/^cd [^;&|]+$/.test(l));
  const first = (lines[0] ?? '').replace(/^cd [^;&]+&&\s*/, '').replace(/^pwd && /, '');
  return (/^python3 -\s*(<<|$)/.test(first) ? 'python3 (inline script)' : first).slice(0, 96);
};

/** Files a shell command writes with `cat > path <<EOF`: shown as Write lines, as they are. */
const heredocWrites = (command) => [...scrub(command).matchAll(/cat\s*>>?\s*"?([^\s"<]+)"?\s*<</g)]
  .map((m) => m[1].replace(/^\.\//, '').replace(/^\$\{?\w+\}?\//, ''));

/**
 * Files a shell command only reads (`cat a b`, `sed -n … file`): shown as Read lines. Returns [] when the
 * command is not a plain read, or null for reads of the recording environment's own files (hidden).
 */
const readsOf = (command) => {
  const first = command.split('\n').map((l) => l.trim()).find((l) => l && l !== 'set -e' && !/^cd [^;&|]+$/.test(l)) ?? '';
  const m = /^(?:cd [^;&]+&&\s*)?(?:pwd && )?cat\s+([^;&|<>]+)/.exec(first);
  if (!m) return [];
  const files = m[1].trim().split(/\s+/).filter((f) => !f.startsWith('-')).map((f) => f.replace(/^\$\{?\w+\}?\//, ''));
  return files.some((f) => f.startsWith('/root/') || f.startsWith('/tmp/')) ? null : files;
};

const steps = [];
const push = (step) => {
  const last = steps.at(-1);
  // Group runs of the same non-Bash tool into one line: "Write × 17  theme.json, style.css, …".
  if (step.t === 'tool' && last?.t === 'tool' && last.name === step.name && step.name !== 'Bash') {
    last.count += 1;
    last.items.push(step.items[0]);
  } else {
    steps.push(step);
  }
};

for (const e of events) {
  if (e.type !== 'assistant') continue;
  for (const c of e.message?.content ?? []) {
    if (c.type === 'text' && c.text.trim()) {
      push({ t: 'say', text: scrub(c.text.trim()) });
    } else if (c.type === 'tool_use') {
      const command = c.name === 'Bash' ? scrub(c.input?.command ?? '') : '';
      const doctor = /scripts\/doctor\.mjs"?\s+(\S+)/.exec(command);
      for (const file of c.name === 'Bash' ? heredocWrites(command) : []) {
        push({ t: 'tool', name: 'Write', count: 1, items: [file], doctor: false });
      }
      if (doctor) {
        const dir = doctor[1].replace(/^\.\//, '');
        push({ t: 'tool', name: 'Bash', count: 1, items: [`node "\${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" ${dir}`], doctor: true });
        const r = results.get(c.id);
        const lines = scrub(r?.text ?? '').split('\n').map((l) => l.replace(/\s+$/, ''));
        // Keep the summary table and the overall line: the part a viewer can read at video speed.
        const start = lines.findIndex((l) => l.startsWith('┌'));
        const table = start === -1 ? [] : lines.slice(start).filter(Boolean);
        steps.push({ t: 'out', lines: table.length ? table : lines.filter(Boolean).slice(-8) });
      } else if (c.name === 'Bash' && heredocWrites(command).length === 0) {
        const read = readsOf(command);
        if (read === null) continue; // plumbing that is not interesting on screen
        if (read.length) for (const f of read) push({ t: 'tool', name: 'Read', count: 1, items: [f], doctor: false });
        else push({ t: 'tool', name: 'Bash', count: 1, items: [label(c.name, c.input ?? {})], doctor: false });
      } else if (c.name !== 'Bash') {
        push({ t: 'tool', name: c.name, count: 1, items: [label(c.name, c.input ?? {})], doctor: false });
      }
    }
  }
}

const result = events.filter((e) => e.type === 'result').at(-1);
const final = scrub(result?.result ?? '').split('\n').filter((l) => l.trim());

const session = {
  command: '/wp-block-theme-converter:convert-to-wp-theme',
  prompt: promptPath ? scrub(readFileSync(promptPath, 'utf8')).split('\n').slice(1).filter((l) => l.trim()) : [],
  turns: result?.num_turns ?? null,
  costUsd: result?.total_cost_usd ?? null,
  doctorRuns: steps.filter((s) => s.t === 'out').length,
  steps,
  final,
};

writeFileSync(outPath, `${JSON.stringify(session, null, 2)}\n`);
console.log(`${steps.length} steps (${steps.filter((s) => s.t === 'tool').length} tool lines, ${session.doctorRuns} doctor run(s)) → ${outPath}`);
