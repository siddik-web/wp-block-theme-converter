#!/usr/bin/env node
// Umbrella runner: executes all four theme-quality scripts and prints a summary table.

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const themeDir = resolve(process.argv[2] ?? '.');

const SCRIPTS = [
  { name: 'validate-theme-json', file: 'validate-theme-json.mjs' },
  { name: 'lint-block-markup',   file: 'lint-block-markup.mjs'   },
  { name: 'check-patterns',      file: 'check-patterns.mjs'      },
  { name: 'check-i18n',          file: 'check-i18n.mjs'          },
];

/**
 * Run a script as a child process, streaming its output.
 * Returns a Promise<number> that resolves to the exit code.
 */
function runScript(scriptPath, themeDir) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, themeDir], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => process.stdout.write(chunk));
    child.stderr.on('data', (chunk) => process.stderr.write(chunk));

    child.on('close', (code) => resolve(code ?? 1));
    child.on('error', (err) => {
      process.stderr.write(`Failed to spawn ${scriptPath}: ${err.message}\n`);
      resolve(1);
    });
  });
}

/** Draw a simple Unicode box-drawing table. */
function printSummaryTable(results) {
  // Column widths
  const COL1 = 29; // script name column
  const COL2 = 9;  // status column (includes emoji + text)

  const line = (l, m, r, fill) =>
    l + fill.repeat(COL1 + 2) + m + fill.repeat(COL2 + 2) + r;

  console.log('');
  console.log(line('┌', '┬', '┐', '─'));
  console.log(`│ ${'Script'.padEnd(COL1)} │ ${'Status'.padEnd(COL2)} │`);
  console.log(line('├', '┼', '┤', '─'));
  for (const { name, exitCode } of results) {
    const status = exitCode === 0 ? '✅ PASS' : '❌ FAIL';
    console.log(`│ ${name.padEnd(COL1)} │ ${status.padEnd(COL2)} │`);
  }
  console.log(line('└', '┴', '┘', '─'));
  console.log('');
}

async function main() {
  console.log(`Running doctor on theme directory: ${themeDir}\n`);

  const results = [];

  for (const script of SCRIPTS) {
    console.log(`=== ${script.name} ===`);
    const scriptPath = join(__dirname, script.file);
    const exitCode = await runScript(scriptPath, themeDir);
    results.push({ name: script.name, exitCode });
    console.log('');
  }

  printSummaryTable(results);

  const anyFailed = results.some(r => r.exitCode !== 0);
  const failCount = results.filter(r => r.exitCode !== 0).length;
  const passCount = results.length - failCount;
  console.log(`Overall: ${passCount}/${results.length} scripts passed.`);

  process.exit(anyFailed ? 1 : 0);
}

main();
