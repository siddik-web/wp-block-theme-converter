# Multi-Turn Strategy for Large Projects

## When to Use

Apply multi-turn delivery automatically when ANY of these conditions are true:

- Source has **10+ HTML pages**
- WooCommerce support is enabled (adds 8+ template files)
- Multiple style variations are requested (3+ aesthetic variants)
- Complex JavaScript framework integration (Alpine, GSAP, Three.js, etc.)
- Total estimated output exceeds ~6,000 lines of code

For smaller projects, single-turn delivery is fine.

## Why Split

A complete WordPress block theme can easily exceed 10,000 lines of generated content:

- theme.json: 300-800 lines
- 10 templates × 50-200 lines = 500-2000 lines
- 5 template parts × 30-80 lines = 150-400 lines
- 20 patterns × 50-150 lines = 1000-3000 lines
- 5 PHP includes × 50-200 lines = 250-1000 lines
- CSS files = 500-2000 lines
- JS files = 200-1000 lines

Single-turn delivery for this scale risks:

1. Hitting context window limits mid-generation
2. Reduced quality on later files (model fatigue)
3. Inconsistencies between files
4. Lost detail in critical files

## Three-Turn Split

### Turn 1: Foundation

**Deliver:**

- Conversion Plan (1-page summary)
- Design Token Extraction Table
- `style.css` (theme header)
- `theme.json` (complete schema v3)
- `functions.php` (bootstrap)
- `inc/theme-setup.php`
- `inc/enqueue.php`
- All `templates/*.html` files
- All `parts/*.html` files
- `package.json`
- `vite.config.js` (if Vite)
- `.gitignore`, `.editorconfig`

**Stop with:**
> ✅ **Turn 1 complete: Foundation delivered.**
>
> Ready for Turn 2 (patterns, block styles, style variations)?
>
> Reply **"continue"** to proceed.

### Turn 2: Patterns & Styles

**Deliver:**

- All `patterns/*.php` files
- `inc/block-patterns.php` (category registration)
- `inc/block-styles.php` (block style registration)
- `inc/block-variations.php`
- All `styles/*.json` (style variations, if any)
- Matching CSS for block styles in `assets/css/style.css` and `editor.css`

**Stop with:**
> ✅ **Turn 2 complete: Patterns and styles delivered.**
>
> Ready for Turn 3 (JavaScript, accessibility, i18n, docs)?
>
> Reply **"continue"** to proceed.

### Turn 3: JavaScript, Polish & Docs

**Deliver:**

- All `assets/js/*.js` files
- `assets/css/critical.css` (if needed)
- `assets/css/woocommerce.css` (if WC)
- `inc/woocommerce.php` (if WC)
- `languages/{{text-domain}}.pot` (placeholder structure)
- `readme.txt`
- `phpcs.xml`
- `.eslintrc.json`
- `.stylelintrc.json`
- `postcss.config.js`
- Installation instructions
- Post-install checklist
- Build commands
- Decisions Made section
- Validation checklist (recommended next steps)

**Stop with:**
> ✅ **Turn 3 complete: Theme is production-ready.**
>
> Run validation checks from `references/validation-checklist.md` and let me know if you need any adjustments.

## Communicating the Split

At the start of Turn 1, announce the strategy:

> This is a substantial project ({{n}} HTML pages, {{features}}). I'll deliver in 3 turns to ensure quality:
>
> 1. **Turn 1:** Foundation (theme.json, templates, parts, functions.php)
> 2. **Turn 2:** Patterns, block styles, style variations
> 3. **Turn 3:** JavaScript, polish, docs
>
> Each turn ends with a "continue" prompt. Let's begin.

## Tips

- **State preservation:** At the start of Turns 2 and 3, briefly recap what was delivered (1-2 sentences) so the conversation has context.
- **File naming consistency:** Use the SAME `{{theme-slug}}` across all turns. The user might forget; you cannot.
- **Cross-references:** When patterns reference template parts (or vice versa), explicitly note the relationship.
- **Quality consistency:** Re-read `references/quality-rules.md` at the start of each turn to ensure consistent quality.

## Single-Turn Threshold

If the project meets ALL these criteria, deliver in a single turn:

- ✅ < 10 HTML pages
- ✅ No WooCommerce
- ✅ Single style variation (no multi-aesthetic)
- ✅ Vanilla JS or simple Alpine.js
- ✅ Estimated output < 6,000 lines

For these smaller projects, the user benefits from a single complete delivery.

## Hybrid: Two-Turn for Medium Projects

For projects between thresholds (5-10 pages, no WC):

**Turn 1:** Everything except patterns and JS
**Turn 2:** Patterns, JS, polish, docs

Announce:
> Medium-size project. I'll deliver in 2 turns:
>
> 1. **Turn 1:** Foundation + templates
> 2. **Turn 2:** Patterns + JS + polish
