# Backward Compatibility Reference

Guidance for block themes that must support WordPress versions older than 6.5 or that are targeting a range of WordPress versions. Read this when the user specifies a `Requires at least` version below 6.5, or when they ask about supporting older WordPress installs.

---

## Table of Contents

1. [Feature Availability Matrix](#feature-availability-matrix)
2. [Minimum WordPress Version Strategy](#minimum-wordpress-version-strategy)
3. [Conditional Feature Loading](#conditional-feature-loading)
4. [Interactivity API Fallbacks](#interactivity-api-fallbacks)
5. [Block Bindings API Fallbacks](#block-bindings-api-fallbacks)
6. [theme.json Version Negotiation](#themejson-version-negotiation)
7. [Section Styles Fallback (WP 6.6+)](#section-styles-fallback-wp-66)
8. [Pattern Overrides Fallback (WP 6.6+)](#pattern-overrides-fallback-wp-66)
9. [Per-Block CSS `path` Key Fallback](#per-block-css-path-key-fallback)
10. [PHP Version Compatibility](#php-version-compatibility)
11. [Version Compatibility Checklist](#version-compatibility-checklist)

---

## Feature Availability Matrix

| Feature | Introduced in | Notes |
|---------|--------------|-------|
| Block themes (FSE) | 5.9 | `index.html` template required |
| theme.json v2 | 6.0 | |
| Per-block CSS (`wp_enqueue_block_style`) | 6.1 | `path` key for inlining added in 6.2 |
| `wp_enqueue_block_style` `path` key | 6.2 | Enables Critical CSS inlining |
| Block Styles in theme.json | 6.1 | `styles.blocks.{block}` |
| theme.json v3 | 6.6 | Required for Section Styles |
| Fluid typography | 6.1 | `fluid: true` in `typography.fluid` |
| Template registration in theme.json | 6.0 | `customTemplates` |
| Template part registration in theme.json | 6.0 | `templateParts` |
| Grid layout | 6.3 | `layout.type = "grid"` |
| Block Bindings API | 6.5 | `register_block_bindings_source()` |
| `core/post-meta` binding source | 6.5 | |
| Interactivity API (stable) | 6.5 | `@wordpress/interactivity` |
| `wp_register_script_module()` | 6.5 | ESM support |
| Dark mode in theme.json | 6.5 | `styles.variations.dark` |
| Section Styles / Block Style Variations in theme.json | 6.6 | `styles.blocks.{block}.variations` |
| Pattern Overrides | 6.6 | `metadata.bindings` on pattern content |
| `wp_interactivity_state()` | 6.5 | |
| `get_block_wrapper_attributes()` | 5.8 | Dynamic blocks |
| `register_block_type()` with `block.json` path | 5.8 | |
| `apiVersion: 3` in block.json | 6.3 | Required for `useBlockProps` in iframes |
| `wp_enqueue_block_style()` for 3rd-party blocks | 6.1 | |
| `wp_interactivity_config()` | 6.5 | |
| Sticky positioning support | 6.5 | `position.sticky` in block supports |

---

## Minimum WordPress Version Strategy

### Recommended Minimums by Theme Type

| Theme type | Recommended `Requires at least` |
|-----------|--------------------------------|
| New theme for client (no WP.org submission) | **6.5** — enables all features |
| WP.org directory submission | **6.3** — broad compatibility, Grid layout, fluid typography |
| Legacy client support | **6.0** — FSE only, no Interactivity API |
| Maximum compatibility | **5.9** — basic FSE, limited features |

### What to Sacrifice at Each Version

**Targeting WP 6.3–6.4 (no Interactivity API, no Block Bindings):**
- Replace Interactivity API with `wp_enqueue_script()` + vanilla JS (or Alpine.js as a compromise)
- Replace Block Bindings with PHP template parts or dynamic custom blocks
- Remove `wp_register_script_module()` calls — use `wp_enqueue_script()` with `'in_footer' => true`
- Section Styles / `styles.blocks.*.variations` in theme.json are silently ignored — use CSS class-based block styles only
- Pattern Overrides unavailable — use plain editable patterns instead

**Targeting WP 6.0–6.2 (no per-block CSS `path` key):**
- All above restrictions apply
- Remove `'path'` key from `wp_enqueue_block_style()` calls — CSS will not be inlined (no Critical CSS)
- Grid layout not available — use Columns block instead

---

## Conditional Feature Loading

### Function Existence Check Pattern

```php
// In inc/enqueue.php

function {{theme_slug_underscored}}_enqueue_scripts(): void {
    // Script Modules (WP 6.5+ only)
    if ( function_exists( 'wp_register_script_module' ) ) {
        wp_register_script_module(
            '{{theme-slug}}-interactions',
            get_template_directory_uri() . '/assets/js/interactions.js',
            array( '@wordpress/interactivity' ),
            filemtime( get_template_directory() . '/assets/js/interactions.js' )
        );
    } else {
        // Fallback for WP < 6.5 — classic script
        wp_enqueue_script(
            '{{theme-slug}}-interactions-fallback',
            get_template_directory_uri() . '/assets/js/interactions-fallback.js',
            array(),
            filemtime( get_template_directory() . '/assets/js/interactions-fallback.js' ),
            array( 'in_footer' => true, 'strategy' => 'defer' )
        );
    }
}
add_action( 'wp_enqueue_scripts', '{{theme_slug_underscored}}_enqueue_scripts' );
```

### Version Comparison Pattern

```php
// Compare against specific WP version
if ( version_compare( get_bloginfo( 'version' ), '6.5', '>=' ) ) {
    // WP 6.5+ feature
}

// Check for specific function (preferred — more future-proof)
if ( function_exists( 'register_block_bindings_source' ) ) {
    // Block Bindings API available
}

// Check for specific class
if ( class_exists( 'WP_Script_Modules' ) ) {
    // Script Modules API available (WP 6.5+)
}
```

### Theme Setup Capability Check

In `inc/setup.php`, declare only features the current WP version supports:

```php
function {{theme_slug_underscored}}_setup(): void {
    // Universal features (WP 5.9+)
    add_theme_support( 'wp-block-styles' );
    add_theme_support( 'align-wide' );
    add_theme_support( 'automatic-feed-links' );
    add_theme_support( 'title-tag' );

    // WP 6.1+ features
    if ( function_exists( 'wp_enqueue_block_style' ) ) {
        // Per-block CSS — safe to call, registered in enqueue.php
    }

    // WP 6.5+ features
    if ( function_exists( 'wp_register_script_module' ) ) {
        // Script modules registered in enqueue.php
    }
    if ( function_exists( 'register_block_bindings_source' ) ) {
        require_once get_template_directory() . '/inc/block-bindings.php';
    }
}
add_action( 'after_setup_theme', '{{theme_slug_underscored}}_setup' );
```

---

## Interactivity API Fallbacks

When `Requires at least` is below 6.5, the Interactivity API is not available. Options:

### Option A: Vanilla JS Fallback

Write a small vanilla JS module that replicates the interaction without the Interactivity API:

```js
// assets/js/interactions-fallback.js
// Used when WordPress < 6.5 (no Interactivity API)

document.addEventListener( 'DOMContentLoaded', () => {
    // Mobile menu toggle
    const toggleBtn = document.querySelector( '[data-toggle="mobile-menu"]' );
    const nav = document.getElementById( 'mobile-nav' );

    if ( toggleBtn && nav ) {
        toggleBtn.addEventListener( 'click', () => {
            const isOpen = nav.classList.toggle( 'is-open' );
            toggleBtn.setAttribute( 'aria-expanded', String( isOpen ) );
            nav.setAttribute( 'aria-hidden', String( ! isOpen ) );
        } );
    }
} );
```

### Option B: Progressive Enhancement

Load the Interactivity API script module on WP 6.5+, and let older versions fall back to CSS-only state (no interactivity, but functional):

```php
if ( function_exists( 'wp_register_script_module' ) ) {
    // WP 6.5+ — full Interactivity API
    wp_register_script_module( '{{theme-slug}}-interactions', ... );
} else {
    // WP < 6.5 — no interactive behavior; pure CSS must handle states
    // e.g., checkbox hack for mobile menu, or :focus-within for dropdowns
}
```

CSS-only navigation dropdown (`:focus-within`):
```css
.nav-item:focus-within .submenu {
    display: block;
}
```

### Option C: Polyfill Notice

If the theme explicitly requires WP 6.5+ and a client is on an older version, show an admin notice:

```php
add_action( 'admin_notices', function(): void {
    if ( version_compare( get_bloginfo( 'version' ), '6.5', '<' ) ) {
        printf(
            '<div class="notice notice-warning"><p>%s</p></div>',
            sprintf(
                /* translators: %s: minimum WordPress version */
                esc_html__( '{{Theme Name}} requires WordPress %s or higher for full functionality. Please update WordPress.', '{{text-domain}}' ),
                '6.5'
            )
        );
    }
} );
```

---

## Block Bindings API Fallbacks

Block Bindings (`register_block_bindings_source`) requires WordPress 6.5+.

**Fallback approach for WP 6.0–6.4:** Use a dynamic custom block (`render.php`) instead:

```php
// render.php — works on all WordPress versions that support block.json
$headline = get_post_meta( get_the_ID(), 'hero_headline', true );
?>
<div <?php echo get_block_wrapper_attributes(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <h2><?php echo esc_html( $headline ); ?></h2>
</div>
```

**Conditional registration:**

```php
function {{theme_slug_underscored}}_register_bindings(): void {
    if ( ! function_exists( 'register_block_bindings_source' ) ) {
        return; // WP < 6.5 — bindings not available
    }

    register_block_bindings_source( '{{theme-slug}}/post-meta', array(
        'label'              => __( 'Post Meta', '{{text-domain}}' ),
        'get_value_callback' => '{{theme_slug_underscored}}_post_meta_binding',
        'uses_context'       => array( 'postId' ),
    ) );
}
add_action( 'init', '{{theme_slug_underscored}}_register_bindings' );
```

---

## theme.json Version Negotiation

WordPress reads theme.json and interprets it based on the schema version.

| `$schema` version | WordPress minimum | Key differences |
|------------------|------------------|----------------|
| v1 | 5.8 | Basic settings only |
| v2 | 6.0 | Full settings + styles |
| v3 | 6.6 | Section Styles, `appearanceTools` refinements |

**For maximum compatibility (WP 6.0+):** Use schema v2:

```json
{
    "$schema": "https://schemas.wp.org/wp/6.0/theme.json",
    "version": 2,
    ...
}
```

**For modern themes (WP 6.6+):** Use schema v3:

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    ...
}
```

**Unknown keys are silently ignored** — it is safe to include v3-specific keys in a v2 theme.json as long as you understand they won't be applied on older WordPress versions. Always test.

---

## Section Styles Fallback (WP 6.6+)

`styles.blocks.{block}.variations` (Section Styles) requires WordPress 6.6+. On WP < 6.6, these definitions are silently ignored.

**Workaround for WP < 6.6:** Register block styles via PHP instead of theme.json:

```php
function {{theme_slug_underscored}}_register_block_styles(): void {
    // These work on WP 6.1+ (when register_block_style() became stable)
    register_block_style(
        'core/group',
        array(
            'name'  => 'dark-section',
            'label' => __( 'Dark Section', '{{text-domain}}' ),
        )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_block_styles' );
```

Apply styles via CSS class:

```css
/* Works on WP 6.1+ without Section Styles */
.wp-block-group.is-style-dark-section {
    background-color: var(--wp--preset--color--foreground);
    color: var(--wp--preset--color--background);
}
```

**If `Requires at least` is 6.6+**, use Section Styles in theme.json exclusively — no need for PHP `register_block_style()`.

---

## Pattern Overrides Fallback (WP 6.6+)

Pattern Overrides (`metadata.bindings` on pattern content blocks) require WordPress 6.6+.

**For WP < 6.6:** Use standard editable blocks without the `metadata.bindings` key. The pattern is editable as normal — authors must edit the text directly in each instance.

```php
// Detect and conditionally include bindings metadata
if ( version_compare( get_bloginfo( 'version' ), '6.6', '>=' ) ) {
    $heading_attrs = '{"metadata":{"bindings":{"content":{"source":"core/pattern-overrides"}}}}';
} else {
    $heading_attrs = '{}'; // No overrides — fully editable
}
```

---

## Per-Block CSS `path` Key Fallback

The `'path'` key in `wp_enqueue_block_style()` enables Critical CSS inlining. It was added in WordPress 6.2.

```php
function {{theme_slug_underscored}}_enqueue_block_styles(): void {
    $blocks = array( 'core/button', 'core/group', 'core/image' );

    foreach ( $blocks as $block ) {
        $slug = str_replace( 'core/', '', $block );
        $file = get_theme_file_path( "assets/css/blocks/{$slug}.css" );

        if ( ! file_exists( $file ) ) {
            continue;
        }

        $args = array(
            'handle' => "{{theme-slug}}-{$slug}",
            'src'    => get_theme_file_uri( "assets/css/blocks/{$slug}.css" ),
            'ver'    => filemtime( $file ),
        );

        // Add 'path' only on WP 6.2+ to avoid notices
        if ( version_compare( get_bloginfo( 'version' ), '6.2', '>=' ) ) {
            $args['path'] = $file;
        }

        wp_enqueue_block_style( $block, $args );
    }
}
add_action( 'init', '{{theme_slug_underscored}}_enqueue_block_styles' );
```

---

## PHP Version Compatibility

WordPress 6.5+ requires PHP 7.0+ (officially). Best practice targets PHP 7.4+.

### PHP Compatibility Matrix

| PHP Feature | Available since |
|------------|----------------|
| Arrow functions (`fn() => ...`) | PHP 7.4 |
| Typed properties | PHP 7.4 |
| Named arguments | PHP 8.0 |
| Union types | PHP 8.0 |
| `match` expression | PHP 8.0 |
| Nullsafe operator (`?->`) | PHP 8.0 |
| Enums | PHP 8.1 |
| Readonly properties | PHP 8.1 |
| Fibers | PHP 8.1 |
| `str_contains()`, `str_starts_with()`, `str_ends_with()` | PHP 8.0 |

**For PHP 7.4 compatibility:** Avoid named arguments, `match`, `?->`, enums, and PHP 8.0+ functions. Use arrow functions — they are PHP 7.4+.

```php
// ✅ PHP 7.4+ compatible
$slugs = array_map( fn( $block ) => str_replace( 'core/', '', $block ), $blocks );

// ❌ PHP 8.0+ only
$value = match( $key ) {
    'a' => 1,
    'b' => 2,
    default => 0,
};
```

### PHPCS PHPCompatibility Check

Add to `.phpcs.xml.dist`:
```xml
<rule ref="PHPCompatibilityWP"/>
<config name="testVersion" value="7.4-"/>
```

This flags any PHP syntax that won't run on PHP 7.4.

---

## Version Compatibility Checklist

### Before Setting `Requires at least`

- [ ] Decided minimum WordPress version based on client's actual WordPress version
- [ ] Checked feature availability matrix — no features used that are unavailable on target version
- [ ] Set `Requires at least` in `style.css` header
- [ ] Set `Requires at least` in `readme.txt`
- [ ] Updated `$schema` URL in `theme.json` to match target version (`wp/6.0/theme.json`, `wp/6.5/theme.json`, or `trunk/theme.json`)

### Conditional Feature Loading

- [ ] `wp_register_script_module()` wrapped in `function_exists()` check (WP 6.5+)
- [ ] `register_block_bindings_source()` wrapped in `function_exists()` check (WP 6.5+)
- [ ] `wp_interactivity_state()` wrapped in `function_exists()` check (WP 6.5+)
- [ ] `'path'` key in `wp_enqueue_block_style()` wrapped in `version_compare()` check (WP 6.2+)
- [ ] Section Styles (`styles.blocks.*.variations`) only in theme.json if `Requires at least: 6.6`

### PHP Compatibility

- [ ] PHPCompatibilityWP PHPCS ruleset active with `testVersion = 7.4-`
- [ ] No PHP 8.0+ syntax (match, named args, nullsafe `?->`) unless `Requires PHP: 8.0`
- [ ] No PHP 8.1+ syntax (enums, readonly) unless `Requires PHP: 8.1`

### Testing on Older Versions

- [ ] Tested on minimum WordPress version with `WP_DEBUG = true` — no errors or notices
- [ ] Interactive features gracefully degrade (visible and functional without JS on older WP)
- [ ] theme.json properties not supported on older version are silently ignored (verified)
