#!/usr/bin/env node
/**
 * theme-json-postwrite.mjs
 *
 * PostToolUse hook (Write|Edit). When the edited file is a `theme.json`, run the
 * bundled theme.json validator against its directory and surface any failures
 * back to Claude as advisory context.
 *
 * This hook is ALWAYS non-blocking: it exits 0 no matter what, and stays silent
 * unless the touched file is a theme.json with validation problems. Files that
 * are not theme.json return immediately.
 *
 * Input: PostToolUse event JSON on stdin.
 * Output: optional `hookSpecificOutput.additionalContext` JSON on stdout.
 */

import { spawnSync } from 'node:child_process';
import { dirname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const VALIDATOR = resolve(HERE, '..', 'validate-theme-json.mjs');

function emit(additionalContext) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext,
      },
    }),
  );
}

function readStdin() {
  return new Promise((res) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (data += c));
    process.stdin.on('end', () => res(data));
    // If nothing is piped in, don't hang.
    setTimeout(() => res(data), 2000).unref?.();
  });
}

const raw = await readStdin();

let event;
try {
  event = JSON.parse(raw);
} catch {
  process.exit(0); // No parseable input — nothing to do.
}

const filePath = event?.tool_input?.file_path;
if (!filePath || basename(filePath) !== 'theme.json') {
  process.exit(0); // Not a theme.json edit — stay silent.
}

const themeDir = dirname(filePath);
const result = spawnSync(process.execPath, [VALIDATOR, themeDir], {
  encoding: 'utf8',
});

// Exit code > 0 means the validator found problems.
if (result.status && result.status > 0) {
  const out = `${result.stdout || ''}${result.stderr || ''}`.trim();
  emit(
    'The bundled theme.json validator reported issues with the file you just ' +
      `edited (${filePath}). Review and fix before continuing:\n\n${out}`,
  );
}

process.exit(0);
