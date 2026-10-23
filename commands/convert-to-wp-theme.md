---
description: Convert a complete HTML/CSS/JavaScript project into a production-ready WordPress block theme (Full Site Editing).
---

# /convert-to-wp-theme

**Purpose:** Convert a complete HTML/CSS/JavaScript project into a production-ready WordPress Block Theme.

## Trigger

User types `/convert-to-wp-theme` followed by project context, OR pastes/attaches HTML files.

## Workflow

### Step 1: Acknowledge & Gather Context

Respond with a short acknowledgment, then check if these inputs are present in the conversation:

| Required Input | Default if Missing |
|----------------|-------------------|
| Theme name | Ask once |
| Theme slug | Derive from theme name (lowercase, hyphenated) |
| Author name | Ask once OR use "Theme Author" |
| Source HTML files | Required — must ask if not provided |
| WooCommerce support | Default: NO unless eCommerce keywords detected |
| Build system | Default: Vite 6 with HMR |
| Design tokens | Extract from source CSS (don't ask) |

If any **required** input is missing, ask the user directly in your response with at most 3 clearly numbered questions in one batch. For optional inputs, use sensible defaults from `${CLAUDE_PLUGIN_ROOT}/references/defaults.md` and note them in "Decisions Made".

### Step 2: Produce Conversion Plan

Before generating any code, produce a markdown table mapping source files to WordPress targets:

```markdown
## Conversion Plan

| Source File | Target | Type | Notes |
|-------------|--------|------|-------|
| index.html | templates/front-page.html | Template | Hero + features + CTA |
| about.html | templates/page-about.html | Custom Template | Registered in theme.json |
| Header section | parts/header.html | Template Part | |
| Footer section | parts/footer.html | Template Part | |
| Hero section | patterns/hero.php | Pattern | Reused on multiple pages |
| Features grid | patterns/features.php | Pattern | |
| Testimonials | patterns/testimonials.php | Pattern | |
```

Show this plan. Then say: *"Ready to generate the theme. Reply 'go' to proceed, or tell me what to adjust."*

Skip the confirmation if the user originally said "just build it" or similar.

### Step 3: Execute 10-Phase Methodology

Read `${CLAUDE_PLUGIN_ROOT}/references/methodology.md` and execute Phases 1-10 in order. Read also:

- `${CLAUDE_PLUGIN_ROOT}/references/file-structure.md` for the required output directory layout
- `${CLAUDE_PLUGIN_ROOT}/references/theme-json-schema.md` for theme.json structure
- `${CLAUDE_PLUGIN_ROOT}/references/block-conversion-map.md` for HTML→Block lookups
- `${CLAUDE_PLUGIN_ROOT}/references/quality-rules.md` for non-negotiable rules

If WooCommerce support is requested, also read `${CLAUDE_PLUGIN_ROOT}/references/woocommerce.md`.

### Step 4: Output Files

Output every file in the theme using this format:

````
=== FILE: {{theme-slug}}/style.css ===
```css
<file content>
```

=== FILE: {{theme-slug}}/theme.json ===
```json
<file content>
```

=== FILE: {{theme-slug}}/functions.php ===
```php
<file content>
```
````

Generate files in this order:

1. `style.css` (theme header)
2. `theme.json`
3. `functions.php` and `inc/*.php`
4. `templates/*.html`
5. `parts/*.html`
6. `patterns/*.php`
7. `styles/*.json` (style variations, if any)
8. `assets/css/*.css`
9. `assets/js/*.js`
10. `package.json`, `vite.config.js`, lint configs
11. `readme.txt`, `.gitignore`, `.editorconfig`

### Step 5: Verify with the Doctor (required)

When every file is written, run the bundled checker on the theme directory with the Bash tool. Do not just describe the command:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/doctor.mjs" <theme-dir>
```

It runs five checks: theme structure, `theme.json`, block markup, pattern headers, and i18n. **Do not tell the user the theme is done until it exits 0.** If it reports violations, fix each one in the theme files and run it again, repeating until it passes. Quote its final `Overall: 5/5 scripts passed.` line in your closing summary. If Bash is unavailable, say so plainly and give the user the command to run. Never claim a theme was verified when the doctor did not run.

### Step 6: Multi-Turn Decision

If the project has **10+ HTML pages OR WooCommerce OR multiple style variations**, automatically apply the multi-turn strategy from `${CLAUDE_PLUGIN_ROOT}/references/multi-turn-strategy.md`:

- **Turn 1:** Foundation (theme.json, templates, parts, functions.php, inc/) — STOP and ask user to say "continue"
- **Turn 2:** Patterns + Block Styles + Style Variations
- **Turn 3:** JavaScript + Assets + Docs, then Step 5 (doctor) once all files exist

For smaller projects (< 10 HTML pages, no WC), do everything in one turn.

### Step 7: Closing Sections

After the doctor passes, ALWAYS include:

```markdown
## Installation Instructions

1. Zip the `{{theme-slug}}/` folder
2. WordPress Admin → Appearance → Themes → Add New → Upload Theme
3. Activate
4. Site Editor → Templates (verify they appear)
5. Run `npm install && npm run build` if Vite is used

## Post-Install Checklist

- [ ] Set front page in Settings → Reading
- [ ] Install required plugins: {{list}}
- [ ] Choose style variation in Site Editor → Styles (if multiple)
- [ ] Replace placeholder screenshot.png with real 1200×900 PNG
- [ ] Add custom logo (Site Editor → Patterns → Logo)

## Build Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server with HMR
npm run build            # Production build
npm run lint:php         # PHPCS check
npm run lint:js          # ESLint check
npm run lint:css         # Stylelint check
```

## Decisions Made

- {{Assumption 1 + rationale}}
- {{Assumption 2 + rationale}}
- {{...}}

## Recommended Next Steps

1. Walk through `${CLAUDE_PLUGIN_ROOT}/references/validation-checklist.md` for the checks the doctor cannot do (visual match, Site Editor, Lighthouse)
2. Test in WP_DEBUG mode to catch any notices
3. Run Lighthouse audit (target: 90+ Performance, 100 Accessibility)

```

## Example Invocation

```

User: /convert-to-wp-theme

I have a 5-page landing site for "Acme SaaS". Files attached.
Use Vite 6, no WooCommerce.

```

→ Claude: Acknowledges → produces Conversion Plan → asks "go?" → generates complete theme → provides install instructions.
