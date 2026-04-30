---
name: wp-block-theme-converter
description: Convert any HTML/CSS/JavaScript project into a production-ready WordPress Block Theme (Full Site Editing) with Interactivity API, Block Bindings, per-block CSS, and WordPress 6.5+ best practices. Use this skill whenever the user wants to convert, port, transform, migrate, or rebuild static HTML/CSS/JS into a WordPress block theme, FSE theme, or Gutenberg-compatible theme. Also triggers for scaffolding themes from scratch, generating theme.json from design tokens, creating block patterns from HTML snippets, or building WooCommerce-compatible block themes. Trigger on phrases like "convert to WordPress", "make this a WP theme", "block theme from HTML", "FSE theme", "Gutenberg theme", "WordPress theme from scratch", "port my landing page to WordPress", "WooCommerce theme from HTML", "create a block pattern", "generate theme.json", or any request involving WordPress block theme development. Also use this skill when the user invokes the slash commands /convert-to-wp-theme, /scaffold-wp-theme, /wp-pattern, /wp-theme-json, or /wp-template. Even if the user just says "WordPress theme" or "WP theme", this skill is likely relevant.
license: MIT
---

# WordPress Block Theme Converter

Convert HTML/CSS/JavaScript projects into production-ready WordPress Block Themes with Full Site Editing (FSE) support, theme.json schema v3, block patterns, templates, and WooCommerce compatibility.

---

## Behavioral Principles

**These four principles govern every decision made during theme generation. They are non-negotiable and override any temptation to "just get it done."**

**Tradeoff:** These principles bias toward caution over speed. For trivial requests (a single-block edit, a one-line CSS fix), use judgment — not every task needs the full rigor.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before generating ANY file:
- **State assumptions explicitly.** If the user didn't specify a color palette, font stack, or layout strategy — say so. Don't silently invent design decisions.
- **If multiple interpretations exist, present them.** "Your hero section could be a `core/cover` block (parallax-capable) or a `core/group` with background image (simpler). Which do you prefer?"
- **Push back when warranted.** If the user asks for something that will create a poor theme (e.g., inline JS in patterns, Alpine.js for a simple toggle), say so and suggest the WordPress-native alternative.
- **If something is unclear, stop.** Name what's confusing. Ask. Don't generate 50 files based on a guess.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- **No features beyond what was asked.** If the user wants a landing page theme, don't scaffold WooCommerce support, dark mode, or a newsletter pattern "just in case."
- **No abstractions for single-use code.** Don't create a `ThemeHelper` class for one function. Don't create a `config.php` that's only read once.
- **No "flexibility" that wasn't requested.** Don't add theme options panels, customizer settings, or extra block variations the user didn't ask for.
- **If 200 lines could be 50, rewrite it.** Every line must earn its place.
- **Prefer core blocks over custom patterns.** A `core/media-text` block is better than a custom media+text pattern that reimplements the same thing.
- **Prefer theme.json over CSS.** If a style can be expressed in theme.json, it MUST be. Don't write CSS for what theme.json handles natively.

**The test:** Would a senior WordPress theme reviewer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When the user has an EXISTING theme and wants modifications:
- **Don't "improve" adjacent code.** If asked to add a footer pattern, don't refactor the header pattern.
- **Don't refactor things that aren't broken.** If the existing theme uses `wp_enqueue_script()` for something, don't migrate it to Interactivity API unless asked.
- **Match existing style.** If the theme uses tabs for indentation, use tabs. If it uses `snake_case` for function names, follow suit.
- **If you notice unrelated issues, mention them — don't fix them.** "I noticed your header pattern has an inline `style` attribute. Want me to fix that too?"

When YOUR changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

**The test:** Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

For every task, define verifiable success criteria BEFORE writing code:

| Task | Success Criteria |
|------|-----------------|
| Convert landing page to WP theme | Theme activates without errors. Front page renders visually identical to source. All patterns editable in Site Editor. |
| Generate theme.json | JSON validates against v3 schema. Color palette matches source. Typography scale matches source. |
| Create a block pattern | Pattern appears in inserter under correct category. Content is editable. No inline styles. All strings translatable. |
| Add WooCommerce support | Product archive/single/cart/checkout templates render. HPOS compatibility declared. WC blocks load correctly. |
| Fix editor parity | Every frontend CSS rule has a matching rule in editor.css. Visual diff between editor and frontend is zero. |

Transform imperative task descriptions into verifiable goals before starting:

| Instead of... | Transform to... |
|---------------|----------------|
| "Make it look right" | "Front page renders visually matching source HTML. No inline styles." |
| "Fix the PHP error" | "WP_DEBUG on, error reproduced, fix applied — debug.log is clean." |
| "Add WooCommerce support" | "Cart, checkout, and product archive render without warnings. HPOS declared." |
| "Make patterns editable" | "All patterns in Site Editor inserter. Every text/image element editable without touching the pattern file." |

For multi-step tasks, state a brief plan with verification at each step:

```
1. Audit source HTML → verify: component map produced, no ambiguity remaining
2. Generate theme.json → verify: JSON validates, all design tokens mapped
3. Create templates → verify: all pages have corresponding FSE templates
4. Register patterns → verify: patterns appear in inserter, content is editable
5. Enqueue assets → verify: no console errors, styles load correctly
6. Accessibility pass → verify: skip-link works, contrast ratios pass, ARIA attributes present
```

**Strong success criteria let you work independently. Weak criteria ("make it look good") require constant clarification.**

---

## When to Use This Skill

Trigger this skill when the user wants to:
- Convert static HTML/CSS/JS into a WordPress theme
- Build a Full Site Editing (FSE) theme from scratch
- Scaffold theme.json, block patterns, or block templates
- Port an existing landing page, portfolio, or eCommerce site to WordPress
- Create a WooCommerce-compatible block theme
- Generate individual block patterns or templates from HTML snippets

## Custom Slash Commands

| Command | Purpose | Reference File |
|---------|---------|----------------|
| `/convert-to-wp-theme` | Full conversion of HTML/CSS/JS project to complete block theme | `commands/convert-to-wp-theme.md` |
| `/scaffold-wp-theme` | Create empty block theme scaffold (no source conversion) | `commands/scaffold-wp-theme.md` |
| `/wp-pattern` | Convert single HTML section into a registered block pattern | `commands/wp-pattern.md` |
| `/wp-theme-json` | Generate theme.json from a design system / CSS custom properties | `commands/wp-theme-json.md` |
| `/wp-template` | Convert single HTML page into FSE template | `commands/wp-template.md` |

When the user types one of these commands, read the corresponding command file in `commands/` and execute the workflow defined there.

---

## Core Workflow

For ANY conversion request (whether triggered by slash command or natural language):

### Step 1: Think — Capture & Clarify (Principle 1)

Gather these inputs (ask only if not provided):
- Theme identity (name, slug, author, description)
- Source project type (landing page, blog, eCommerce, portfolio, SaaS)
- HTML files to convert
- Design tokens (colors, fonts, spacing)
- Build system preference (Vite 6 default, or wp-scripts, or none)
- WooCommerce support (yes/no)

**Before proceeding, explicitly state:**
- What you're assuming (e.g., "I'm assuming you want GPL-2.0-or-later licensing since you mentioned WordPress.org submission")
- What you're NOT doing (e.g., "I won't scaffold WooCommerce support since you didn't mention eCommerce")
- Any ambiguities you need resolved (e.g., "Your hero uses a video background — should this be a `core/cover` with video or a custom pattern with a `<video>` tag?")

For default values when user is silent, use the table in `references/defaults.md`.

### Step 2: Plan — Define Success Criteria (Principles 1 + 4)

Before writing any code, produce a **Conversion Plan** that maps:
- Each source HTML file → WordPress template
- Each repeating section → block pattern
- Header/footer → template parts
- Interactive components → JS strategy (Interactivity API preferred, classic enqueue for complex libs — read `references/modern-blocks.md`)
- Design tokens → theme.json structure
- Dynamic data needs → Block Bindings API candidates

**Also state the success criteria for this specific conversion:**
```
SUCCESS CRITERIA:
1. Theme activates on WordPress [version] without PHP errors or notices
2. [List of pages] render visually matching source HTML
3. All patterns appear in Site Editor inserter under [categories]
4. All interactive components work (list them)
5. No inline styles in block markup
6. All strings translation-ready
7. PHPCS WordPress-Extra passes with zero errors
8. [Any project-specific criteria]
```

Show this plan to the user. Get confirmation before proceeding to file generation (unless the user explicitly says "just build it").

### Step 3: Execute — 10-Phase Methodology (Principle 2)

Follow the phases documented in `references/methodology.md`. **Apply Simplicity First at every phase — generate only what the project needs:**

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

**Simplicity checks during execution:**
- Am I generating a file that isn't needed for this specific project? → Remove it.
- Am I adding a pattern the user didn't ask for? → Remove it.
- Am I writing CSS for something theme.json handles? → Move it to theme.json.
- Am I creating an abstraction used only once? → Inline it.
- Can this 200-line file be 50 lines? → Rewrite it.

### Step 4: Output Files (Principle 3)

Use the file structure documented in `references/file-structure.md`. Output every file with a clear header:

```
=== FILE: {{theme-slug}}/path/to/file.ext ===
<content>
```

For large projects (10+ HTML pages or WooCommerce themes), split delivery across 3 turns using `references/multi-turn-strategy.md`.

**Surgical precision for existing themes:** If modifying an existing theme, output ONLY the changed files. Include a diff summary showing exactly what changed and why.

### Step 5: Verify — Post-Generation (Principle 4)

Provide:
- Installation instructions
- Post-install checklist (activate, set front page, install required plugins)
- Build commands (`npm install`, `npm run dev`, `npm run build`)
- **"Decisions Made" section** — every assumption listed with rationale
- **Verification steps** — how to confirm each success criterion was met:

```
VERIFICATION:
✅ Activate theme → Confirm no PHP errors in debug.log
✅ Visit front page → Confirm visual match with source
✅ Open Site Editor → Confirm all templates listed
✅ Insert block → Confirm all patterns appear under correct categories
✅ Run `npx phpcs --standard=WordPress-Extra .` → Confirm zero errors
✅ Check browser console → Confirm zero JS errors
✅ Run Lighthouse → Confirm accessibility score ≥ 90
```

**If any verification step fails, loop back to the relevant phase and fix it before reporting done. Don't declare success past a failed check.**

---

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
- Speculative features the user didn't ask for (Principle 2)
- "Improving" code that isn't part of the current task (Principle 3)

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
- State assumptions before generating code (Principle 1)
- Define success criteria before starting multi-file tasks (Principle 4)

---

## Reference Files

Read these on-demand based on the task:

| File | When to Read | Priority |
|------|-------------|----------|
| `references/defaults.md` | Every conversion (default values) | Always |
| `references/methodology.md` | Full conversions (10-phase process) | Always |
| `references/modern-blocks.md` | **Any JS/interactivity work.** Interactivity API, Block Bindings, per-block CSS, Section Styles, dark mode, RTL | Before Phase 6 |
| `references/file-structure.md` | Full conversions (directory layout) | Always |
| `references/block-conversion-map.md` | Converting HTML → block markup | During Phase 3-4 |
| `references/theme-json-schema.md` | Generating theme.json (v3 schema + examples) | During Phase 2 |
| `references/quality-rules.md` | Every task (do's and don'ts) | Always |
| `references/multi-turn-strategy.md` | Large projects (10+ pages) | When needed |
| `references/woocommerce.md` | WooCommerce themes | When needed |
| `references/validation-checklist.md` | Post-generation verification | After all files |

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

---

## Output Conventions

- Always lead with the **Conversion Plan** (1-page summary table)
- State **assumptions** and **success criteria** before any code
- Show file paths in `=== FILE: theme-slug/path ===` format
- Use code fences with the correct language tag (`php`, `json`, `html`, `css`, `js`)
- After all files, provide **Installation Instructions** section
- End with **Verification Steps** + **Decisions Made** section

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
15. **Don't add speculative features** — no "just in case" patterns, no dark mode unless asked, no WooCommerce support unless asked (Principle 2)
16. **Don't silently pick an interpretation** — if the source HTML is ambiguous, ask; don't guess and generate 50 files based on an assumption (Principle 1)
17. **Don't use Section Styles without bumping `Requires at least` to 6.6** — `styles.blocks.*.variations` is silently ignored on WP < 6.6; Section Styles shipped in WP 6.6

---

## How to Know These Guidelines Are Working

These guidelines are working if you see:
- **Fewer unnecessary files** — only files the project actually needs
- **Smaller diffs** — only changed lines, no drive-by improvements
- **Clarifying questions BEFORE code** — not after 500 lines of wrong output
- **Explicit assumptions** — "I assumed X because..." not silent guessing
- **Verifiable results** — each output comes with a way to confirm it works
