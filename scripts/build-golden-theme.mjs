#!/usr/bin/env node
/**
 * build-golden-theme.mjs
 *
 * Renders the bundled templates/ into a complete reference block theme at
 * examples/_generated/landing-page-theme/. The output is committed: it is the
 * fixture doctor.mjs runs against in CI, so any template change that would make
 * a generated theme fail the doctor is caught.
 *
 * Usage:
 *   node scripts/build-golden-theme.mjs           # (re)write the golden theme
 *   node scripts/build-golden-theme.mjs --check   # exit 1 if the committed copy is stale
 */

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, mkdtempSync } from 'fs';
import { dirname, join, resolve, relative } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { collectFiles } from './lib/theme-utils.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = join(ROOT, 'templates');
const GOLDEN = join(ROOT, 'examples', '_generated', 'landing-page-theme');
const CHECK = process.argv.includes('--check');

const SLUG = 'landing-page-theme';

// Values substituted for every {{PLACEHOLDER}} in the templates used below.
const VALUES = {
  THEME_NAME: 'Landing Page Theme',
  THEME_URI: 'https://github.com/siddik-web/wp-block-theme-converter',
  AUTHOR_NAME: 'wp-block-theme-converter',
  AUTHOR_URI: 'https://github.com/siddik-web/wp-block-theme-converter',
  THEME_DESCRIPTION: 'Reference block theme rendered from the wp-block-theme-converter templates. Used as the doctor.mjs CI fixture.',
  VERSION: '1.0.0',
  REQUIRES_WP: '6.6',
  TESTED_UP_TO: '6.8',
  REQUIRES_PHP: '7.4',
  LICENSE: 'GNU General Public License v2 or later',
  LICENSE_URI: 'https://www.gnu.org/licenses/gpl-2.0.html',
  TEXT_DOMAIN: SLUG,
  THEME_TAGS: 'full-site-editing, block-patterns, one-column',
  YEAR: '2026',
  CONTENT_SIZE: '720px',
  WIDE_SIZE: '1200px',
  PRIMARY_COLOR: '#2563eb',
  SECONDARY_COLOR: '#7c3aed',
  ACCENT_COLOR: '#f59e0b',
  BG_COLOR: '#ffffff',
  SURFACE_COLOR: '#f8fafc',
  TEXT_COLOR: '#0f172a',
  TEXT_MUTED: '#64748b',
  BORDER_COLOR: '#e2e8f0',
  HEADING_FONT_STACK: 'system-ui, -apple-system, Roboto, sans-serif',
  BODY_FONT_STACK: 'system-ui, -apple-system, Roboto, sans-serif',
  MONO_FONT_STACK: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  HEADING_FONT_FILE_SLUG: 'system',
  BODY_FONT_FILE_SLUG: 'system',
  'theme-slug': SLUG,
  'text-domain': SLUG,
};

function render(tplPath) {
  const src = readFileSync(join(TEMPLATES, tplPath), 'utf8');
  return src.replace(/\{\{([A-Za-z_-]+)\}\}/g, (m, key) => {
    if (!(key in VALUES)) throw new Error(`${tplPath}: no value for placeholder ${m}`);
    return VALUES[key];
  });
}

/** theme.json: system font stacks only, so drop the fontFace entries (no font files ship). */
function renderThemeJson() {
  const theme = JSON.parse(render('theme.json.tpl'));
  for (const family of theme.settings.typography.fontFamilies) delete family.fontFace;
  return `${JSON.stringify(theme, null, '\t')}\n`;
}

const FUNCTIONS_PHP = `<?php
/**
 * ${VALUES.THEME_NAME} functions and definitions.
 *
 * @package LandingPageTheme
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the pattern categories used by patterns/ that core doesn't provide.
 */
function landing_page_theme_register_pattern_categories() {
\tregister_block_pattern_category( 'hero', array( 'label' => __( 'Hero', '${SLUG}' ) ) );
\tregister_block_pattern_category( 'services', array( 'label' => __( 'Services', '${SLUG}' ) ) );
\tregister_block_pattern_category( 'cta', array( 'label' => __( 'Call to Action', '${SLUG}' ) ) );
}
add_action( 'init', 'landing_page_theme_register_pattern_categories' );
`;

const HEADER = `<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30)">
\t<!-- wp:group {"align":"wide","layout":{"type":"flex","justifyContent":"space-between"}} -->
\t<div class="wp-block-group alignwide">
\t\t<!-- wp:site-title /-->
\t\t<!-- wp:navigation {"overlayMenu":"mobile"} /-->
\t</div>
\t<!-- /wp:group -->
</div>
<!-- /wp:group -->
`;

const FOOTER = `<!-- wp:group {"align":"full","backgroundColor":"surface","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","bottom":"var:preset|spacing|50"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--50);padding-bottom:var(--wp--preset--spacing--50)">
\t<!-- wp:site-title {"level":0} /-->
\t<!-- wp:site-tagline {"textColor":"muted"} /-->
</div>
<!-- /wp:group -->
`;

const wrap = (body) => `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
${body}
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
`;

const FILES = {
  'style.css': () => render('style.css.tpl'),
  'theme.json': renderThemeJson,
  'functions.php': () => FUNCTIONS_PHP,
  'parts/header.html': () => HEADER,
  'parts/footer.html': () => FOOTER,
  'patterns/hero.php': () => render('patterns/hero.php.tpl'),
  'patterns/features-grid.php': () => render('patterns/features-grid.php.tpl'),
  'patterns/cta-section.php': () => render('patterns/cta-section.php.tpl'),
  'templates/front-page.html': () => wrap(`\t<!-- wp:pattern {"slug":"${SLUG}/hero"} /-->
\t<!-- wp:pattern {"slug":"${SLUG}/features-grid"} /-->
\t<!-- wp:pattern {"slug":"${SLUG}/cta"} /-->`),
  'templates/index.html': () => wrap(`\t<!-- wp:query {"queryId":1,"query":{"perPage":10,"postType":"post","inherit":true}} -->
\t<div class="wp-block-query">
\t\t<!-- wp:post-template -->
\t\t\t<!-- wp:post-title {"isLink":true} /-->
\t\t\t<!-- wp:post-excerpt /-->
\t\t<!-- /wp:post-template -->
\t\t<!-- wp:query-pagination -->
\t\t\t<!-- wp:query-pagination-previous /-->
\t\t\t<!-- wp:query-pagination-numbers /-->
\t\t\t<!-- wp:query-pagination-next /-->
\t\t<!-- /wp:query-pagination -->
\t\t<!-- wp:query-no-results -->
\t\t\t<!-- wp:pattern {"slug":"${SLUG}/cta"} /-->
\t\t<!-- /wp:query-no-results -->
\t</div>
\t<!-- /wp:query -->`),
  'templates/page.html': () => wrap(`\t<!-- wp:post-title {"level":1} /-->
\t<!-- wp:post-content {"layout":{"type":"constrained"}} /-->`),
  'templates/single.html': () => wrap(`\t<!-- wp:post-title {"level":1} /-->
\t<!-- wp:post-date /-->
\t<!-- wp:post-content {"layout":{"type":"constrained"}} /-->`),
};

function writeTheme(dir) {
  rmSync(dir, { recursive: true, force: true });
  for (const [path, build] of Object.entries(FILES)) {
    const out = join(dir, path);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, build());
  }
}

if (!CHECK) {
  writeTheme(GOLDEN);
  console.log(`Wrote ${Object.keys(FILES).length} files to ${relative(ROOT, GOLDEN)}/`);
  process.exit(0);
}

// --check: render to a temp dir and compare with the committed copy.
const tmp = mkdtempSync(join(tmpdir(), 'golden-'));
writeTheme(tmp);
const rel = (base) => collectFiles(base, ['.css', '.json', '.php', '.html']).map(f => relative(base, f)).sort();
const expected = rel(tmp);
const actual = existsSync(GOLDEN) ? rel(GOLDEN) : [];
const stale = [...new Set([...expected, ...actual])].filter(f =>
  !existsSync(join(tmp, f)) || !existsSync(join(GOLDEN, f)) ||
  readFileSync(join(tmp, f), 'utf8') !== readFileSync(join(GOLDEN, f), 'utf8'));
rmSync(tmp, { recursive: true, force: true });

if (stale.length > 0) {
  console.log(`Golden theme is out of date with templates/ (${stale.length} file(s)):`);
  for (const f of stale) console.log(`  ${f}`);
  console.log('\nRun: node scripts/build-golden-theme.mjs');
  process.exit(1);
}
console.log('Golden theme is up to date with templates/.');
