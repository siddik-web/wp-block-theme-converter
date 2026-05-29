---
description: Generate an empty, valid WordPress block theme scaffold from scratch — no source HTML required.
---

# /scaffold-wp-theme

**Purpose:** Generate an empty, valid WordPress Block Theme scaffold with no source HTML to convert. Useful for starting a new theme from scratch.

## Trigger

User types `/scaffold-wp-theme` followed by basic theme info.

## Workflow

### Step 1: Gather Minimum Inputs

Ask the user these questions in your response (one batch):

1. **Theme name** — free text
2. **Style preset** — single select: "Minimal blog", "Editorial magazine", "Portfolio", "Business landing", "WooCommerce store"
3. **Build system** — single select: "Vite 6 (recommended)", "wp-scripts", "None (vanilla)"

If WooCommerce is selected, also ask:
4. **WC features needed** — multi-select: "Single product page", "Product archive", "Cart/Checkout", "My Account", "All of the above"

### Step 2: Apply Style Preset

Each preset maps to a different default `theme.json` and starter patterns:

| Preset | Default Colors | Default Fonts | Starter Patterns |
|--------|---------------|---------------|------------------|
| Minimal blog | Black/white/gray | Inter + Lora | hero-blog, post-grid, newsletter |
| Editorial magazine | Cream/black/red accent | Fraunces + Inter Tight | hero-editorial, featured-grid, author-bio |
| Portfolio | Dark theme, neon accent | Space Grotesk + JetBrains Mono | hero-portfolio, project-grid, contact |
| Business landing | Blue/white | Plus Jakarta Sans | hero-saas, features, pricing, testimonials, cta, footer |
| WooCommerce store | Black/white/gold | Inter + Cormorant | hero-product, product-grid, bundle, reviews, trust-badges |

### Step 3: Generate Files

Output the same file structure as `/convert-to-wp-theme`, but with placeholder content rather than converted source. Read `references/file-structure.md`.

Use templates from `templates/` directory:

- `templates/style.css.tpl` for the theme header
- `templates/theme.json.tpl` for the theme.json
- `templates/functions.php.tpl` for functions.php
- `templates/template-skeleton.html.tpl` for empty templates
- `templates/pattern-header.php.tpl` for pattern files
- `templates/package.json.tpl` for package.json
- `templates/vite.config.js.tpl` for Vite config

Generate at minimum:

- `style.css`
- `theme.json` (with preset colors/fonts)
- `functions.php`
- `inc/theme-setup.php`, `inc/enqueue.php`, `inc/block-patterns.php`
- `templates/index.html`, `front-page.html`, `single.html`, `page.html`, `archive.html`, `404.html`
- `parts/header.html`, `footer.html`
- 3-5 starter patterns based on preset
- `assets/css/style.css`, `editor.css`
- `assets/js/main.js`
- `package.json`, `vite.config.js` (if Vite chosen)
- `readme.txt`, `.gitignore`

### Step 4: Closing Output

```markdown
## Scaffold Complete

Your `{{theme-slug}}` theme scaffold is ready.

## Next Steps

1. **Customize:** Edit `theme.json` to match your brand colors and fonts
2. **Add content:** Use Site Editor to populate templates and parts
3. **Add patterns:** Run `/wp-pattern` to convert HTML sections into patterns
4. **Build:** `npm install && npm run build`
5. **Activate:** Upload to WordPress and activate

## Files Generated

{{count}} files across {{n}} directories.
```

## Example Invocation

```
User: /scaffold-wp-theme

Make me an editorial magazine theme called "The Northaven Review"
```

→ Claude asks 2-3 quick questions → generates complete scaffold with editorial preset.
