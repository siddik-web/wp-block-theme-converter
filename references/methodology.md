# 10-Phase Conversion Methodology

Execute these phases IN ORDER. Each phase produces specific deliverables.

## Phase 1: Audit & Extract

**Goal:** Understand the source project before writing any WordPress code.

**Steps:**
1. Parse every HTML file. Build an inventory:
   - File name → page purpose (homepage, about, blog list, single post, etc.)
   - Sections per page (hero, features, testimonials, footer, etc.)
   - Repeating sections across files (header, footer, CTA blocks)
2. Parse all CSS files. Extract:
   - All CSS custom properties (`:root { --... }`)
   - Color palette (find all unique hex/rgb values)
   - Font families
   - Font sizes (find all `font-size` values)
   - Spacing values (margin/padding values that appear repeatedly)
   - Border radii used
   - Box shadows used
3. Parse JS files. Identify:
   - Frameworks/libraries (Alpine.js, GSAP, Swiper, vanilla, etc.)
   - Interactive components (modals, carousels, accordions, forms)
   - Animation triggers (scroll, hover, click)

**Output:** Audit summary in conversion plan.

---

## Phase 2: theme.json (CRITICAL)

**Goal:** Build the single source of truth for design tokens.

This is the most important file in a block theme. Get it right.

**Required structure (schema v3):**

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": { ... },
  "styles": { ... },
  "templateParts": [ ... ],
  "customTemplates": [ ... ]
}
```

**Settings checklist:**
- [ ] `appearanceTools: true` — enables border, spacing, shadow, etc. in editor
- [ ] `useRootPaddingAwareAlignments: true` — fixes full-width alignment
- [ ] `layout.contentSize` and `layout.wideSize` defined
- [ ] `color.palette` with semantic slugs (primary, accent, etc.)
- [ ] `color.defaultPalette: false` to remove WP defaults
- [ ] `typography.fluid: true` for responsive text
- [ ] `typography.fontFamilies` with `fontFace` for self-hosted fonts
- [ ] `typography.fontSizes` with fluid min/max
- [ ] `spacing.spacingSizes` (custom scale)
- [ ] `border.radius` presets if source uses consistent radii
- [ ] `shadow.presets` if source uses shadows
- [ ] `blocks` overrides for specific block defaults

**Styles checklist:**
- [ ] Root color (background + text)
- [ ] Root typography (fontFamily + fontSize + lineHeight)
- [ ] Root spacing (padding, blockGap)
- [ ] All `elements.h1` through `elements.h6`
- [ ] `elements.link` with `:hover`, `:focus`
- [ ] `elements.button` with `:hover`, `:focus`, `:active`
- [ ] Per-block overrides in `styles.blocks`

**Template parts:**
```json
"templateParts": [
  { "name": "header", "title": "Header", "area": "header" },
  { "name": "footer", "title": "Footer", "area": "footer" }
]
```

See `theme-json-schema.md` for complete structure.

---

## Phase 3: Templates & Parts

**Goal:** Convert HTML pages into FSE block templates.

**Mapping:**

| Source HTML | Target Template |
|-------------|-----------------|
| `index.html` (homepage) | `templates/front-page.html` |
| `index.html` (generic) | `templates/index.html` |
| `blog.html` / `news.html` | `templates/home.html` |
| `post.html` / `single.html` | `templates/single.html` |
| `about.html`, `services.html`, etc. | `templates/page.html` (generic) OR `templates/page-{slug}.html` (custom, registered in theme.json) |
| `category.html` / `tag.html` | `templates/archive.html` |
| `search.html` | `templates/search.html` |
| `404.html` | `templates/404.html` |

**Conversion process per template:**

1. Identify the `<header>` → reference `parts/header.html` via template-part block
2. Identify the `<footer>` → reference `parts/footer.html`
3. Wrap main content in `<main>` group block:
   ```html
   <!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
   <main class="wp-block-group">
       <!-- content -->
   </main>
   <!-- /wp:group -->
   ```
4. For `single.html` and `page.html`, use `<!-- wp:post-content /-->` for editable content
5. For `home.html` and `archive.html`, use `<!-- wp:query -->` (Query Loop block)
6. For repeating sections, reference patterns: `<!-- wp:pattern {"slug":"theme/hero"} /-->`
7. Convert all remaining HTML to block markup (see `block-conversion-map.md`)

**Skip-link requirement:** Add to `parts/header.html`:
```html
<!-- wp:html -->
<a class="skip-link screen-reader-text" href="#wp--skip-link--target">Skip to main content</a>
<!-- /wp:html -->
```

And add the target in templates before `<main>`:
```html
<!-- wp:html -->
<div id="wp--skip-link--target"></div>
<!-- /wp:html -->
```

---

## Phase 4: Block Patterns

**Goal:** Make repeating sections reusable and editable.

**Process:**

1. For each major section identified in Phase 1, create a pattern file
2. File path: `patterns/{pattern-slug}.php`
3. File header (REQUIRED):

```php
<?php
/**
 * Title: {{Pattern Name}}
 * Slug: {{theme-slug}}/{{pattern-slug}}
 * Categories: {{theme-slug}}-{{category}}, featured
 * Keywords: {{kw1}}, {{kw2}}, {{kw3}}
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: {{One-line description}}
 */
?>
```

4. Pattern body uses block markup with PHP for i18n strings and asset paths:
```php
<!-- wp:heading {"level":1,"fontSize":"huge"} -->
<h1 class="wp-block-heading has-huge-font-size"><?php esc_html_e( 'Welcome', 'theme-slug' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:image {"sizeSlug":"large"} -->
<figure class="wp-block-image size-large">
    <img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/hero.jpg" alt="<?php esc_attr_e( 'Hero image', 'theme-slug' ); ?>"/>
</figure>
<!-- /wp:image -->
```

5. Register custom pattern categories in `inc/block-patterns.php`:
```php
<?php
function {{theme_slug_underscored}}_register_pattern_categories() {
    register_block_pattern_category(
        '{{theme-slug}}-hero',
        array( 'label' => __( 'Hero Sections', '{{text-domain}}' ) )
    );
    register_block_pattern_category(
        '{{theme-slug}}-features',
        array( 'label' => __( 'Features', '{{text-domain}}' ) )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_pattern_categories' );
```

**Patterns are auto-discovered** from the `/patterns/` directory in WordPress 6.0+. No manual registration needed for individual patterns — only categories.

---

## Phase 5: Block Styles & Variations

**Goal:** Register reusable visual variations for core blocks.

**Block Styles** (CSS-only variants of existing blocks):

In `inc/block-styles.php`:
```php
<?php
function {{theme_slug_underscored}}_register_block_styles() {
    register_block_style(
        'core/button',
        array(
            'name'  => 'outline-editorial',
            'label' => __( 'Editorial Outline', '{{text-domain}}' ),
        )
    );
    register_block_style(
        'core/group',
        array(
            'name'  => 'card-elevated',
            'label' => __( 'Elevated Card', '{{text-domain}}' ),
        )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_block_styles' );
```

Matching CSS in `assets/css/style.css`:
```css
.wp-block-button.is-style-outline-editorial .wp-block-button__link {
    background: transparent;
    border: 2px solid var(--wp--preset--color--primary);
    color: var(--wp--preset--color--primary);
}
.wp-block-group.is-style-card-elevated {
    box-shadow: var(--wp--preset--shadow--deep);
    padding: var(--wp--preset--spacing--50);
    border-radius: var(--wp--preset--border-radius--base);
}
```

ALSO mirror in `assets/css/editor.css` so the editor matches the frontend.

**Block Variations** (JS-defined block presets):

In `assets/js/block-variations.js`:
```js
import { registerBlockVariation } from '@wordpress/blocks';

registerBlockVariation( 'core/group', {
    name: 'two-column-grid',
    title: __( 'Two-Column Grid', 'theme-slug' ),
    attributes: {
        layout: { type: 'grid', columnCount: 2 }
    },
    scope: [ 'inserter' ]
} );
```

Enqueue this in `inc/enqueue.php`:
```php
function {{theme_slug_underscored}}_enqueue_block_variations() {
    wp_enqueue_script(
        '{{theme-slug}}-block-variations',
        get_template_directory_uri() . '/assets/js/block-variations.js',
        array( 'wp-blocks', 'wp-i18n' ),
        filemtime( get_template_directory() . '/assets/js/block-variations.js' ),
        true
    );
}
add_action( 'enqueue_block_editor_assets', '{{theme_slug_underscored}}_enqueue_block_variations' );
```

---

## Phase 6: JavaScript Integration

**Goal:** Port source JS into a WordPress-friendly setup using the most appropriate API.

**Rules:**
- NEVER inline JS in block patterns or templates
- ALWAYS prefer WordPress-native APIs over third-party libraries
- Use Interactivity API (`@wordpress/interactivity`) as the PRIMARY strategy for interactive patterns
- Fall back to `wp_enqueue_script()` only for libraries that need gesture support or complex animation
- Pass dynamic values via `wp_localize_script()` for classic scripts

**CRITICAL: Read `references/modern-blocks.md` before implementing any JS integration.** It contains the decision matrix, Interactivity API patterns, and Alpine.js migration guide.

**Strategy by source JS type:**

| Source | Strategy |
|--------|----------|
| Alpine.js (x-data, x-show, x-on) | **Convert to Interactivity API** — see migration guide in `modern-blocks.md` |
| Vanilla JS: modals, tabs, dropdowns, toggles | **Convert to Interactivity API** |
| Vanilla JS: scroll handlers, intersection observers | Interactivity API OR `wp_enqueue_script()` with `defer` |
| Swiper / slider libraries | `wp_enqueue_script()` — needs gesture support |
| GSAP / animation libraries | `wp_enqueue_script()` — specialized animation |
| Form handlers | Recommend Contact Form 7 / Gravity Forms / Block Bindings instead |
| Ajax to backend | Use `wp_localize_script()` to pass ajax_url and nonce |
| jQuery-dependent code | `wp_enqueue_script()` with jQuery dependency — plan migration |

**Interactivity API implementation (in `inc/enqueue.php`):**
```php
function {{theme_slug_underscored}}_register_interactivity_scripts() {
    wp_register_script_module(
        '{{theme-slug}}-interactions',
        get_template_directory_uri() . '/assets/js/interactions.js',
        array( '@wordpress/interactivity' ),
        filemtime( get_template_directory() . '/assets/js/interactions.js' )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_interactivity_scripts' );
```

**Classic script enqueue (in `inc/enqueue.php`):**
```php
function {{theme_slug_underscored}}_enqueue_scripts() {
    // Frontend script (for non-Interactivity-API JS)
    wp_enqueue_script(
        '{{theme-slug}}-main',
        get_template_directory_uri() . '/assets/js/main.js',
        array(),
        filemtime( get_template_directory() . '/assets/js/main.js' ),
        array( 'strategy' => 'defer', 'in_footer' => true )
    );

    // Pass config to JS
    wp_localize_script(
        '{{theme-slug}}-main',
        '{{themeSlugCamel}}Config',
        array(
            'ajaxUrl' => admin_url( 'admin-ajax.php' ),
            'nonce'   => wp_create_nonce( '{{theme-slug}}-nonce' ),
            'i18n'    => array(
                'loading' => __( 'Loading...', '{{text-domain}}' ),
            ),
        )
    );
}
add_action( 'wp_enqueue_scripts', '{{theme_slug_underscored}}_enqueue_scripts' );
```

**Reduced motion:** Wrap any animations:
```js
const prefersReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
if ( ! prefersReducedMotion ) {
    // run animation
}
```

---

## Phase 7: functions.php & inc/

**Goal:** Bootstrap the theme. Keep `functions.php` thin.

**`functions.php`** (template at `templates/functions.php.tpl`):
```php
<?php
/**
 * {{Theme Name}} functions and definitions.
 *
 * @package {{ThemeNamePascal}}
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

// Theme constants.
define( '{{THEME_SLUG_UPPER}}_VERSION', wp_get_theme()->get( 'Version' ) );
define( '{{THEME_SLUG_UPPER}}_DIR', get_template_directory() );
define( '{{THEME_SLUG_UPPER}}_URI', get_template_directory_uri() );

// Bootstrap.
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/theme-setup.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/enqueue.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-patterns.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-styles.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-variations.php';

// Optional: Block Bindings API (uncomment if theme uses dynamic data bindings).
// require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-bindings.php';

// Optional WooCommerce support.
if ( class_exists( 'WooCommerce' ) ) {
    require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/woocommerce.php';
}
```

**`inc/theme-setup.php`** must call:
```php
add_theme_support( 'wp-block-styles' );
add_theme_support( 'editor-styles' );
add_theme_support( 'responsive-embeds' );
add_theme_support( 'align-wide' );
add_theme_support( 'post-thumbnails' );
add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' ) );
add_theme_support( 'title-tag' );
add_theme_support( 'custom-line-height' );
add_theme_support( 'appearance-tools' );
add_theme_support( 'block-templates' );
add_theme_support( 'block-template-parts' );
add_theme_support( 'automatic-feed-links' );
add_theme_support( 'custom-logo', array(
    'height'      => 120,
    'width'       => 400,
    'flex-height' => true,
    'flex-width'  => true,
) );
add_editor_style( 'assets/css/editor.css' );
load_theme_textdomain( '{{text-domain}}', get_template_directory() . '/languages' );
```

All in a function hooked to `after_setup_theme`.

---

## Phase 8: Accessibility & Performance

**Goal:** Meet WCAG 2.1 AA and Core Web Vitals targets.

**Accessibility checklist:**
- [ ] Skip-link in header part
- [ ] ARIA landmarks via `tagName` (header, main, footer, aside, nav)
- [ ] All `core/image` blocks have `alt` attribute
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text
- [ ] Focus styles visible on all interactive elements (`:focus-visible`)
- [ ] Form labels associated with inputs
- [ ] No autoplay video/audio
- [ ] `prefers-reduced-motion` respected for all animations
- [ ] Interactivity API patterns include proper ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-label`)

**Performance checklist:**
- [ ] LCP image marked with `loading="eager"` and `fetchpriority="high"`
- [ ] All other images `loading="lazy"` (core default in WP 5.5+)
- [ ] Fonts self-hosted via `assets/fonts/`, declared in theme.json `fontFace`
- [ ] Font preloading implemented for critical fonts (see below)
- [ ] Per-block CSS loading via `wp_enqueue_block_style()` (see below)
- [ ] Critical above-the-fold CSS inlined via `wp_add_inline_style()`
- [ ] All classic JS deferred (`defer` strategy); Interactivity API scripts use `wp_register_script_module()` (auto-deferred)
- [ ] No render-blocking resources
- [ ] CSS selectors lean (avoid deeply nested)
- [ ] CSS logical properties used where possible (future-proofs for RTL)

**Per-block CSS loading (REQUIRED for production themes):**

Split block-specific CSS into individual files. These load only when the block appears on a page:

```php
function {{theme_slug_underscored}}_enqueue_block_styles() {
    $block_styles = array(
        'core/quote'     => 'quote',
        'core/cover'     => 'cover',
        'core/table'     => 'table',
        'core/separator' => 'separator',
        'core/details'   => 'details',
        'core/code'      => 'code',
        'core/navigation' => 'navigation',
    );

    foreach ( $block_styles as $block_name => $filename ) {
        $file_path = get_template_directory() . "/assets/css/blocks/{$filename}.css";
        if ( file_exists( $file_path ) ) {
            wp_enqueue_block_style(
                $block_name,
                array(
                    'handle' => "{{theme-slug}}-{$filename}-style",
                    'src'    => get_template_directory_uri() . "/assets/css/blocks/{$filename}.css",
                    'ver'    => filemtime( $file_path ),
                    'path'   => $file_path,
                )
            );
        }
    }
}
add_action( 'init', '{{theme_slug_underscored}}_enqueue_block_styles' );
```

See `references/modern-blocks.md` → Per-Block CSS Loading for the full file structure and guidance on what goes where.

**Font preloading implementation:**

```php
function {{theme_slug_underscored}}_preload_fonts() {
    // Preload only the most critical font file (usually body regular weight)
    echo '<link rel="preload" href="' . esc_url( get_template_directory_uri() ) . '/assets/fonts/inter/inter-regular.woff2" as="font" type="font/woff2" crossorigin>' . "\n";
    // Optionally preload heading font if used above the fold
    echo '<link rel="preload" href="' . esc_url( get_template_directory_uri() ) . '/assets/fonts/heading-font/heading-regular.woff2" as="font" type="font/woff2" crossorigin>' . "\n";
}
add_action( 'wp_head', '{{theme_slug_underscored}}_preload_fonts', 1 );
```

**Alternative: Using wp_preload_resources filter (WordPress 6.1+):**

```php
function {{theme_slug_underscored}}_preload_resources( $preload_resources ) {
    $preload_resources[] = array(
        'href'        => get_template_directory_uri() . '/assets/fonts/inter/inter-regular.woff2',
        'as'          => 'font',
        'type'        => 'font/woff2',
        'crossorigin' => 'anonymous',
    );
    return $preload_resources;
}
add_filter( 'wp_preload_resources', '{{theme_slug_underscored}}_preload_resources' );
```

**Critical CSS inline example:**
```php
function {{theme_slug_underscored}}_inline_critical_css() {
    $critical_css = file_get_contents( get_template_directory() . '/assets/css/critical.css' );
    wp_add_inline_style( '{{theme-slug}}-style', $critical_css );
}
add_action( 'wp_enqueue_scripts', '{{theme_slug_underscored}}_inline_critical_css', 20 );
```

**Editor parity — systematic approach:**

To ensure the editor matches the frontend, follow this process:
1. Every CSS rule in `assets/css/style.css` that affects block appearance MUST be duplicated in `assets/css/editor.css`
2. Per-block CSS files in `assets/css/blocks/` are automatically loaded in both frontend and editor by `wp_enqueue_block_style()`
3. Custom block style CSS (`.is-style-*`) MUST appear in both files
4. After generating all CSS, do a line-by-line audit: for every selector in `style.css`, confirm it exists in `editor.css`
5. Exclude from `editor.css`: layout-only rules (site header/footer positioning), print styles, and animation keyframes

---

## Phase 9: i18n (Internationalization)

**Goal:** Make every user-facing string translatable.

**Rules:**
- Every user-facing string in PHP wrapped in `__()`, `_e()`, `esc_html__()`, `esc_attr__()`, `_n()`, `_x()`
- The text-domain argument MUST equal `{{text-domain}}` everywhere
- For escaped output, use `esc_html__()`, NOT `esc_html(__())`
- For URLs in attributes, use `esc_url()` after the translation function

**Functions to use:**

| Function | Purpose |
|----------|---------|
| `__( 'text', 'domain' )` | Returns translated string |
| `_e( 'text', 'domain' )` | Echoes translated string |
| `esc_html__( 'text', 'domain' )` | Returns escaped translated string |
| `esc_html_e( 'text', 'domain' )` | Echoes escaped translated string |
| `esc_attr__( 'text', 'domain' )` | For attribute values |
| `_n( 'singular', 'plural', $count, 'domain' )` | Pluralization |
| `_x( 'text', 'context', 'domain' )` | With translator context |

**Generate `.pot` file:** Empty placeholder at `languages/{{text-domain}}.pot`. Document that translators can use `wp i18n make-pot . languages/{{text-domain}}.pot` (WP-CLI) to regenerate from source.

---

## Phase 10: README & Documentation

**Goal:** Make the theme deployable and discoverable.

**`readme.txt`** (WordPress.org format):
```
=== Theme Name ===
Contributors: {{authorslug}}
Requires at least: 6.5
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Tags: {{tags}}

{{Theme description}}

== Description ==

{{Long description}}

== Installation ==

1. Upload the theme to /wp-content/themes/
2. Activate via Appearance → Themes
3. Customize via Appearance → Editor

== Changelog ==

= 1.0.0 =
* Initial release.

== Copyright ==

{{Theme name}}, Copyright {{year}} {{author}}
{{Theme name}} is distributed under the terms of the GNU GPL.

This theme bundles the following third-party resources:

{{Font name}}
License: {{license}}
Source: {{url}}

{{Image name}}
License: {{license}}
Source: {{url}}
```

**`screenshot.png`** — Always include a placeholder note in output:
> ⚠️ Add `screenshot.png` (1200×900 PNG, ≤ 1MB) before publishing. This file is required for the theme to display correctly in Appearance → Themes.

**`.gitignore`:**
```
node_modules/
vendor/
.DS_Store
*.log
.env
.env.local
dist/
.cache/
```
