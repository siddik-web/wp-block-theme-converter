# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] — v3.0.0

### Added

#### P0 — Deterministic Validation Scripts
- `scripts/doctor.mjs` — all-in-one diagnostic runner that validates a generated theme directory
- `scripts/validate-theme-json.mjs` — validates `theme.json` against the FSE schema v3
- `scripts/lint-block-markup.mjs` — lints HTML block comment markup for common mistakes
- `scripts/check-patterns.mjs` — checks pattern PHP headers and category registration

#### P1 — Debugging Command + Troubleshooting Reference
- `commands/wp-debug.md` — `/wp-debug` slash command for systematic WordPress debugging
- `references/troubleshooting.md` — indexed troubleshooting reference (white screen, block errors, style issues, editor parity failures)

#### P2 — Page Builder Migration
- `references/page-builder-migration.md` — migration guides for Elementor, Divi, WPBakery, and Beaver Builder to FSE block themes
- Extended `commands/wp-migrate.md` with page builder detection and migration workflow
- `examples/elementor-migration.md` — end-to-end worked example: Elementor site → FSE block theme

#### P3 — Production Hardening + Skill Infra
- `evals/` — structured eval suite with should-trigger, should-not-trigger, and ambiguous query sets for every command
- `evals/README.md` — documentation on how to run and interpret evals
- `scripts/validate-skill.mjs` — structural integrity checker for this skill itself
- `scripts/build-skill.sh` — packages the skill as a distributable `.skill` zip artifact
- `CHANGELOG.md` (this file)
- `LICENSE` — MIT License
- `CONTRIBUTING.md` — contribution guidelines
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template with eval result requirements
- `.github/workflows/skill-ci.yml` — GitHub Actions CI: skill validation, script linting, doctor golden theme, markdown lint

#### P4 — Golden Reference Theme + README
- `examples/_generated/landing-page-theme/` — golden reference theme generated from `examples/landing-page-simple.md`
- `README.md` Production Reliability section — documents validation scripts, CI, and contribution process

---

## [2.0.0] — 2024-12-15

### Added

#### Slash Commands (10 total)
- `commands/convert-to-wp-theme.md` — full HTML/CSS/JS → block theme conversion workflow
- `commands/scaffold-wp-theme.md` — empty block theme scaffolding
- `commands/wp-pattern.md` — single HTML section → registered block pattern
- `commands/wp-theme-json.md` — design system / CSS custom properties → theme.json
- `commands/wp-template.md` — single HTML page → FSE template
- `commands/wp-block.md` — custom block scaffolding (block.json, edit.js, save.js/render.php, CSS)
- `commands/wp-migrate.md` — Classic Editor, ACF, widgets, CPTs, shortcodes → block theme
- `commands/wp-plugin-theme.md` — plugin dependency declaration + plugin-specific CSS
- `commands/wp-variation.md` — style variation generation (dark mode, color palette swap, font swap)
- `commands/wp-classic-to-fse.md` — classic PHP template theme → FSE block theme

#### Reference Files (20 total)
- `references/defaults.md` — default values table for silent user inputs
- `references/methodology.md` — 10-phase conversion methodology
- `references/modern-blocks.md` — Interactivity API, Block Bindings, per-block CSS, Section Styles
- `references/file-structure.md` — FSE theme directory layout
- `references/block-conversion-map.md` — HTML element → WordPress block mapping
- `references/theme-json-schema.md` — theme.json v3 schema with examples
- `references/quality-rules.md` — do/don't rules applied to every generated file
- `references/multi-turn-strategy.md` — large project (10+ pages) delivery strategy
- `references/custom-blocks.md` — block.json schema, edit.js patterns, render.php, deprecations
- `references/content-migration.md` — WP-CLI commands, ACF bindings, CPT templates, page builder detection
- `references/asset-optimization.md` — fonts, images, per-block CSS, JS deferral, Core Web Vitals
- `references/plugin-compatibility.md` — plugin detection, CSS conflict resolution, caching compat
- `references/interactivity-api-advanced.md` — shared store, server hydration, async actions, focus traps
- `references/accessibility.md` — skip links, ARIA patterns, focus management, color contrast
- `references/ci-cd.md` — GitHub Actions, PHPCS, ESLint/Stylelint, Theme Check, SSH deployment
- `references/backward-compatibility.md` — feature availability by WP version, conditional loading
- `references/e2e-testing.md` — Playwright setup, visual regression, a11y scans, CI integration
- `references/i18n.md` — i18n functions, plural forms, JS translations, .pot generation, RTL
- `references/woocommerce.md` — WooCommerce block templates, HPOS, product query patterns
- `references/validation-checklist.md` — post-generation verification checklist

#### WooCommerce Support
- Full WooCommerce block template support (product archive, single, cart, checkout)
- HPOS compatibility declaration
- `templates/patterns/woocommerce-product-card.php.tpl` — Query Loop product card

#### Templates (19 total)
- Core boilerplate templates: `style.css.tpl`, `theme.json.tpl`, `functions.php.tpl`, `pattern-header.php.tpl`, `template-skeleton.html.tpl`
- Build tooling templates: `package.json.tpl`, `vite.config.js.tpl`, `github-actions-ci.yml.tpl`
- Pattern templates: `hero.php.tpl`, `features-grid.php.tpl`, `testimonials.php.tpl`, `pricing-table.php.tpl`, `cta-section.php.tpl`, `faq-accordion.php.tpl`, `team-grid.php.tpl`, `stats-row.php.tpl`, `woocommerce-product-card.php.tpl`

#### CI/CD
- GitHub Actions workflow template (PHPCS, ESLint, Stylelint, Vite build)
- PHPCS WordPress-Extra configuration guidance

#### E2E Testing
- Playwright setup and configuration reference
- Visual regression testing patterns
- Accessibility scan integration

#### Internationalization (i18n)
- Full i18n reference with all WordPress translation functions
- JS translations via `wp_set_script_translations()`
- `.pot` file generation workflow
- RTL layout guidance

#### Page Builder Awareness
- Page builder detection heuristics in `references/content-migration.md`
- Shortcode extraction and migration patterns

#### Four Behavioral Principles
- Principle 1: Think Before Coding
- Principle 2: Simplicity First
- Principle 3: Surgical Changes
- Principle 4: Goal-Driven Execution

---

## [1.0.0] — 2024-10-01

### Added
- Initial release of the WordPress Block Theme Converter skill
- Core HTML → WordPress block theme conversion workflow
- `SKILL.md` with trigger phrases and behavioral guidelines
- Basic theme.json generation from CSS custom properties
- Block pattern creation from HTML sections
- FSE template generation from HTML pages
- `functions.php` bootstrap with WordPress Coding Standards compliance
- Theme file structure following WordPress.org requirements
- Quality rules: no inline styles, no hardcoded colors, translatable strings
- Basic Interactivity API guidance for modals, tabs, and toggles
- Examples: `northaven-ecommerce.md` (WooCommerce), `landing-page-simple.md` (minimal)

[Unreleased]: https://github.com/siddik-web/wp-block-theme-converter/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/siddik-web/wp-block-theme-converter/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/siddik-web/wp-block-theme-converter/releases/tag/v1.0.0
