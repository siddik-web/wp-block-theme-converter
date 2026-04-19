---
name: wp-block-theme-converter
description: Convert any HTML/CSS/JavaScript project into a production-ready WordPress Block Theme (Full Site Editing) with Interactivity API, Block Bindings, per-block CSS, and WordPress 6.5+ best practices. Use this skill whenever the user wants to convert, port, transform, migrate, or rebuild static HTML/CSS/JS into a WordPress block theme, FSE theme, or Gutenberg-compatible theme. Also triggers for scaffolding themes from scratch, generating theme.json from design tokens, creating block patterns from HTML snippets, or building WooCommerce-compatible block themes. Trigger on phrases like "convert to WordPress", "make this a WP theme", "block theme from HTML", "FSE theme", "Gutenberg theme", "WordPress theme from scratch", "port my landing page to WordPress", "WooCommerce theme from HTML", "create a block pattern", "generate theme.json", or any request involving WordPress block theme development. Also use this skill when the user invokes the slash commands /convert-to-wp-theme, /scaffold-wp-theme, /wp-pattern, /wp-theme-json, or /wp-template. Even if the user just says "WordPress theme" or "WP theme", this skill is likely relevant.
license: MIT
---

# WordPress Block Theme Converter

Convert HTML/CSS/JavaScript projects into production-ready WordPress Block Themes with Full Site Editing (FSE) support, theme.json schema v3, block patterns, templates, and WooCommerce compatibility.

## When to Use This Skill

Trigger this skill when the user wants to:
- Convert static HTML/CSS/JS into a WordPress theme
- Build a Full Site Editing (FSE) theme from scratch
- Scaffold theme.json, block patterns, or block templates
- Port an existing landing page, portfolio, or eCommerce site to WordPress
- Create a WooCommerce-compatible block theme
- Generate individual block patterns or templates from HTML snippets

## Custom Slash Commands

This skill registers five slash commands. When the user invokes any of these, follow the workflow in the corresponding command file:

| Command | Purpose | Reference File |
|---------|---------|----------------|
| `/convert-to-wp-theme` | Full conversion of HTML/CSS/JS project to complete block theme | `commands/convert-to-wp-theme.md` |
| `/scaffold-wp-theme` | Create empty block theme scaffold (no source conversion) | `commands/scaffold-wp-theme.md` |
| `/wp-pattern` | Convert single HTML section into a registered block pattern | `commands/wp-pattern.md` |
| `/wp-theme-json` | Generate theme.json from a design system / CSS custom properties | `commands/wp-theme-json.md` |
| `/wp-template` | Convert single HTML page into FSE template | `commands/wp-template.md` |

When the user types one of these commands, read the corresponding command file in `commands/` and execute the workflow defined there.

## Core Workflow

For ANY conversion request (whether triggered by slash command or natural language):

### Step 1: Capture Project Context
Gather these inputs (ask only if not provided):
- Theme identity (name, slug, author, description)
- Source project type (landing page, blog, eCommerce, portfolio, SaaS)
- HTML files to convert
- Design tokens (colors, fonts, spacing)
- Build system preference (Vite 6 default, or wp-scripts, or none)
- WooCommerce support (yes/no)

For default values when user is silent, use the table in `references/defaults.md`.

### Step 2: Plan the Conversion
Before writing any code, produce a one-page Conversion Plan that maps:
- Each source HTML file → WordPress template
- Each repeating section → block pattern
- Header/footer → template parts
- Interactive components → JS strategy (Interactivity API preferred, classic enqueue for complex libs)
- Design tokens → theme.json structure
- Dynamic data needs → Block Bindings API candidates

Show this plan to the user. Get confirmation before proceeding to file generation (unless the user explicitly says "just build it").

### Step 3: Execute the 10-Phase Methodology
Follow the phases documented in `references/methodology.md`:

1. **Audit & Extract** — parse source, identify reusable components
2. **theme.json** — generate schema v3 with full settings + styles (incl. Section Styles, dimensions, position)
3. **Templates & Parts** — convert HTML pages to FSE block markup
4. **Block Patterns** — register sections as reusable patterns
5. **Block Styles & Variations** — register custom variants via theme.json + PHP
6. **JavaScript Integration** — Interactivity API for interactive patterns; `wp_enqueue_script()` only for complex libs. Read `references/modern-blocks.md` FIRST.
7. **functions.php & inc/** — bootstrap files following WP Coding Standards
8. **Accessibility & Performance** — WCAG 2.1 AA + Core Web Vitals + per-block CSS loading + font preloading
9. **i18n** — translation-ready strings everywhere
10. **README & Docs** — WordPress.org-format readme.txt

### Step 4: Output Files
Use the file structure documented in `references/file-structure.md`. Output every file with a clear header:

```
=== FILE: {{theme-slug}}/path/to/file.ext ===
<content>
```

For large projects (10+ HTML pages or WooCommerce themes), split delivery across 3 turns using the multi-turn strategy in `references/multi-turn-strategy.md`.

### Step 5: Post-Generation
Provide:
- Installation instructions
- Post-install checklist (activate, set front page, install required plugins)
- Build commands (`npm install`, `npm run dev`, `npm run build`)
- "Decisions Made" section listing assumptions

## Quality Rules — Non-Negotiable

These rules apply to EVERY file generated. See `references/quality-rules.md` for full details.

❌ **NEVER:**
- Inline `style=""` attributes in block markup
- `<style>` or `<script>` tags inside templates/parts/patterns
- Hardcoded colors/spacing in CSS — use `var(--wp--preset--color--{slug})`
- Deprecated WordPress functions
- Unescaped output (always `esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`)
- Direct DB queries (use WP_Query / Query Loop)
- Inline JavaScript in patterns (CSP-unsafe)
- Alpine.js when the Interactivity API handles the same interaction
- Physical CSS directional properties when logical alternatives exist (`margin-inline-start` not `margin-left`)

✅ **ALWAYS:**
- Use semantic HTML via `tagName` attribute
- Wrap user-facing strings in `__()`, `_e()`, `esc_html__()`, etc.
- Version assets with `filemtime()` for cache-busting
- Mirror frontend CSS in editor.css for editor parity
- Use theme.json as single source of truth for design tokens
- Provide `prefers-reduced-motion` fallbacks for animations
- Use Interactivity API for simple interactive patterns (modals, tabs, toggles)
- Use `wp_enqueue_block_style()` for per-block CSS loading
- Include ARIA attributes on all interactive Interactivity API patterns

## Reference Files

Read these on-demand based on the task:

- `references/defaults.md` — Default values for placeholders (versions, paths, configs)
- `references/methodology.md` — Detailed 10-phase conversion methodology
- `references/modern-blocks.md` — **READ FIRST for any JS/interactivity work.** Interactivity API, Block Bindings, per-block CSS, Section Styles, dark mode, RTL, and other WordPress 6.5+ features
- `references/file-structure.md` — Required directory structure for output theme
- `references/block-conversion-map.md` — HTML element → WP block lookup table
- `references/theme-json-schema.md` — theme.json v3 schema reference + examples (incl. dimensions, position, lightbox, background, custom CSS, Section Styles)
- `references/quality-rules.md` — Full list of do's and don'ts
- `references/multi-turn-strategy.md` — How to split large projects across turns
- `references/woocommerce.md` — WooCommerce-specific theming guidance
- `references/validation-checklist.md` — Post-generation verification steps

## Templates

Reusable boilerplate files in `templates/`:

- `templates/style.css.tpl` — Theme header file template
- `templates/theme.json.tpl` — Minimal valid theme.json starter
- `templates/functions.php.tpl` — Bootstrap functions.php
- `templates/pattern-header.php.tpl` — Block pattern PHP file header
- `templates/template-skeleton.html.tpl` — Empty FSE template skeleton
- `templates/package.json.tpl` — Build tooling package.json
- `templates/vite.config.js.tpl` — Vite 6 config for WP integration

## Examples

Reference implementations in `examples/`:

- `examples/northaven-ecommerce.md` — Full filled-in prompt for a multi-aesthetic WooCommerce theme
- `examples/landing-page-simple.md` — Minimal single-page conversion example

## Output Conventions

- Always lead with the **Conversion Plan** (1-page summary table)
- Show file paths in `=== FILE: theme-slug/path ===` format
- Use code fences with the correct language tag (`php`, `json`, `html`, `css`, `js`)
- After all files, provide **Installation Instructions** section
- End with **Decisions Made** section (assumptions + rationale)

## Common Pitfalls to Avoid

1. **Don't output partial theme.json** — always produce a complete, valid schema v3 file
2. **Don't forget `useRootPaddingAwareAlignments: true`** — breaks alignment otherwise
3. **Don't use `add_theme_support('block-templates')` AND have classic theme files** — they conflict
4. **Don't escape inside translation functions** — use `esc_html__()` not `esc_html(__())`
5. **Don't put CSS in `style.css`** — that file is ONLY the theme header; real styles go in `assets/css/style.css`
6. **Don't forget pattern category registration** — patterns won't show without `register_block_pattern_category()`
7. **Don't use Alpine.js for simple interactions** — use the Interactivity API instead; Alpine adds unnecessary bundle weight
8. **Don't skip the `screenshot.png` note** — required for theme directory submission
9. **Don't enqueue ALL block CSS in one file** — use `wp_enqueue_block_style()` for per-block CSS (only loads when block is on the page)
10. **Don't forget font preloading** — critical fonts need `<link rel="preload">` or the `wp_preload_resources` filter
11. **Don't use physical CSS properties** — use logical properties (`margin-inline-start` not `margin-left`) for RTL compatibility
12. **Don't put block style variations only in CSS** — define them in theme.json `styles.blocks.{block}.variations` for full editor integration (Section Styles, WP 6.6+)
13. **Don't skip editor.css parity** — every visual CSS rule in frontend must be mirrored in `editor.css`. Per-block CSS files loaded via `wp_enqueue_block_style()` auto-apply to both.
14. **Don't hardcode WP version in "Tested Up To"** — always verify the current stable WordPress release before setting this value
