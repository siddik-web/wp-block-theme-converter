#!/usr/bin/env node
/**
 * capture.mjs
 *
 * Screenshots a rendered page and maps each section of its front-page template to the pattern file
 * that produced it, for the scroll scene in render-demo.mjs. The mapping is read from the theme's own
 * templates/front-page.html (the ordered `wp:pattern` references) and matched to the rendered
 * <main> children, so labels cannot drift from what the theme actually contains.
 *
 * Dev-only tooling: needs Playwright (with Chromium).
 *
 * Usage: node scripts/demo/capture.mjs --url http://localhost:8899/ --out wp.png --theme-dir path/to/theme --sections-out sections.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
};
const [url, out, themeDir, sectionsOut] = ['url', 'out', 'theme-dir', 'sections-out'].map(arg);
const width = Number(arg('width') ?? 1280);
if (!url || !out || !themeDir || !sectionsOut) {
  console.error('usage: capture.mjs --url U --out wp.png --theme-dir DIR --sections-out sections.json [--width 1280]');
  process.exit(2);
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const root = execFileSync('npm', ['root', '-g'], { encoding: 'utf8' }).trim();
  ({ chromium } = createRequire(`${root}/`)('playwright'));
}

const template = readFileSync(join(themeDir, 'templates', 'front-page.html'), 'utf8');
const patterns = [...template.matchAll(/<!--\s*wp:pattern\s+\{[^}]*"slug"\s*:\s*"[^/"]+\/([^"]+)"/g)].map((m) => `patterns/${m[1]}.php`);

const browser = await chromium.launch({ args: ['--no-sandbox'], ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const page = await browser.newPage({ viewport: { width, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: out, fullPage: true });

const tops = await page.evaluate(() => {
  const main = document.querySelector('.wp-site-blocks > main, main');
  const header = document.querySelector('.wp-site-blocks > header, header.wp-block-template-part');
  const footer = document.querySelector('.wp-site-blocks > footer, footer.wp-block-template-part');
  const y = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY);
  return {
    header: header ? y(header) : null,
    footer: footer ? y(footer) : null,
    main: main ? [...main.children].map(y) : [],
    height: document.documentElement.scrollHeight,
  };
});
await browser.close();

if (tops.main.length !== patterns.length) {
  console.error(`warning: ${patterns.length} patterns in front-page.html but ${tops.main.length} sections in <main>; labels may be off`);
}
const sections = [];
if (tops.header !== null) sections.push({ y: 0, label: 'parts/header.html' });
patterns.forEach((label, i) => { if (tops.main[i] !== undefined) sections.push({ y: tops.main[i], label }); });
if (tops.footer !== null) sections.push({ y: tops.footer, label: 'parts/footer.html' });
writeFileSync(sectionsOut, `${JSON.stringify(sections, null, 2)}\n`);
console.log(`${out}: ${width}x${tops.height}, ${sections.length} labelled sections${errors.length ? `, page errors: ${errors.join('; ')}` : ''}`);
