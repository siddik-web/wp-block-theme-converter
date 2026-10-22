// Regression tests for the theme-quality scripts. Run: node --test scripts/tests/
//
// Each test copies the golden theme (a known-good fixture) into a temp dir,
// breaks one thing, and asserts the responsible script catches it — and that
// the untouched golden theme and the bundled templates stay clean.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, writeFileSync, readFileSync, rmSync, mkdirSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPTS = join(ROOT, 'scripts');
const GOLDEN = join(ROOT, 'examples', '_generated', 'landing-page-theme');
const SLUG = 'landing-page-theme';
const HAS_PHP = !spawnSync('php', ['--version']).error;

function run(script, dir, input) {
  const res = spawnSync(process.execPath, [join(SCRIPTS, script), ...(dir ? [dir] : [])], {
    encoding: 'utf8',
    input,
  });
  return { code: res.status, out: `${res.stdout}${res.stderr}` };
}

/** Copy the golden theme to a temp dir and apply `edits` ({ path: content | fn(old) }). */
function fixture(t, edits = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'theme-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  cpSync(GOLDEN, dir, { recursive: true });
  for (const [path, edit] of Object.entries(edits)) {
    const full = join(dir, path);
    if (edit === null) {
      rmSync(full);
      continue;
    }
    mkdirSync(dirname(full), { recursive: true });
    let old = '';
    try {
      old = readFileSync(full, 'utf8');
    } catch {}
    writeFileSync(full, typeof edit === 'function' ? edit(old) : edit);
  }
  return dir;
}

const editJson = (fn) => (old) => {
  const json = JSON.parse(old);
  fn(json);
  return JSON.stringify(json, null, 2);
};

const pattern = (slug, body) => `<?php
/**
 * Title: Test
 * Slug: ${slug}
 * Categories: featured
 */
?>
${body}
`;

// ── Known-good inputs ──────────────────────────────────────────────────────────

test('golden theme passes the doctor', () => {
  const { code, out } = run('doctor.mjs', GOLDEN);
  assert.equal(code, 0, out);
  assert.match(out, /Overall: 5\/5 scripts passed/);
});

test('golden theme is in sync with templates/', () => {
  const { code, out } = run('build-golden-theme.mjs', '--check');
  assert.equal(code, 0, out);
});

test('every bundled pattern template lints clean once rendered', (t) => {
  const dir = fixture(t);
  const tplDir = join(ROOT, 'templates', 'patterns');
  for (const f of readdirSync(tplDir)) {
    const src = readFileSync(join(tplDir, f), 'utf8').replace(/\{\{(?:theme-slug|text-domain)\}\}/g, SLUG);
    writeFileSync(join(dir, 'patterns', f.replace(/\.tpl$/, '')), src);
  }
  for (const script of ['lint-block-markup.mjs', 'check-patterns.mjs', 'check-i18n.mjs']) {
    const { code, out } = run(script, dir);
    assert.equal(code, 0, `${script}:\n${out}`);
  }
});

// ── lint-block-markup ──────────────────────────────────────────────────────────

test('lint: self-closing blocks with attributes and block-support styles are valid', (t) => {
  const dir = fixture(t, {
    'parts/extra.html': `<!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","left":"1rem"}}}} -->
<div class="wp-block-group" style="padding-top:2rem;padding-left:1rem">
<!-- wp:spacer {"height":"40px"} /-->
<!-- wp:separator /-->
<!-- wp:paragraph {
  "fontSize":"large"
} -->
<p class="has-large-font-size">a &gt; b</p>
<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
`,
  });
  const { code, out } = run('lint-block-markup.mjs', dir);
  assert.equal(code, 0, out);
});

test('lint: hand-written inline styles are flagged', (t) => {
  const dir = fixture(t, {
    'parts/extra.html': `<div style="color:red">raw</div>
<!-- wp:paragraph -->
<p style="margin-left:4px">no attrs</p>
<!-- /wp:paragraph -->
<!-- wp:html {"x":1} -->
<span style="color:blue">html block</span>
<!-- /wp:html -->
`,
  });
  const { code, out } = run('lint-block-markup.mjs', dir);
  assert.notEqual(code, 0);
  assert.equal((out.match(/Hand-written inline style/g) ?? []).length, 3, out);
  assert.match(out, /logical properties/);
});

test('lint: unclosed and mismatched block delimiters are flagged', (t) => {
  const dir = fixture(t, {
    'parts/extra.html': `<!-- wp:group -->
<div class="wp-block-group">
<!-- wp:columns -->
<div class="wp-block-columns"></div>
</div>
<!-- /wp:group -->
<!-- /wp:cover -->
`,
  });
  const { out } = run('lint-block-markup.mjs', dir);
  assert.match(out, /extra\.html:3: Unclosed block comment <!-- wp:columns -->/);
  assert.match(out, /extra\.html:7: Unmatched closing block comment <!-- \/wp:cover -->/);
});

test('lint: <style> and <script> tags are flagged', (t) => {
  const dir = fixture(t, { 'parts/extra.html': '<style>p{}</style>\n<script>x()</script>\n' });
  const { out } = run('lint-block-markup.mjs', dir);
  assert.match(out, /<style> tag/);
  assert.match(out, /<script> tag/);
});

// ── validate-theme-json ────────────────────────────────────────────────────────

test('theme.json: 8-digit hex and functional colors in styles are flagged', (t) => {
  const dir = fixture(t, {
    'theme.json': editJson((j) => {
      j.styles.color.background = '#ff0000aa';
      j.styles.color.text = 'rgb(1, 2, 3)';
    }),
  });
  const { code, out } = run('validate-theme-json.mjs', dir);
  assert.notEqual(code, 0);
  assert.match(out, /styles\.color\.background: #ff0000aa/);
  assert.match(out, /styles\.color\.text: rgb\(1, 2, 3\)/);
});

test('theme.json: non-WordPress $schema is flagged', (t) => {
  const dir = fixture(t, { 'theme.json': editJson((j) => { j.$schema = 'x'; }) });
  assert.match(run('validate-theme-json.mjs', dir).out, /FAIL {2}\$schema should be/);
});

test('theme.json: templateParts without a parts/ file, or under settings, are flagged', (t) => {
  const dir = fixture(t, {
    'theme.json': editJson((j) => {
      j.templateParts.push({ name: 'sidebar', title: 'Sidebar', area: 'uncategorized' });
      j.settings.customTemplates = [];
    }),
  });
  const { out } = run('validate-theme-json.mjs', dir);
  assert.match(out, /templateParts name "sidebar" has no matching file/);
  assert.match(out, /settings\.customTemplates is ignored/);
});

test('theme.json: broken style variations are flagged', (t) => {
  const dir = fixture(t, {
    'styles/dark.json': JSON.stringify({ version: 2, styles: { color: { background: '#000' } } }),
  });
  const { out } = run('validate-theme-json.mjs', dir);
  assert.match(out, /styles\/dark\.json: version must be 3/);
  assert.match(out, /styles\/dark\.json: missing "title"/);
  assert.match(out, /styles\/dark\.json: hardcoded colors/);
});

// ── check-theme-structure ──────────────────────────────────────────────────────

test('structure: missing style.css and templates/index.html are flagged', (t) => {
  const dir = fixture(t, { 'style.css': null, 'templates/index.html': null });
  const { code, out } = run('check-theme-structure.mjs', dir);
  assert.notEqual(code, 0);
  assert.match(out, /style\.css is missing/);
  assert.match(out, /templates\/index\.html is missing/);
});

test('structure: incomplete style.css header is flagged', (t) => {
  const dir = fixture(t, { 'style.css': '/*\nTheme Name: X\nText Domain: {{TEXT_DOMAIN}}\n*/\n' });
  const { out } = run('check-theme-structure.mjs', dir);
  assert.match(out, /header is missing: Version, Requires at least, Tested up to, Requires PHP, License/);
  assert.match(out, /placeholders: Text Domain/);
});

test('structure: unknown template parts, patterns, and palette colors are flagged', (t) => {
  const dir = fixture(t, {
    'templates/extra.html': `<!-- wp:template-part {"slug":"sidebar"} /-->
<!-- wp:pattern {"slug":"${SLUG}/missing"} /-->
<!-- wp:group {"backgroundColor":"foreground","style":{"border":{"color":"var:preset|color|nope"}}} -->
<div class="wp-block-group"></div>
<!-- /wp:group -->
`,
  });
  const { out } = run('check-theme-structure.mjs', dir);
  assert.match(out, /template part "sidebar" has no parts\/sidebar\.html/);
  assert.match(out, /pattern "landing-page-theme\/missing" is not registered/);
  assert.match(out, /color "foreground" is not in the theme\.json palette/);
  assert.match(out, /color "nope" is not in the theme\.json palette/);
});

test('structure: PHP syntax errors are flagged', { skip: !HAS_PHP && 'php not installed' }, (t) => {
  const dir = fixture(t, { 'functions.php': '<?php\nfunction ( {\n' });
  assert.match(run('check-theme-structure.mjs', dir).out, /FAIL {2}functions\.php: .*error/i);
});

// ── check-patterns ─────────────────────────────────────────────────────────────

test('patterns: slug namespace must match the text domain', (t) => {
  const dir = fixture(t, { 'patterns/other.php': pattern('other-theme/hero', '') });
  const { code, out } = run('check-patterns.mjs', dir);
  assert.notEqual(code, 0);
  assert.match(out, /namespaced "other-theme" but the theme's Text Domain is "landing-page-theme"/);
});

// ── check-i18n ─────────────────────────────────────────────────────────────────

test('i18n: hardcoded text in pattern markup is flagged', (t) => {
  const dir = fixture(t, {
    'patterns/raw.php': pattern(`${SLUG}/raw`, `<!-- wp:heading -->
<h2 class="wp-block-heading">Hardcoded heading</h2>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p><?php esc_html_e( 'Translated', '${SLUG}' ); ?></p>
<!-- /wp:paragraph -->`),
  });
  const { code, out } = run('check-i18n.mjs', dir);
  assert.notEqual(code, 0);
  assert.match(out, /raw\.php:9: Hardcoded text in pattern markup: "Hardcoded heading"/);
  assert.doesNotMatch(out, /Translated/);
});

test('i18n: wrong text domain is flagged', (t) => {
  const dir = fixture(t, {
    'patterns/domain.php': pattern(`${SLUG}/domain`, `<p><?php esc_html_e( 'Hi', 'other-domain' ); ?></p>
<p><?php echo esc_html( sprintf( _n( '%d item', '%d items', 2, 'other-domain' ), 2 ) ); ?></p>`),
  });
  const { out } = run('check-i18n.mjs', dir);
  assert.equal((out.match(/uses text domain "other-domain"/g) ?? []).length, 2, out);
});

// ── PostToolUse hook ───────────────────────────────────────────────────────────

test('hook: reports theme.json problems and stays silent otherwise', (t) => {
  const dir = fixture(t, { 'theme.json': editJson((j) => { j.version = 2; }) });
  const hook = 'hooks/theme-json-postwrite.mjs';

  const bad = run(hook, null, JSON.stringify({ tool_input: { file_path: join(dir, 'theme.json') } }));
  assert.equal(bad.code, 0);
  assert.match(JSON.parse(bad.out).hookSpecificOutput.additionalContext, /version must be 3/);

  const other = run(hook, null, JSON.stringify({ tool_input: { file_path: join(dir, 'style.css') } }));
  assert.equal(other.code, 0);
  assert.equal(other.out, '');
});
