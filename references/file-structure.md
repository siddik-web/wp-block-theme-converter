# Required File Structure

The output theme MUST follow this exact directory structure. Adjust based on features needed (WooCommerce, build system, style variations).

## Standard Block Theme

```
{{theme-slug}}/
├── style.css                          # Theme header (REQUIRED)
├── theme.json                         # Global styles & settings (REQUIRED)
├── functions.php                      # Theme bootstrap
├── readme.txt                         # WordPress.org format
├── screenshot.png                     # 1200×900 PNG (placeholder note)
├── package.json                       # Build dependencies (if Vite)
├── vite.config.js                     # Vite config (if Vite)
├── postcss.config.js                  # PostCSS config
├── .gitignore
├── .editorconfig
├── phpcs.xml                          # WP Coding Standards
├── .eslintrc.json                     # ESLint config
├── .stylelintrc.json                  # Stylelint config
│
├── inc/                               # PHP includes
│   ├── theme-setup.php                # add_theme_support() + load_theme_textdomain()
│   ├── enqueue.php                    # All wp_enqueue_* calls
│   ├── block-patterns.php             # register_block_pattern_category()
│   ├── block-styles.php               # register_block_style() calls
│   ├── block-variations.php           # Enqueue JS variations
│   ├── block-bindings.php             # Block Bindings API sources (optional)
│   └── template-functions.php         # Helper functions (optional)
│
├── templates/                         # FSE templates (.html)
│   ├── index.html                     # Generic fallback (REQUIRED)
│   ├── front-page.html                # Static homepage
│   ├── home.html                      # Blog index
│   ├── single.html                    # Single post
│   ├── page.html                      # Static page
│   ├── archive.html                   # Category/tag/author archive
│   ├── search.html                    # Search results
│   ├── 404.html                       # Not found
│   └── page-{slug}.html               # Custom page templates (optional)
│
├── parts/                             # Template parts
│   ├── header.html                    # Site header (REQUIRED)
│   ├── footer.html                    # Site footer (REQUIRED)
│   ├── sidebar.html                   # Optional sidebar
│   └── post-meta.html                 # Optional post metadata
│
├── patterns/                          # Block patterns (.php)
│   ├── hero.php
│   ├── features.php
│   ├── testimonials.php
│   ├── cta.php
│   ├── footer-default.php
│   └── ...                            # One per major section
│
├── styles/                            # theme.json variations (optional)
│   ├── dark.json                      # Dark mode
│   └── ...                            # Other style variants
│
├── assets/
│   ├── css/
│   │   ├── editor.css                 # Editor-only styles
│   │   ├── style.css                  # Compiled frontend (if Vite)
│   │   ├── critical.css               # Above-fold critical CSS (optional)
│   │   └── blocks/                    # Per-block CSS (loaded conditionally)
│   │       ├── quote.css
│   │       ├── cover.css
│   │       ├── navigation.css
│   │       ├── table.css
│   │       ├── separator.css
│   │       └── details.css
│   ├── js/
│   │   ├── main.js                    # Frontend interactions (classic)
│   │   ├── interactions.js            # Interactivity API store (ES module)
│   │   ├── editor.js                  # Editor enhancements
│   │   └── block-variations.js        # Block variation registrations
│   ├── fonts/                         # Self-hosted fonts (GDPR-safe)
│   │   ├── {{font-name-1}}/
│   │   │   ├── {{font}}-regular.woff2
│   │   │   ├── {{font}}-bold.woff2
│   │   │   └── ...
│   │   └── {{font-name-2}}/
│   ├── images/
│   └── icons/
│
├── languages/
│   └── {{text-domain}}.pot            # Translation template
│
└── src/                               # Source files (if Vite)
    ├── css/
    │   ├── style.css                  # Source CSS
    │   └── editor.css                 # Source editor CSS
    └── js/
        ├── main.js                    # Source JS
        └── editor.js
```

## WooCommerce Theme (additions)

Add these files when WooCommerce support is enabled:

```
{{theme-slug}}/
├── inc/
│   └── woocommerce.php                # WC theme support + hooks
│
├── templates/
│   ├── single-product.html            # Single product page
│   ├── archive-product.html           # Shop / product archive
│   ├── taxonomy-product_cat.html      # Product category
│   ├── taxonomy-product_tag.html      # Product tag
│   ├── product-search-results.html    # Product search
│   ├── page-cart.html                 # Cart page
│   ├── page-checkout.html             # Checkout page
│   └── page-my-account.html           # My Account page
│
├── parts/
│   ├── header-minimal.html            # Reduced header for checkout
│   ├── footer-minimal.html            # Reduced footer for checkout
│   ├── product-filters.html           # Sidebar filters
│   └── mini-cart.html                 # Header mini cart
│
└── patterns/                          # WC-specific patterns
    ├── product-grid-default.php
    ├── product-quick-view.php
    ├── product-compare.php
    ├── bundle-section.php
    ├── reviews-editorial.php
    ├── trust-badges.php
    └── shipping-returns-info.php
```

## Multi-Aesthetic Theme (additions)

Add multiple style variations in `/styles/`:

```
styles/
├── {{aesthetic-1}}.json
├── {{aesthetic-2}}.json
└── ...
```

Each is a partial theme.json that overrides the base. WordPress merges them. Users select via Site Editor → Styles → Browse Styles.

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Template files | kebab-case `.html` | `front-page.html` |
| Custom page templates | `page-{slug}.html` | `page-about.html` |
| Template parts | kebab-case `.html` | `header-minimal.html` |
| Pattern files | kebab-case `.php` | `hero-editorial.php` |
| Style variations | kebab-case `.json` | `dark.json`, `swiss-minimalist.json` |
| PHP includes | kebab-case `.php` | `block-patterns.php` |
| CSS files | kebab-case `.css` | `editor.css` |
| JS files | kebab-case `.js` | `block-variations.js` |
| Font directories | kebab-case | `inter-tight/` |

## Required vs Optional Files

**Required for theme to load:**
- `style.css` (with valid theme header)
- `theme.json`
- `templates/index.html`

**Required for full FSE experience:**
- `functions.php`
- `parts/header.html`
- `parts/footer.html`
- All standard templates (front-page, home, single, page, archive, search, 404)

**Required for WordPress.org submission:**
- `readme.txt` (WordPress.org format)
- `screenshot.png` (1200×900 PNG)
- `languages/{{text-domain}}.pot`
- License header in `style.css`
- Copyright/attribution section in `readme.txt`

**Optional but recommended:**
- `inc/` directory with separated bootstrap files
- Build tooling (`package.json`, `vite.config.js`)
- Linting configs (`phpcs.xml`, `.eslintrc.json`, `.stylelintrc.json`)
- Style variations in `/styles/`
