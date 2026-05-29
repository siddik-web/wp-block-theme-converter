# Asset Optimization Reference

Actionable guidance for fonts, images, CSS, and JavaScript performance in WordPress block themes. Read this during Phase 8 (Accessibility & Performance) of the conversion methodology, or whenever the user asks about Core Web Vitals, page speed, or asset loading.

---

## Table of Contents

1. [Core Web Vitals Targets](#core-web-vitals-targets)
2. [Font Optimization](#font-optimization)
3. [Image Optimization](#image-optimization)
4. [CSS Optimization](#css-optimization)
5. [JavaScript Optimization](#javascript-optimization)
6. [Resource Hints](#resource-hints)
7. [Caching and Versioning](#caching-and-versioning)
8. [Measurement and Verification](#measurement-and-verification)
9. [Optimization Checklist](#optimization-checklist)

---

## Core Web Vitals Targets

| Metric | Target (Good) | Measured by |
|--------|--------------|------------|
| LCP (Largest Contentful Paint) | < 2.5 s | Hero image / heading load time |
| INP (Interaction to Next Paint) | < 200 ms | Response time to clicks/taps (replaced FID in 2024) |
| CLS (Cumulative Layout Shift) | < 0.1 | Layout stability — images without dimensions, FOUT |
| TTFB (Time to First Byte) | < 800 ms | Server response time |
| FCP (First Contentful Paint) | < 1.8 s | First meaningful paint |

These targets apply to the 75th percentile of page loads.

---

## Font Optimization

### 1. Self-Host Fonts (GDPR + Performance)

Never load fonts from Google Fonts or Adobe Fonts directly — self-host instead:

```bash
# Download and subset using google-webfonts-helper (CLI or web tool)
# https://gwfh.mranftl.com/

# Or use glyphhanger to generate subsets
npx glyphhanger https://yourdomain.com --subset=latin --formats=woff2 --spider
```

Place font files in `assets/fonts/`:

```
assets/fonts/
  plus-jakarta-sans-400.woff2
  plus-jakarta-sans-600.woff2
  plus-jakarta-sans-700.woff2
  inter-400.woff2
  inter-500.woff2
```

### 2. font-face Declarations

Define in `assets/css/style.css` (not in `theme.json` — theme.json `src` paths are for editor registration):

```css
@font-face {
    font-family: 'Plus Jakarta Sans';
    src: url('../fonts/plus-jakarta-sans-400.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Plus Jakarta Sans';
    src: url('../fonts/plus-jakarta-sans-700.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}
```

**Always use `font-display: swap`** — prevents invisible text (FOIT) during font load.

### 3. Preload Critical Fonts

Preload only the font files used in above-the-fold content (usually the body/heading font at the most common weight):

```php
// In inc/enqueue.php
function {{theme_slug_underscored}}_preload_fonts(): void {
    $fonts = array(
        array(
            'href' => get_template_directory_uri() . '/assets/fonts/plus-jakarta-sans-400.woff2',
            'type' => 'font/woff2',
        ),
        array(
            'href' => get_template_directory_uri() . '/assets/fonts/inter-400.woff2',
            'type' => 'font/woff2',
        ),
    );

    foreach ( $fonts as $font ) {
        printf(
            '<link rel="preload" href="%s" as="font" type="%s" crossorigin="anonymous">%s',
            esc_url( $font['href'] ),
            esc_attr( $font['type'] ),
            PHP_EOL
        );
    }
}
add_action( 'wp_head', '{{theme_slug_underscored}}_preload_fonts', 1 );
```

**Preload at most 2–3 fonts.** Preloading too many fonts delays the critical rendering path.

### 4. Subsetting

Subsetting reduces woff2 file sizes by 50–80% by removing unused character ranges.

Using `pyftsubset` (Python, via fonttools):

```bash
pip install fonttools brotli

# Latin subset only
pyftsubset plus-jakarta-sans-400.ttf \
  --output-file=plus-jakarta-sans-400.woff2 \
  --flavor=woff2 \
  --layout-features=kern,liga,calt \
  --unicodes="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
```

For multilingual sites, add the appropriate Unicode ranges for each supported language.

### 5. Variable Fonts

Prefer variable fonts when the design requires 3+ weights — one file replaces multiple:

```css
@font-face {
    font-family: 'Inter Variable';
    src: url('../fonts/inter-variable.woff2') format('woff2-variations');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
}
```

In `theme.json`, register with weight range:

```json
{
    "fontFace": [
        {
            "fontFamily": "Inter Variable",
            "src": ["file:./assets/fonts/inter-variable.woff2"],
            "fontWeight": "100 900",
            "fontStyle": "normal"
        }
    ]
}
```

---

## Image Optimization

### 1. WordPress Image Handling

WordPress generates multiple image sizes on upload. Declare theme-specific sizes in `inc/setup.php`:

```php
function {{theme_slug_underscored}}_image_sizes(): void {
    // Remove unused default sizes to save disk space
    remove_image_size( 'medium_large' );

    // Add theme-specific sizes
    add_image_size( 'hero',    1600, 900,  true );
    add_image_size( 'card',    800,  600,  true );
    add_image_size( 'avatar',  160,  160,  true );
    add_image_size( 'og-image', 1200, 630, true );
}
add_action( 'after_setup_theme', '{{theme_slug_underscored}}_image_sizes' );
```

Add sizes to the block editor dropdown:

```php
function {{theme_slug_underscored}}_image_size_names( array $sizes ): array {
    return array_merge( $sizes, array(
        'hero'    => __( 'Hero (1600×900)', '{{text-domain}}' ),
        'card'    => __( 'Card (800×600)', '{{text-domain}}' ),
        'og-image' => __( 'OG Image (1200×630)', '{{text-domain}}' ),
    ) );
}
add_filter( 'image_size_names_choose', '{{theme_slug_underscored}}_image_size_names' );
```

### 2. WebP with Fallback

WordPress 5.8+ generates WebP automatically if the server supports it (GD or Imagick with WebP enabled). Verify:

```php
// In theme setup — log WebP support for debugging
if ( WP_DEBUG ) {
    $editor = wp_get_image_editor( '' );
    error_log( 'WebP support: ' . ( $editor instanceof WP_Image_Editor && $editor->supports_mime_type( 'image/webp' ) ? 'yes' : 'no' ) );
}
```

For custom template images (not uploaded through media library), use `<picture>`:

```php
<picture>
    <source
        srcset="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/hero.webp"
        type="image/webp"
    >
    <img
        src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img/hero.jpg"
        alt="<?php esc_attr_e( 'Hero image description', '{{text-domain}}' ); ?>"
        width="1600"
        height="900"
        loading="eager"
        fetchpriority="high"
        decoding="async"
    >
</picture>
```

### 3. loading="lazy" vs loading="eager"

| Image location | `loading` | `fetchpriority` | `decoding` |
|---------------|-----------|----------------|-----------|
| Hero / LCP image | `eager` | `high` | `async` |
| Above-the-fold (first viewport) | `eager` | — | `async` |
| Below the fold | `lazy` | — | `async` |
| Tiny thumbnails | `lazy` | `low` | `async` |

The `core/image` block sets `loading="lazy"` by default. Override for the hero image using the block's `fetchpriority` attribute or via `wp_get_attachment_image_attributes` filter:

```php
function {{theme_slug_underscored}}_hero_image_attrs( array $attr, WP_Post $attachment, $size ): array {
    // Only applies this to a specific image used as the site hero.
    if ( has_image_size( 'hero' ) && $size === 'hero' ) {
        $attr['loading']       = 'eager';
        $attr['fetchpriority'] = 'high';
        $attr['decoding']      = 'async';
    }
    return $attr;
}
add_filter( 'wp_get_attachment_image_attributes', '{{theme_slug_underscored}}_hero_image_attrs', 10, 3 );
```

### 4. Always Include width and height

Prevents CLS. WordPress adds these automatically via `wp_get_attachment_image()`. For custom template images, always hardcode both:

```html
<img src="..." alt="..." width="1600" height="900">
```

### 5. SVG Handling

For theme SVGs (icons, logos), inline them to avoid additional HTTP requests:

```php
function {{theme_slug_underscored}}_get_svg( string $name ): string {
    $path = get_template_directory() . '/assets/img/icons/' . sanitize_file_name( $name ) . '.svg';
    if ( ! file_exists( $path ) ) {
        return '';
    }
    // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
    return file_get_contents( $path );
}
```

Always sanitize SVG output with `wp_kses()` using an SVG-safe allowlist before echoing.

---

## CSS Optimization

### 1. Per-Block CSS Loading

The single most impactful CSS optimization in block themes. Load CSS only when the block is used on the current page:

```php
// In inc/enqueue.php — called once per block type

// Option A: One stylesheet per block
wp_enqueue_block_style( 'core/button', array(
    'handle' => '{{theme-slug}}-button',
    'src'    => get_theme_file_uri( 'assets/css/blocks/button.css' ),
    'path'   => get_theme_file_path( 'assets/css/blocks/button.css' ),
    'ver'    => filemtime( get_theme_file_path( 'assets/css/blocks/button.css' ) ),
) );

// Option B: Loop registration for all blocks
function {{theme_slug_underscored}}_enqueue_block_styles(): void {
    $blocks = array(
        'core/button',
        'core/group',
        'core/image',
        'core/navigation',
        'core/query',
        'core/post-title',
        'core/columns',
    );

    foreach ( $blocks as $block ) {
        $slug = str_replace( 'core/', '', $block );
        $path = get_theme_file_path( "assets/css/blocks/{$slug}.css" );

        if ( ! file_exists( $path ) ) {
            continue;
        }

        wp_enqueue_block_style( $block, array(
            'handle' => "{{theme-slug}}-{$slug}",
            'src'    => get_theme_file_uri( "assets/css/blocks/{$slug}.css" ),
            'path'   => $path,
            'ver'    => filemtime( $path ),
        ) );
    }
}
add_action( 'init', '{{theme_slug_underscored}}_enqueue_block_styles' );
```

**The `path` key is required** — WordPress uses it to inline the CSS for blocks that appear above the fold (Critical CSS), further reducing render-blocking.

### 2. Critical CSS Strategy

WordPress 6.5+ inlines CSS for blocks in the LCP viewport when `path` is provided to `wp_enqueue_block_style()`. No manual critical CSS extraction is needed if per-block CSS is structured correctly.

For the global stylesheet (`assets/css/style.css`), keep it small (< 10 KB). It loads on every page. Move block-specific styles to per-block files.

### 3. CSS Custom Properties

Theme.json automatically generates CSS custom properties at `:root`. Reference them everywhere:

```css
/* ✅ Correct */
.site-header {
    background-color: var(--wp--preset--color--surface);
    padding-block: var(--wp--preset--spacing--50);
}

/* ❌ Wrong — hardcoded, breaks theming, not RTL-safe */
.site-header {
    background-color: #ffffff;
    padding-top: 2rem;
    padding-bottom: 2rem;
}
```

### 4. Reduce Specificity

Never use IDs (`#hero`). Avoid deep nesting. Keep specificity low so theme.json overrides work correctly:

```css
/* ✅ Low specificity — theme.json can override */
.wp-block-group.is-style-card { }

/* ❌ High specificity — blocks theme.json overrides */
div.wp-block-group.is-style-card > div { }
```

### 5. Logical Properties

All padding/margin/border must use logical properties for RTL compatibility:

```css
/* ✅ Logical */
.card {
    margin-inline: auto;
    padding-inline: var(--wp--preset--spacing--40);
    padding-block: var(--wp--preset--spacing--50);
    border-inline-start: 4px solid var(--wp--preset--color--primary);
    text-align: start;
}

/* ❌ Physical */
.card {
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    border-left: 4px solid #0052cc;
    text-align: left;
}
```

---

## JavaScript Optimization

### 1. Use Script Modules (ESM)

Use `wp_register_script_module()` instead of `wp_enqueue_script()` for Interactivity API scripts and any ES module code. Modules are deferred automatically:

```php
wp_register_script_module(
    '{{theme-slug}}-interactions',
    get_template_directory_uri() . '/assets/js/interactions.js',
    array( '@wordpress/interactivity' ),
    filemtime( get_template_directory() . '/assets/js/interactions.js' )
);
```

### 2. Defer Non-Critical Scripts

For classic scripts (non-module), use `defer` or `async`:

```php
wp_enqueue_script(
    '{{theme-slug}}-swiper',
    get_template_directory_uri() . '/assets/js/vendor/swiper.min.js',
    array(),
    '11.0.0',
    array( 'strategy' => 'defer', 'in_footer' => true )
);
```

`strategy` options (WP 6.3+):

- `'defer'` — load after HTML parsed, execute before DOMContentLoaded
- `'async'` — load in parallel, execute as soon as downloaded (no order guarantee)

Use `defer` for most scripts. Use `async` only for fully independent scripts (analytics, chat widgets).

### 3. Code Splitting via Vite

The Vite config template (`templates/vite.config.js.tpl`) splits by entry point. Each block's `view.js` is a separate chunk:

```js
// vite.config.js — input entries per block
input: {
    'main':              'assets/js/main.js',
    'interactions':      'assets/js/interactions.js',
    'hero-view':         'blocks/hero/view.js',
    'testimonials-view': 'blocks/testimonials/view.js',
},
```

This ensures users on pages without the `hero` block don't download its JS.

### 4. Tree Shake Unused Imports

Vite tree-shakes by default. Ensure imports are named (not namespace imports):

```js
// ✅ Tree-shakeable
import { store, getContext } from '@wordpress/interactivity';

// ❌ Prevents tree-shaking
import * as interactivity from '@wordpress/interactivity';
```

### 5. Remove Alpine.js

If the source project uses Alpine.js, replace with Interactivity API for:

- Modals / dialogs
- Tabs
- Accordions (prefer `core/details` block)
- Dropdown menus
- Toggle visibility

Only keep Alpine.js (or replace with vanilla JS) for:

- Complex gesture-based interactions
- Third-party library integrations that require specific initialization
- GSAP timeline orchestration

---

## Resource Hints

Add to `inc/enqueue.php`:

```php
function {{theme_slug_underscored}}_resource_hints( array $hints, string $relation_type ): array {
    switch ( $relation_type ) {
        case 'preconnect':
            // Add origins your theme connects to (CDN, analytics).
            // Do NOT add Google Fonts if self-hosting fonts.
            break;

        case 'dns-prefetch':
            // For third-party origins that don't support preconnect.
            break;
    }
    return $hints;
}
add_filter( 'wp_resource_hints', '{{theme_slug_underscored}}_resource_hints', 10, 2 );
```

### Preload Decision Matrix

| Resource | Use `rel="preload"`? | Notes |
|----------|---------------------|-------|
| Body font (400 weight) | ✅ Yes | Prevents FOUT |
| Heading font (700 weight) | ✅ Yes | Prevents FOUT |
| 3rd+ font file | ❌ No | Competes with LCP image |
| Hero image | ✅ Yes (if not in `<img>` with `fetchpriority="high"`) | Use `fetchpriority` on the `<img>` instead |
| Critical CSS | ❌ No | WordPress inlines per-block CSS automatically |
| Main JS bundle | ❌ No | Defer it instead |
| Vendor CSS | ❌ No | Load conditionally with `wp_enqueue_block_style()` |

---

## Caching and Versioning

### Asset Versioning

Always use `filemtime()` for local assets to bust the browser cache on deploy:

```php
wp_enqueue_style(
    '{{theme-slug}}-style',
    get_template_directory_uri() . '/assets/css/style.css',
    array(),
    filemtime( get_template_directory() . '/assets/css/style.css' )
);
```

For assets built by Vite (which appends content hashes to filenames), use the manifest:

```php
function {{theme_slug_underscored}}_vite_asset( string $entry ): string {
    static $manifest = null;

    if ( null === $manifest ) {
        $manifest_path = get_template_directory() . '/assets/dist/.vite/manifest.json';
        if ( file_exists( $manifest_path ) ) {
            // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
            $manifest = json_decode( file_get_contents( $manifest_path ), true ) ?? array();
        } else {
            $manifest = array();
        }
    }

    return isset( $manifest[ $entry ]['file'] )
        ? get_template_directory_uri() . '/assets/dist/' . $manifest[ $entry ]['file']
        : '';
}
```

### Cache-Control Headers

Set via `.htaccess` (Apache) or `nginx.conf`. Not controlled by the theme, but provide the snippet for the user:

```apache
# .htaccess — aggressive caching for theme assets
<FilesMatch "\.(woff2|woff|ttf)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
<FilesMatch "\.(jpg|jpeg|png|webp|gif|svg|ico)$">
    Header set Cache-Control "public, max-age=2592000"
</FilesMatch>
```

Vite's content-hashed filenames make `max-age=31536000, immutable` safe — the filename changes on every build.

---

## Measurement and Verification

### Tools

| Tool | How to run | What it measures |
|------|-----------|-----------------|
| Lighthouse CLI | `npx lighthouse https://url --view` | LCP, INP, CLS, FCP, TTFB, accessibility |
| WebPageTest | webpagetest.org | Real browser, filmstrip, waterfall |
| Chrome DevTools Coverage | DevTools → Coverage tab | Unused CSS/JS bytes |
| PageSpeed Insights | pagespeed.web.dev | Field data + lab data |
| axe DevTools | DevTools → axe tab | Accessibility violations |

### Lighthouse Targets

```bash
# Run Lighthouse and fail if performance score < 90
npx lighthouse https://staging.example.com \
  --output=json \
  --output-path=./lighthouse-report.json \
  --chrome-flags="--headless" \
  --only-categories=performance,accessibility,best-practices,seo

# Parse score
node -e "
const r = require('./lighthouse-report.json');
const scores = r.categories;
Object.keys(scores).forEach(k => console.log(k, Math.round(scores[k].score * 100)));
"
```

Target scores:

- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

### DevTools Coverage Analysis

1. Open Chrome DevTools → More tools → Coverage
2. Click record, load the page, stop recording
3. Sort by "Unused Bytes" descending
4. Files with > 50% unused bytes are candidates for:
   - Per-block CSS splitting
   - Code splitting (Vite entry points)
   - Removing unused library features

---

## Optimization Checklist

### Fonts

- [ ] All fonts self-hosted (no Google Fonts / Adobe Fonts DNS requests)
- [ ] `font-display: swap` on all `@font-face` declarations
- [ ] Fonts subsetted to Latin (+ additional ranges if multilingual)
- [ ] Variable font used if 3+ weights of the same family are needed
- [ ] Body font preloaded (400 weight)
- [ ] Heading font preloaded (700 weight) if different from body font
- [ ] No more than 2 preloaded font files

### Images

- [ ] Theme-specific image sizes declared and named
- [ ] Hero / LCP image has `loading="eager"` and `fetchpriority="high"`
- [ ] All below-the-fold images have `loading="lazy"`
- [ ] All images have explicit `width` and `height` attributes (prevents CLS)
- [ ] WebP images used or WordPress WebP generation verified
- [ ] `<picture>` element used for custom template images (not Media Library)
- [ ] SVGs inlined for icons (no extra HTTP requests)
- [ ] Alt text present on all images

### CSS

- [ ] Per-block CSS files in `assets/css/blocks/` with `path` key in `wp_enqueue_block_style()`
- [ ] Global `assets/css/style.css` is < 10 KB
- [ ] No hardcoded colors / sizes / spacing — all CSS custom properties
- [ ] All directional properties use logical CSS (`inline`, `block`, `inline-start`)
- [ ] No ID selectors
- [ ] No `!important` (except WordPress core override)
- [ ] Editor.css mirrors all visual frontend CSS rules

### JavaScript

- [ ] Interactivity API used for all simple interactions (modals, tabs, toggles, accordions)
- [ ] Scripts registered as modules via `wp_register_script_module()` where possible
- [ ] Non-module scripts use `'strategy' => 'defer'`
- [ ] `async` used only for fully independent scripts
- [ ] No Alpine.js (replaced by Interactivity API)
- [ ] Vite entry points split per-block for dynamic imports
- [ ] No `console.log()` statements in production builds

### Resource Hints

- [ ] `preload` on ≤ 2 font files
- [ ] `preconnect` to any third-party CDN
- [ ] No unnecessary resource hints (they consume bandwidth)

### Measurement

- [ ] Lighthouse performance score ≥ 90
- [ ] LCP < 2.5 s (verified in Lighthouse or WebPageTest)
- [ ] CLS < 0.1 (all images have width/height)
- [ ] INP < 200 ms
- [ ] No unused CSS > 50% in any stylesheet (DevTools Coverage check)
