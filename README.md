# WordPress Block Theme Converter Skill

A Claude skill for converting any HTML/CSS/JavaScript project into a production-ready WordPress Block Theme (Full Site Editing).

**Author:** Md Siddiqur Rahman
**Version:** 2.0.0
**License:** MIT

---

## What This Skill Does

Converts static HTML/CSS/JavaScript projects into complete, production-ready WordPress block themes that are:

- ✅ Compatible with WordPress 6.5+
- ✅ Full Site Editing (FSE) ready
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performance-optimized (Core Web Vitals)
- ✅ Translation-ready (i18n)
- ✅ WooCommerce-compatible (optional)
- ✅ WordPress.org Theme Directory submission-ready
- ✅ CI/CD pipeline ready (GitHub Actions)
- ✅ E2E tested (Playwright)

## Custom Slash Commands

| Command | Purpose |
|---------|---------|
| `/convert-to-wp-theme` | Full conversion of HTML/CSS/JS project to complete block theme |
| `/scaffold-wp-theme` | Create empty block theme scaffold (no source needed) |
| `/wp-pattern` | Convert single HTML section into a registered block pattern |
| `/wp-theme-json` | Generate theme.json from CSS custom properties / design tokens |
| `/wp-template` | Convert single HTML page into FSE template |
| `/wp-block` | Scaffold a custom block (block.json, edit.js, save.js/render.php, CSS) |
| `/wp-migrate` | Migrate existing WP content (Classic Editor, ACF, widgets, CPTs, shortcodes) to block theme |
| `/wp-plugin-theme` | Declare plugin dependencies and generate plugin-specific CSS / compatibility code |
| `/wp-variation` | Generate a style variation (styles/*.json) — dark mode, color palette swap, font swap |
| `/wp-classic-to-fse` | Convert an existing WordPress classic theme (PHP templates) to FSE block theme |
| `/wp-debug` | Diagnose and fix FSE/block-theme failures — block validation errors, theme.json issues, patterns not showing, DB template overrides, PHP warnings, and more |

## Installation

### Option 1: Claude Code

1. Download `wp-block-theme-converter.skill` (or the zip)
2. Place the unzipped folder in your Claude Code skills directory:

   ```bash
   ~/.claude/skills/wp-block-theme-converter/
   ```

3. Restart Claude Code or run `claude reload`
4. Verify: type any of the slash commands listed above

### Option 2: Claude.ai (Project Skills)

1. Open a Claude.ai Project
2. Project settings → Skills → Upload Skill
3. Upload `wp-block-theme-converter.skill`
4. The skill will be available in all conversations within that project

### Option 3: Manual (Cowork / Other Environments)

Place the unzipped `wp-block-theme-converter/` folder in your skills directory. Path varies by environment:

- Cowork: `~/skills/`
- Custom: Configure via `CLAUDE_SKILLS_DIR` environment variable

## Usage

### Basic Workflow

1. **Open a conversation with Claude** (Code, Desktop, or Web)
2. **Invoke a slash command** OR describe your task in natural language
3. **Provide your source HTML/CSS/JS** (paste or attach files)
4. **Claude generates the complete theme** following the 10-phase methodology
5. **Download/copy the files** and install in WordPress

### Example: Quick Landing Page

```
/convert-to-wp-theme

I have a 3-page landing site for "Acme Co".
Use Vite 6, no WooCommerce.

[paste HTML/CSS/JS]
```

### Example: WooCommerce Theme

```
/convert-to-wp-theme

Convert my Northaven Co. eCommerce design system to a WooCommerce block theme.
Include all six aesthetics as style variations.

[attach HTML files]
```

### Example: Pattern Only

```
/wp-pattern

Convert this hero section into a WP block pattern:

<section class="hero">
  <h1>Welcome</h1>
  <p>Subheading</p>
  <a href="#" class="btn">CTA</a>
</section>
```

### Example: Custom Block

```
/wp-block

Scaffold a "Testimonial Slider" custom block with server-side rendering,
an edit.js with InspectorControls, and per-block CSS.
```

### Example: Classic Theme Migration

```
/wp-classic-to-fse

Convert my existing classic PHP theme to a full FSE block theme.
The theme uses a custom page builder and ACF fields.
```

## Skill Structure

```
wp-block-theme-converter/
├── SKILL.md                              # Main entry point
├── README.md                             # This file
│
├── commands/                             # Slash command definitions
│   ├── convert-to-wp-theme.md
│   ├── scaffold-wp-theme.md
│   ├── wp-block.md
│   ├── wp-classic-to-fse.md
│   ├── wp-migrate.md
│   ├── wp-pattern.md
│   ├── wp-plugin-theme.md
│   ├── wp-template.md
│   ├── wp-theme-json.md
│   └── wp-variation.md
│
├── references/                           # Detailed reference docs
│   ├── defaults.md                       # Default values for placeholders
│   ├── methodology.md                    # 10-phase conversion methodology
│   ├── modern-blocks.md                  # WordPress 6.5+ features (Interactivity API, Block Bindings, etc.)
│   ├── file-structure.md                 # Required output directory layout
│   ├── block-conversion-map.md           # HTML → WP block lookup table
│   ├── theme-json-schema.md              # theme.json v3 reference
│   ├── quality-rules.md                  # Non-negotiable do's and don'ts
│   ├── multi-turn-strategy.md            # Splitting large projects
│   ├── woocommerce.md                    # WC-specific theming
│   ├── validation-checklist.md           # Post-generation checks
│   ├── custom-blocks.md                  # Custom block development (block.json, edit.js, render.php)
│   ├── content-migration.md              # Classic-to-block, WP-CLI, ACF, CPTs, page builder migration
│   ├── asset-optimization.md             # Fonts, images, WebP, lazy load, Core Web Vitals
│   ├── plugin-compatibility.md           # Plugin detection, CSS conflicts, caching compat
│   ├── interactivity-api-advanced.md     # Shared store, server hydration, async, focus traps
│   ├── accessibility.md                  # WCAG 2.1 AA, ARIA, skip links, screen reader testing
│   ├── ci-cd.md                          # GitHub Actions, PHPCS, ESLint, Stylelint, deployment
│   ├── backward-compatibility.md         # Feature availability by WP version, conditional loading
│   ├── e2e-testing.md                    # Playwright, visual regression, a11y scans, CI integration
│   └── i18n.md                           # i18n functions, plural forms, JS translations, RTL
│
├── templates/                            # Reusable boilerplate
│   ├── style.css.tpl
│   ├── theme.json.tpl
│   ├── functions.php.tpl
│   ├── pattern-header.php.tpl
│   ├── template-skeleton.html.tpl
│   ├── package.json.tpl
│   ├── vite.config.js.tpl
│   ├── github-actions-ci.yml.tpl
│   └── patterns/
│       ├── hero.php.tpl
│       ├── features-grid.php.tpl
│       ├── testimonials.php.tpl
│       ├── pricing-table.php.tpl
│       ├── cta-section.php.tpl
│       ├── faq-accordion.php.tpl
│       ├── team-grid.php.tpl
│       └── stats-row.php.tpl
│
└── examples/                             # Worked examples
    ├── northaven-ecommerce.md            # Multi-aesthetic WooCommerce theme
    └── landing-page-simple.md           # Simple SaaS landing page
```

## How It Works

### Progressive Disclosure

The skill uses Claude's three-level loading:

1. **SKILL.md metadata** — always in context (~100 words)
2. **SKILL.md body** — loaded when skill triggers (~400 lines)
3. **Reference files** — loaded on-demand as needed

This means Claude doesn't load the WooCommerce reference for a simple landing page conversion — it only loads what's relevant to the task.

### 10-Phase Methodology

Every conversion follows the same proven phases:

1. **Audit & Extract** — parse source, identify reusable components
2. **theme.json** — generate schema v3 with full settings + styles (incl. Section Styles, dimensions, position)
3. **Templates & Parts** — convert HTML pages to FSE block markup
4. **Block Patterns** — register sections as reusable patterns
5. **Block Styles & Variations** — register custom variants via theme.json + PHP
6. **JavaScript Integration** — Interactivity API for interactive patterns; classic enqueue for complex libs
7. **functions.php & inc/** — bootstrap files (WP Coding Standards)
8. **Accessibility & Performance** — WCAG 2.1 AA + Core Web Vitals + per-block CSS + font preloading
9. **i18n** — translation-ready strings everywhere
10. **README & Docs** — WordPress.org-format readme.txt

### Multi-Turn for Large Projects

The skill automatically detects large projects and splits delivery across 3 turns:

- **Turn 1:** Foundation (theme.json, templates, parts, functions.php)
- **Turn 2:** Patterns + Block Styles + Style Variations
- **Turn 3:** JavaScript + Assets + Docs

Triggered when source has 10+ HTML pages OR WooCommerce OR multiple style variations.

### Behavioral Principles

Every output is governed by four non-negotiable principles:

1. **Think Before Coding** — surface assumptions, present tradeoffs, ask before guessing
2. **Simplicity First** — minimum code that solves the problem; no speculative features
3. **Surgical Changes** — touch only what the task requires; don't improve adjacent code
4. **Goal-Driven Execution** — define verifiable success criteria before writing any file

## Quality Guarantees

Every theme generated follows these non-negotiable rules:

- ❌ NO inline `<style>` or `<script>` tags
- ❌ NO `style=""` attributes (use block attributes)
- ❌ NO hardcoded colors/spacing in CSS (use CSS custom properties)
- ❌ NO unescaped output
- ❌ NO direct database queries
- ❌ NO Alpine.js for interactions the Interactivity API can handle
- ❌ NO physical CSS directional properties (use logical properties for RTL)
- ❌ NO speculative features the user didn't ask for
- ✅ All strings translation-ready
- ✅ Semantic HTML via `tagName`
- ✅ theme.json as single source of truth
- ✅ WCAG 2.1 AA compliant
- ✅ Versioned assets for cache-busting
- ✅ Interactivity API for interactive patterns (modals, tabs, toggles)
- ✅ Per-block CSS loading via `wp_enqueue_block_style()`
- ✅ Font preloading for critical fonts
- ✅ Section Styles for coordinated dark/highlight sections
- ✅ Editor parity — all frontend CSS mirrored in editor.css

## Production / Reliability

### Automated Output Verification

Every theme generated by this skill can be verified using the bundled scripts:

```bash
# Run all checks at once — exits 0 only if everything passes
node scripts/doctor.mjs path/to/your-theme

# Or run individual checks
node scripts/validate-theme-json.mjs path/to/your-theme   # theme.json schema + token checks
node scripts/lint-block-markup.mjs path/to/your-theme     # inline styles/scripts, block delimiter integrity
node scripts/check-patterns.mjs path/to/your-theme        # pattern headers, slugs, duplicates
node scripts/check-i18n.mjs path/to/your-theme            # i18n coverage + anti-patterns
```

The skill's Step 5 (Verify) instructs Claude to run `doctor.mjs` and **loop until it passes** before declaring a theme complete. No npm install required — pure Node stdlib.

### Debugging Generated Themes

If something looks wrong after generation, use `/wp-debug`:

```
/wp-debug

My pattern doesn't appear in the inserter and I can't figure out why.
```

Claude will run through a decision tree, identify the root cause (missing category registration, theme.json conflict, etc.), and offer to apply the fix. See `references/troubleshooting.md` for the full symptom → cause → fix reference.

### Page Builder Migration

Moving off Elementor, Divi, WPBakery, or Beaver Builder? Use `/wp-migrate` — it now includes full builder-detection and per-builder playbooks. See `references/page-builder-migration.md` for element-to-block mapping tables, WP-CLI extraction commands, and a worked Elementor example in `examples/elementor-to-block-theme.md`.

### Skill Quality

The skill ships with:

- **`evals/`** — trigger/no-trigger/ambiguous test cases per command (see `evals/README.md`)
- **`scripts/validate-skill.mjs`** — structural linter for the skill itself (checks command files exist, no dead links, frontmatter valid)
- **`scripts/build-skill.sh`** — produces the distributable `.skill` zip artifact
- **`CHANGELOG.md`** — full version history
- **`.github/workflows/skill-ci.yml`** — CI: validate-skill, lint-scripts, doctor against golden theme, markdown lint

## Compatibility

- **Claude Code:** ✅ Full support (all slash commands)
- **Claude.ai (Projects):** ✅ Full support
- **Cowork:** ✅ Full support
- **Anthropic API:** ✅ Works as a system prompt addendum

## Tips for Best Results

1. **Use Claude Opus** for the full conversion (`/convert-to-wp-theme`) — provides maximum context window for large outputs
2. **Provide design tokens upfront** if your CSS doesn't use custom properties
3. **For 10+ page projects**, expect 3 turns and have time to "continue" between them
4. **For WooCommerce themes**, ensure WooCommerce will be installed on the target site
5. **For classic theme migrations**, use `/wp-classic-to-fse` which handles ACF, CPTs, and page builder content
6. **Validate theme.json** at https://www.jsonschemavalidator.net/ using schema URL `https://schemas.wp.org/trunk/theme.json` before deploying

## Troubleshooting

### "The skill didn't trigger"

- Check that you used one of the trigger phrases or slash commands
- Verify the skill is installed: list available skills with `/skills`
- For natural language, use phrases like "convert this to a WordPress theme" or "make this an FSE theme"

### "The output is incomplete"

- Likely hit context limits — large projects need multi-turn delivery
- Reply "continue" to get the next batch
- Consider using `/scaffold-wp-theme` first, then `/wp-pattern` per section

### "theme.json doesn't validate"

- Ensure no trailing commas
- Verify `version: 3` (not 1 or 2)
- Check that all `fontFace.src` paths actually exist
- Validate online at https://www.jsonschemavalidator.net/ using schema URL `https://schemas.wp.org/trunk/theme.json`

### "Classic theme migration isn't picking up my ACF fields"

- Use `/wp-migrate` with the ACF field group export (JSON) attached
- The `references/content-migration.md` documents all supported field types and Block Bindings strategies

### "My Elementor / Divi / WPBakery site won't migrate cleanly"

- Use `/wp-migrate` — it detects your page builder and applies the correct strategy
- See `references/page-builder-migration.md` for per-builder element→block mapping tables
- See `examples/elementor-to-block-theme.md` for a complete worked migration example

### "Something else is broken and I don't know why"

- Use `/wp-debug` — describe your symptom and Claude will identify the root cause
- See `references/troubleshooting.md` for the full 18-symptom reference with WP-CLI cheat sheet

### "My custom block isn't showing in the editor"

- Ensure `block.json` is in the correct directory and registered via `register_block_type()`
- Check the browser console for JS errors from `edit.js`
- Run `npm run build` if using a build step — the editor loads the compiled assets

## Contributing

To improve this skill:

1. Edit the relevant files in your local copy
2. Test changes by running a conversion
3. Compare output quality before/after
4. Submit improvements via the source repository

## License

MIT License — free to use, modify, and distribute.

## Credits

- Based on Md Siddiqur Rahman's master prompt for WordPress Block Theme conversion
- Methodology distilled from 10+ years of WordPress + Joomla extension development
- Built for the EU remote WordPress freelance community
