# Example: Northaven Co. — Multi-Aesthetic WooCommerce Theme

A complete worked example showing how to apply this skill to a complex WooCommerce theme with six design variations.

## Project Profile

- **Source:** Alpine.js eCommerce design system
- **Pages:** 8 HTML files (1 product detail + 1 listing + 6 aesthetic variants)
- **Total source:** ~12,000 lines (HTML + CSS + JS)
- **Complexity:** HIGH — requires multi-turn delivery
- **Aesthetics:** 6 (Swiss Minimalist, Hypebeast Streetwear, Scandinavian Organic, Wabi-Sabi, Y2K Retro-Tech, Military Heritage Editorial)
- **WooCommerce:** YES

## Filled-In Prompt

When the user invokes `/convert-to-wp-theme` with this project, gather these inputs (most can be inferred from conversation memory if available):

```yaml
Theme Identity:
  name: "Northaven Co."
  slug: "northaven"
  text_domain: "northaven"
  uri: "https://northaven.co"
  author: "Md Siddiqur Rahman"
  author_uri: "https://github.com/siddik-web"
  description: "A premium, conversion-focused WooCommerce block theme with six distinctive design aesthetics. Built for modern eCommerce brands that demand performance, accessibility, and editorial polish."
  version: "1.0.0"
  requires_wp: "6.5"
  requires_php: "7.4"
  license: "GPL-2.0-or-later"
  tags: "e-commerce, full-site-editing, block-styles, wide-blocks, block-patterns, custom-colors, custom-logo, custom-menu, editor-style, featured-images, threaded-comments, translation-ready, rtl-language-support"

Source Project:
  type: "WooCommerce eCommerce theme with multi-variation product pages"
  html_files:
    - "index.html (product detail — 2,000+ lines)"
    - "listing.html (product listing with filters/quick-view/compare)"
    - "swiss-minimalist.html"
    - "hypebeast-streetwear.html"
    - "scandinavian-organic.html"
    - "wabi-sabi.html"
    - "y2k-retro-tech.html"
    - "military-heritage.html"
  css_architecture: "Vanilla CSS with CSS Custom Properties"
  js_framework: "Alpine.js 3.x + shared-products.js module"
  design_language: "Six distinct aesthetics"
  target_audience: "EU/global eCommerce merchants, fashion & lifestyle brands"

Design Tokens:
  colors:
    primary: "#0A0A0A"        # Northaven Black
    secondary: "#1A1A1A"      # Surface Dark
    accent: "#D4AF37"         # Editorial Gold
    background: "#FAFAF7"     # Off-white paper
    surface: "#FFFFFF"
    text: "#0A0A0A"
    muted: "#6B6B6B"
    border: "#E5E5E0"
    success: "#2D5F3F"        # In-stock
    warning: "#C9682E"        # Low stock
    error: "#A02929"          # Out of stock
  fonts:
    heading: '"Fraunces", Georgia, serif'
    body: '"Inter Tight", system-ui, sans-serif'
    mono: '"JetBrains Mono", ui-monospace, monospace'
  layout:
    container_width: "1280px"
    wide_width: "1480px"
  border_radius: "none, sm (4px), md (8px), lg (16px), pill (999px)"
  shadows: "sm, md, lg, editorial"

Build Tooling:
  build: "Vite 6 with HMR (sentinel file approach)"
  postcss: "autoprefixer + nesting"
  linting:
    php: "PHPCS WordPress-Extra"
    js: "@wordpress/eslint-plugin"
    css: "Stylelint @wordpress/stylelint-config"
  node: "20+"

WooCommerce:
  required: true
  features:
    - "Single product page with custom patterns"
    - "Product Collection block (archive)"
    - "Cart + Checkout block templates"
    - "My Account templates"
  recommended_plugins:
    - "WooCommerce 9.0+"
    - "Klarna / Afterpay (BNPL display)"
    - "Yoast SEO or Rank Math"
    - "WP Rocket or LiteSpeed Cache"
```

## Northaven-Specific Conversion Plan

```markdown
## Conversion Plan

| Source | Target | Type | Notes |
|--------|--------|------|-------|
| Header section (all files) | parts/header.html | Template Part | With mini-cart + nav |
| Header section (checkout) | parts/header-minimal.html | Template Part | Minimal for cart/checkout |
| Footer section (all files) | parts/footer.html | Template Part | |
| Footer section (checkout) | parts/footer-minimal.html | Template Part | |
| index.html (product detail) | templates/single-product.html | WC Template | Uses single-product blocks + 6 patterns |
| listing.html | templates/archive-product.html | WC Template | product-collection + filters sidebar |
| swiss-minimalist.html | patterns/product-detail-swiss.php + styles/swiss-minimalist.json | Pattern + Style Variation | |
| hypebeast-streetwear.html | patterns/product-detail-hypebeast.php + styles/hypebeast.json | Pattern + Style Variation | |
| scandinavian-organic.html | patterns/product-detail-scandinavian.php + styles/scandinavian.json | Pattern + Style Variation | |
| wabi-sabi.html | patterns/product-detail-wabi-sabi.php + styles/wabi-sabi.json | Pattern + Style Variation | |
| y2k-retro-tech.html | patterns/product-detail-y2k.php + styles/y2k.json | Pattern + Style Variation | |
| military-heritage.html | patterns/product-detail-military.php + styles/military.json | Pattern + Style Variation | |
| Hero section (each variant) | patterns/hero-editorial.php, hero-product-launch.php | Patterns | |
| AI Size Recommender | patterns/ai-size-recommender.php | Pattern | Alpine.js component |
| Social Proof toast | patterns/social-proof-toast.php | Pattern | Alpine.js component |
| Countdown timer | patterns/countdown-timer.php | Pattern | Configurable via attrs |
| BNPL display | patterns/bnpl-display.php | Pattern | Klarna/Afterpay |
| Bundle section | patterns/bundle-section.php | Pattern | WC bundle support |
| Reviews section | patterns/reviews-editorial.php | Pattern | WC reviews integration |
| Quick View | patterns/product-quick-view.php | Pattern | Modal via Alpine |
| Compare | patterns/product-compare.php | Pattern | Side-by-side comparison |
| Filters sidebar | parts/product-filters.html | Template Part | WC filter blocks |
| shared-products.js | assets/js/shared-products.js | JS | Ported, hooked to Query Loop |
```

## Multi-Turn Strategy

This project triggers automatic multi-turn split (10+ HTML pages + WooCommerce + 6 style variations).

### Turn 1: Foundation
- `style.css`, `theme.json` (base/Swiss Minimalist), `functions.php`
- `inc/theme-setup.php`, `inc/enqueue.php`, `inc/woocommerce.php`
- All 16 templates (8 standard + 8 WC)
- All 8 template parts
- `package.json`, `vite.config.js`, lint configs, `.gitignore`

### Turn 2: Patterns & Style Variations
- All 22 patterns (product-detail × 6, hero × 2, AI recommender, social proof, countdown, BNPL, bundle, reviews, quick view, compare, filters, newsletter, trust badges, shipping info, footer × 2)
- 6 style variations in `/styles/`
- `inc/block-patterns.php`, `inc/block-styles.php`, `inc/block-variations.php`
- Block style CSS in `assets/css/style.css` and `editor.css`

### Turn 3: JavaScript & Polish
- `assets/js/main.js`, `editor.js`, `block-variations.js`
- `assets/js/alpine-init.js`, `size-recommender.js`, `social-proof.js`, `countdown.js`
- `assets/js/shared-products.js` (ported)
- `assets/css/woocommerce.css`, `alpine-components.css`
- `languages/northaven.pot`
- `readme.txt`
- Installation + post-install + build commands + decisions

## Key Northaven-Specific Decisions

1. **Six aesthetics → six style variations** (not six themes). Users select via Site Editor → Styles → Browse Styles. This way one theme installation supports all six looks without duplication.

2. **Swiss Minimalist is the base theme.json**. The other five are partial overrides in `/styles/`.

3. **Alpine.js bundled via Vite** rather than CDN — guarantees CSP compatibility and avoids SRI maintenance. Init via `assets/js/alpine-init.js`.

4. **Custom Alpine components defined in JS** — no inline `x-data` attributes in patterns (which would violate CSP and our quality rules).

5. **AI Size Recommender as a pattern + JS module** — pattern provides markup, JS handles fetching from configurable endpoint via `wp_localize_script()`.

6. **WooCommerce Product Collection block** preferred over legacy product blocks — newer, more performant, supports filtering natively.

7. **HPOS compatibility declared** in `inc/woocommerce.php` for future-proofing.

8. **Self-host all three fonts** (Fraunces, Inter Tight, JetBrains Mono) in `assets/fonts/` for GDPR compliance.

9. **Preload Fraunces + Inter Tight** woff2 files (the LCP-relevant fonts).

10. **Critical CSS inlined** for product detail page above-the-fold (gallery + title + price + add-to-cart).

## Sample Output: theme.json (base / Swiss Minimalist)

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "settings": {
        "appearanceTools": true,
        "useRootPaddingAwareAlignments": true,
        "layout": {
            "contentSize": "1280px",
            "wideSize": "1480px"
        },
        "color": {
            "defaultPalette": false,
            "defaultGradients": false,
            "palette": [
                { "slug": "primary", "color": "#0A0A0A", "name": "Northaven Black" },
                { "slug": "secondary", "color": "#1A1A1A", "name": "Surface Dark" },
                { "slug": "accent", "color": "#D4AF37", "name": "Editorial Gold" },
                { "slug": "background", "color": "#FAFAF7", "name": "Paper" },
                { "slug": "surface", "color": "#FFFFFF", "name": "Surface" },
                { "slug": "text", "color": "#0A0A0A", "name": "Text" },
                { "slug": "muted", "color": "#6B6B6B", "name": "Muted" },
                { "slug": "border", "color": "#E5E5E0", "name": "Border" },
                { "slug": "success", "color": "#2D5F3F", "name": "In Stock" },
                { "slug": "warning", "color": "#C9682E", "name": "Low Stock" },
                { "slug": "error", "color": "#A02929", "name": "Out of Stock" }
            ]
        },
        "typography": {
            "fluid": true,
            "fontFamilies": [
                {
                    "slug": "heading",
                    "name": "Heading",
                    "fontFamily": "\"Fraunces\", Georgia, serif",
                    "fontFace": [
                        { "fontFamily": "Fraunces", "fontStyle": "normal", "fontWeight": "400", "src": ["file:./assets/fonts/fraunces/fraunces-regular.woff2"] },
                        { "fontFamily": "Fraunces", "fontStyle": "normal", "fontWeight": "600", "src": ["file:./assets/fonts/fraunces/fraunces-semibold.woff2"] },
                        { "fontFamily": "Fraunces", "fontStyle": "normal", "fontWeight": "700", "src": ["file:./assets/fonts/fraunces/fraunces-bold.woff2"] }
                    ]
                },
                {
                    "slug": "body",
                    "name": "Body",
                    "fontFamily": "\"Inter Tight\", system-ui, sans-serif",
                    "fontFace": [
                        { "fontFamily": "Inter Tight", "fontStyle": "normal", "fontWeight": "400", "src": ["file:./assets/fonts/inter-tight/inter-tight-regular.woff2"] },
                        { "fontFamily": "Inter Tight", "fontStyle": "normal", "fontWeight": "500", "src": ["file:./assets/fonts/inter-tight/inter-tight-medium.woff2"] },
                        { "fontFamily": "Inter Tight", "fontStyle": "normal", "fontWeight": "600", "src": ["file:./assets/fonts/inter-tight/inter-tight-semibold.woff2"] }
                    ]
                },
                {
                    "slug": "mono",
                    "name": "Monospace",
                    "fontFamily": "\"JetBrains Mono\", ui-monospace, monospace",
                    "fontFace": [
                        { "fontFamily": "JetBrains Mono", "fontStyle": "normal", "fontWeight": "400", "src": ["file:./assets/fonts/jetbrains-mono/jetbrains-mono-regular.woff2"] }
                    ]
                }
            ]
        },
        "blocks": {
            "woocommerce/product-price": {
                "color": { "text": true },
                "typography": { "fontSize": true, "fontWeight": true }
            },
            "woocommerce/product-button": {
                "color": { "text": true, "background": true },
                "border": { "radius": true }
            }
        }
    }
}
```

## Sample Output: styles/hypebeast.json (Style Variation)

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "Hypebeast Streetwear",
    "settings": {
        "color": {
            "palette": [
                { "slug": "primary", "color": "#FF3B00", "name": "Hype Red" },
                { "slug": "accent", "color": "#FFE500", "name": "Caution Yellow" },
                { "slug": "background", "color": "#000000", "name": "Background" },
                { "slug": "text", "color": "#FFFFFF", "name": "Text" }
            ]
        },
        "typography": {
            "fontFamilies": [
                {
                    "slug": "heading",
                    "name": "Heading",
                    "fontFamily": "\"Anton\", \"Impact\", sans-serif"
                }
            ]
        }
    },
    "styles": {
        "color": {
            "background": "var(--wp--preset--color--background)",
            "text": "var(--wp--preset--color--text)"
        },
        "elements": {
            "h1": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "textTransform": "uppercase",
                    "letterSpacing": "-0.03em"
                }
            }
        },
        "blocks": {
            "core/button": {
                "border": { "radius": "0" },
                "typography": { "textTransform": "uppercase", "fontWeight": "700" }
            }
        }
    }
}
```

## Lessons from Northaven

1. **Multi-aesthetic themes work best as style variations**, not separate themes
2. **WooCommerce conversion needs WC-specific patterns** for premium feel — default WC blocks look generic
3. **Alpine.js + WordPress works** but enqueue properly, don't inline
4. **shared-products.js can be ported** but hook into Query Loop via custom JS bridge that listens to block render events
5. **Critical CSS for product detail page** dramatically improves LCP (target: < 1.5s on mobile)
