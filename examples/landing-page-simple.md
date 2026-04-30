# Example: Simple SaaS Landing Page

A minimal worked example showing single-turn delivery for a simple project.

## Project Profile

- **Source:** Single-page SaaS landing site
- **Pages:** 5 HTML files
- **Total source:** ~2,500 lines (HTML + Tailwind CSS + vanilla JS)
- **Complexity:** LOW — single-turn delivery
- **WooCommerce:** NO

## Filled-In Inputs

```yaml
Theme Identity:
  name: "Acme SaaS"
  slug: "acme-saas"
  text_domain: "acme-saas"
  author: "Acme Inc."
  description: "A modern landing page theme for SaaS startups."
  version: "1.0.0"
  tags: "business, full-site-editing, block-styles, wide-blocks, block-patterns, custom-colors, custom-logo, custom-menu, editor-style, translation-ready"

Source Project:
  type: "SaaS landing page"
  html_files:
    - "index.html (homepage)"
    - "features.html"
    - "pricing.html"
    - "about.html"
    - "contact.html"
  css_architecture: "Tailwind CSS"
  js_framework: "Vanilla JS (smooth scroll + mobile menu)"
  design_language: "Clean, modern, blue accent"

Design Tokens (extracted from Tailwind config):
  colors:
    primary: "#0F172A"        # slate-900
    accent: "#3B82F6"         # blue-500
    background: "#FFFFFF"
    surface: "#F8FAFC"        # slate-50
    text: "#0F172A"
    muted: "#64748B"          # slate-500
  fonts:
    heading: '"Plus Jakarta Sans", system-ui, sans-serif'
    body: '"Inter", system-ui, sans-serif'

Build: Vite 6
WooCommerce: false
```

## Conversion Plan

```markdown
| Source | Target | Type | Notes |
|--------|--------|------|-------|
| Header section | parts/header.html | Template Part | Logo + nav + CTA |
| Footer section | parts/footer.html | Template Part | |
| index.html | templates/front-page.html | Template | Composed of patterns |
| features.html | templates/page-features.html | Custom Page Template | Registered in theme.json |
| pricing.html | templates/page-pricing.html | Custom Page Template | |
| about.html | templates/page-about.html | Custom Page Template | |
| contact.html | templates/page-contact.html | Custom Page Template | |
| Hero section | patterns/hero-saas.php | Pattern | |
| Features grid | patterns/features-grid.php | Pattern | |
| Pricing tiers | patterns/pricing-tiers.php | Pattern | |
| Testimonials | patterns/testimonials.php | Pattern | |
| CTA section | patterns/cta-default.php | Pattern | |
| FAQ | patterns/faq.php | Pattern | Uses core/details |
| Newsletter | patterns/newsletter-signup.php | Pattern | |
```

## Single-Turn Delivery

Total estimated output: ~3,500 lines. Well within single-turn limits. Deliver everything in one response:

1. style.css
2. theme.json
3. functions.php + 5 inc/ files
4. 9 templates (index, front-page, home, single, page, archive, search, 404, plus 4 page-*.html custom)
5. 2 template parts (header, footer)
6. 7 patterns
7. assets/css/style.css + editor.css
8. assets/js/main.js
9. package.json, vite.config.js, lint configs
10. readme.txt
11. Installation instructions + checklist

## Key Decisions for This Project

1. **Custom page templates** for each main page → registered in theme.json `customTemplates` array. Lets users assign these via Page Attributes → Template selector.

2. **No WooCommerce** → skip `inc/woocommerce.php` entirely.

3. **Vanilla JS only** → simple `assets/js/main.js` with `defer` strategy. No framework needed.

4. **Tailwind utility classes → block attributes**:
   - `text-primary` → `{"textColor":"primary"}`
   - `bg-accent` → `{"backgroundColor":"accent"}`
   - `text-2xl` → `{"fontSize":"x-large"}`

5. **Self-host fonts** from Google Fonts → download `Plus Jakarta Sans` and `Inter` woff2 files into `assets/fonts/` for GDPR compliance.

6. **FAQ uses native `core/details` block** (WP 6.3+) instead of Alpine.js or custom accordion.

## Sample Pattern: hero-saas.php

```php
<?php
/**
 * Title: SaaS Hero
 * Slug: acme-saas/hero-saas
 * Categories: acme-saas-hero, featured
 * Keywords: hero, saas, headline, cta
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: A bold SaaS hero with headline, subheading, and dual CTA.
 */
?>
<!-- wp:group {"tagName":"section","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"surface","layout":{"type":"constrained"}} -->
<section class="wp-block-group has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">

    <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"huge"} -->
    <h1 class="wp-block-heading has-text-align-center has-huge-font-size">
        <?php esc_html_e( 'Build better, ship faster.', 'acme-saas' ); ?>
    </h1>
    <!-- /wp:heading -->
    {{!-- h1 typography (font-weight, letter-spacing, line-height) comes from theme.json styles.elements.h1 — not inline overrides --}}

    <!-- wp:paragraph {"align":"center","fontSize":"large","textColor":"muted","style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
    <p class="has-text-align-center has-muted-color has-text-color has-large-font-size" style="margin-top:var(--wp--preset--spacing--40)">
        <?php esc_html_e( 'The all-in-one platform for modern teams to ship products customers love.', 'acme-saas' ); ?>
    </p>
    <!-- /wp:paragraph -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">

        <!-- wp:button {"backgroundColor":"primary","textColor":"background"} -->
        <div class="wp-block-button">
            <a class="wp-block-button__link has-background-color has-primary-background-color has-text-color wp-element-button" href="#signup">
                <?php esc_html_e( 'Start free trial', 'acme-saas' ); ?>
            </a>
        </div>
        <!-- /wp:button -->

        <!-- wp:button {"textColor":"primary","className":"is-style-outline"} -->
        <div class="wp-block-button is-style-outline">
            <a class="wp-block-button__link has-primary-color has-text-color wp-element-button" href="#demo">
                <?php esc_html_e( 'Book a demo', 'acme-saas' ); ?>
            </a>
        </div>
        <!-- /wp:button -->

    </div>
    <!-- /wp:buttons -->

</section>
<!-- /wp:group -->
```

## Lessons

1. **Simple projects = single-turn delivery** — don't over-engineer
2. **Tailwind classes map cleanly** to WordPress block attributes
3. **`core/details` is your friend** for accordions/FAQs (no JS needed)
4. **Custom page templates** > generic page.html when each page has distinct layout
5. **Keep functions.php thin** — all logic in `inc/` files
