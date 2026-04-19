# WordPress Block Theme Converter Skill

A Claude skill for converting any HTML/CSS/JavaScript project into a production-ready WordPress Block Theme (Full Site Editing).

**Author:** Md Siddiqur Rahman
**Version:** 1.0.0
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

## Custom Slash Commands

| Command | Purpose |
|---------|---------|
| `/convert-to-wp-theme` | Full conversion of HTML/CSS/JS project to complete block theme |
| `/scaffold-wp-theme` | Create empty block theme scaffold (no source needed) |
| `/wp-pattern` | Convert single HTML section into a registered block pattern |
| `/wp-theme-json` | Generate theme.json from CSS custom properties / design tokens |
| `/wp-template` | Convert single HTML page into FSE template |

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

## Skill Structure

```
wp-block-theme-converter/
├── SKILL.md                       # Main entry point
├── README.md                      # This file
│
├── commands/                      # Slash command definitions
│   ├── convert-to-wp-theme.md
│   ├── scaffold-wp-theme.md
│   ├── wp-pattern.md
│   ├── wp-theme-json.md
│   └── wp-template.md
│
├── references/                    # Detailed reference docs
│   ├── defaults.md                # Default values for placeholders
│   ├── methodology.md             # 10-phase conversion methodology
│   ├── modern-blocks.md           # WordPress 6.5+ features (Interactivity API, Block Bindings, etc.)
│   ├── file-structure.md          # Required output directory layout
│   ├── block-conversion-map.md    # HTML → WP block lookup table
│   ├── theme-json-schema.md       # theme.json v3 reference
│   ├── quality-rules.md           # Non-negotiable do's and don'ts
│   ├── multi-turn-strategy.md     # Splitting large projects
│   ├── woocommerce.md             # WC-specific theming
│   └── validation-checklist.md    # Post-generation checks
│
├── templates/                     # Reusable boilerplate
│   ├── style.css.tpl
│   ├── theme.json.tpl
│   ├── functions.php.tpl
│   ├── pattern-header.php.tpl
│   ├── template-skeleton.html.tpl
│   ├── package.json.tpl
│   └── vite.config.js.tpl
│
└── examples/                      # Worked examples
    ├── northaven-ecommerce.md     # Multi-aesthetic WooCommerce theme
    └── landing-page-simple.md     # Simple SaaS landing page
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

## Quality Guarantees

Every theme generated follows these non-negotiable rules:

- ❌ NO inline `<style>` or `<script>` tags
- ❌ NO `style=""` attributes (use block attributes)
- ❌ NO hardcoded colors/spacing in CSS (use CSS custom properties)
- ❌ NO unescaped output
- ❌ NO direct database queries
- ❌ NO Alpine.js for interactions the Interactivity API can handle
- ❌ NO physical CSS directional properties (use logical properties for RTL)
- ✅ All strings translation-ready
- ✅ Semantic HTML via `tagName`
- ✅ theme.json as single source of truth
- ✅ WCAG 2.1 AA compliant
- ✅ Versioned assets for cache-busting
- ✅ Interactivity API for interactive patterns (modals, tabs, toggles)
- ✅ Per-block CSS loading via `wp_enqueue_block_style()`
- ✅ Font preloading for critical fonts
- ✅ Section Styles for coordinated dark/highlight sections

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
5. **Validate theme.json** at https://validator.poet.so/theme-json before deploying

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
- Use https://validator.poet.so/theme-json

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
