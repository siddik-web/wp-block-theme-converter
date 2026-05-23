# Plugin Compatibility Reference

Patterns for detecting, integrating with, and styling third-party WordPress plugins inside a block theme. Read this when `/wp-plugin-theme` is invoked or when plugin-specific code is required during any conversion.

---

## Table of Contents

1. [Plugin Detection Patterns](#plugin-detection-patterns)
2. [Plugin Conflict Resolution](#plugin-conflict-resolution)
3. [Plugin-Specific Hooks and Filters](#plugin-specific-hooks-and-filters)
4. [CSS Specificity Battles](#css-specificity-battles)
5. [Block Theme + Classic Plugin Coexistence](#block-theme--classic-plugin-coexistence)
6. [Page Builder Coexistence](#page-builder-coexistence)
7. [Caching Plugin Compatibility](#caching-plugin-compatibility)
8. [Plugin Compatibility Checklist](#plugin-compatibility-checklist)

---

## Plugin Detection Patterns

Always check for a plugin's existence before calling its functions. Use the most specific and stable check available.

### Detection Method Reference

| Plugin | Reliable detection |
|--------|--------------------|
| **WooCommerce** | `class_exists( 'WooCommerce' )` |
| **Yoast SEO** | `defined( 'WPSEO_VERSION' )` |
| **Rank Math** | `defined( 'RANK_MATH_VERSION' )` |
| **SEOPress** | `defined( 'SEOPRESS_VERSION' )` |
| **WPForms** | `class_exists( 'WPForms' )` |
| **Gravity Forms** | `class_exists( 'GFForms' )` |
| **Contact Form 7** | `defined( 'WPCF7_VERSION' )` |
| **ACF (free)** | `function_exists( 'get_field' )` |
| **ACF PRO** | `class_exists( 'acf_pro' )` |
| **CMB2** | `class_exists( 'CMB2' )` |
| **Meta Box** | `class_exists( 'RWMB_Loader' )` |
| **Jetpack** | `class_exists( 'Jetpack' )` |
| **Polylang** | `function_exists( 'pll_the_languages' )` |
| **WPML** | `defined( 'ICL_SITEPRESS_VERSION' )` |
| **TranslatePress** | `defined( 'TRP_PLUGIN_VERSION' )` |
| **The Events Calendar** | `class_exists( 'Tribe__Events__Main' )` |
| **MemberPress** | `class_exists( 'MeprOptions' )` |
| **Restrict Content Pro** | `defined( 'RCP_PLUGIN_VERSION' )` |
| **WP Rocket** | `defined( 'WP_ROCKET_VERSION' )` |
| **LiteSpeed Cache** | `defined( 'LSCWP_V' )` |
| **Easy Digital Downloads** | `class_exists( 'Easy_Digital_Downloads' )` |
| **bbPress** | `function_exists( 'bbpress' )` |
| **BuddyPress** | `function_exists( 'buddypress' )` |
| **Elementor** | `defined( 'ELEMENTOR_VERSION' )` |
| **Divi** | `defined( 'ET_BUILDER_VERSION' )` |

### Detection in PHP

```php
// Correct: check existence before calling
if ( function_exists( 'yoast_breadcrumb' ) ) {
    yoast_breadcrumb( '<nav>', '</nav>' );
}

// Correct: feature-flag an entire block of code
if ( class_exists( 'WooCommerce' ) ) {
    // WooCommerce-specific setup
}

// Wrong: call without checking
yoast_breadcrumb( '<nav>', '</nav>' ); // Fatal if Yoast is deactivated
```

### Detection in CSS (Conditional Enqueue)

```php
// Per-plugin CSS loaded only when that plugin is active
add_action( 'wp_enqueue_scripts', function(): void {
    if ( class_exists( 'GFForms' ) ) {
        wp_enqueue_style(
            'my-theme-gravity-forms',
            get_theme_file_uri( 'assets/css/plugins/gravity-forms.css' ),
            array(),
            filemtime( get_theme_file_path( 'assets/css/plugins/gravity-forms.css' ) )
        );
    }
} );
```

### Detection in block patterns and templates

Do not call plugin functions directly inside `.html` template/pattern files. Use a PHP template part instead:

```html
<!-- This does NOT work in .html files -->
<!-- wp:html -->
<?php yoast_breadcrumb(); ?> ← Will not execute
<!-- /wp:html -->
```

PHP only executes in `.php` files. For plugin output inside FSE templates:

**Option A:** Use a `<!-- wp:html -->` block inside a `.php` pattern file (registered in `patterns/`):
```php
// patterns/breadcrumbs.php
/**
 * Title: Breadcrumbs
 * Slug: my-theme/breadcrumbs
 * Inserter: false
 */
?>
<!-- wp:group {"tagName":"nav"} -->
<nav class="wp-block-group">
    <?php if ( function_exists( 'yoast_breadcrumb' ) ) : ?>
        <?php yoast_breadcrumb( '<p>', '</p>' ); ?>
    <?php endif; ?>
</nav>
<!-- /wp:group -->
```

**Option B:** Use a dynamic block (`render.php`) that calls the plugin function.

---

## Plugin Conflict Resolution

### CSS Conflicts

Plugin stylesheets often have high specificity. Override patterns:

```css
/* Increase your specificity by one level with a parent class */
.wp-site-blocks .wpcf7-form input[type="text"] {
    /* Overrides CF7's own stylesheet */
}

/* Or use a theme-specific wrapper class on a Group block */
.my-theme-form-wrapper .gform_wrapper input {
    /* Overrides Gravity Forms */
}
```

Never use `!important` unless the plugin itself uses it and there is no other option.

### Plugin CSS Dequeue

If a plugin loads generic CSS you want to fully replace with your own:

```php
add_action( 'wp_enqueue_scripts', function(): void {
    // Remove Gravity Forms base CSS and use your own
    wp_dequeue_style( 'gforms_reset_css' );
    wp_dequeue_style( 'gforms_formsmain_css' );
    wp_dequeue_style( 'gforms_ready_class_css' );
    wp_dequeue_style( 'gforms_browsers_css' );
}, 100 ); // Priority 100 — after plugins enqueue
```

**Check the handle before dequeuing** — handles vary by plugin version. Use DevTools → Network to identify the actual handle from the stylesheet URL.

### JavaScript Conflicts

When a plugin's JS conflicts with the Interactivity API or theme scripts:

```php
// Defer a plugin's script that's blocking render
add_filter( 'script_loader_tag', function( string $tag, string $handle ): string {
    $defer_handles = array( 'cf7-conditional-fields', 'some-slider-plugin' );
    if ( in_array( $handle, $defer_handles, true ) ) {
        return str_replace( '<script ', '<script defer ', $tag );
    }
    return $tag;
}, 10, 2 );
```

### Admin Bar Conflicts

Some plugins add admin bar nodes that overlap fixed headers. Adjust with CSS:

```css
/* When admin bar is visible, offset fixed header */
.admin-bar .site-header[style*="position:sticky"],
.admin-bar .site-header.is-sticky {
    top: 32px; /* Admin bar height on desktop */
}

@media screen and (max-width: 782px) {
    .admin-bar .site-header.is-sticky {
        top: 46px; /* Admin bar height on mobile */
    }
}
```

---

## Plugin-Specific Hooks and Filters

### Yoast SEO

```php
// Change Yoast breadcrumb separator
add_filter( 'wpseo_breadcrumb_separator', fn() => '›' );

// Add structured data to templates
add_action( 'wp_head', function(): void {
    if ( function_exists( 'wpseo_json_ld_output' ) ) {
        wpseo_json_ld_output();
    }
} );

// Control which image Yoast uses for OG
add_filter( 'wpseo_opengraph_image', function( string $image ): string {
    // Return a default OG image if none is set
    if ( empty( $image ) && is_front_page() ) {
        return get_template_directory_uri() . '/assets/img/og-default.jpg';
    }
    return $image;
} );
```

### WPForms

```php
// Disable WPForms default CSS (replace with theme CSS)
add_filter( 'wpforms_frontend_css', '__return_false' );

// Or disable only the base styles
add_filter( 'wpforms_setting', function( $value, string $key ) {
    if ( 'disable-css' === $key ) {
        return '2'; // '1' = full CSS, '2' = base only, '3' = none
    }
    return $value;
}, 10, 2 );
```

### Gravity Forms

```php
// Disable Gravity Forms default CSS
add_filter( 'pre_option_rg_gforms_disable_css', '__return_true' );

// Or dequeue specific stylesheets (see CSS Conflicts section)

// Theme support for Gravity Forms
add_filter( 'gform_form_tag', function( string $tag ): string {
    return $tag; // Intercept form tag if needed
} );
```

### Contact Form 7

```php
// Remove CF7's inline styles
add_filter( 'wpcf7_load_css', '__return_false' );
```

### The Events Calendar

```php
// Opt into block theme template support
add_action( 'tribe_events_before_html', function(): void {
    add_theme_support( 'tribe-events-views' );
} );

// Use theme templates for single event (instead of TEC's own)
add_filter( 'tribe_events_single_event_block_template', function(): bool {
    return true; // Use block theme template
} );

// Filter event date format to match theme
add_filter( 'tribe_get_start_date', function( string $date ): string {
    return $date; // Modify format if needed
} );
```

### Polylang

```php
// Get translated URL for hreflang
$translated_url = function_exists( 'pll_home_url' ) ? pll_home_url() : home_url();

// Get current language
$current_lang = function_exists( 'pll_current_language' ) ? pll_current_language() : '';

// Add language attribute to <html> element
add_filter( 'language_attributes', function( string $output ): string {
    if ( function_exists( 'pll_current_language' ) ) {
        $output = str_replace( get_bloginfo( 'language' ), pll_current_language( 'locale' ), $output );
    }
    return $output;
} );
```

### bbPress

```php
// Add bbPress theme support
add_theme_support( 'bbpress' );

// bbPress template stack — block theme uses its own templates
add_filter( 'bbp_get_template_stack', function( array $stack ): array {
    // Block themes don't need custom bbPress template directories
    // bbPress falls back to its own plugin templates
    return $stack;
} );
```

---

## CSS Specificity Battles

### Specificity Reference

| Selector type | Specificity |
|--------------|-------------|
| Inline style | 1,0,0,0 (highest) |
| ID (`#id`) | 0,1,0,0 |
| Class, attribute, pseudo-class (`.class`, `[attr]`, `:hover`) | 0,0,1,0 |
| Element, pseudo-element (`div`, `::before`) | 0,0,0,1 |
| `!important` | Overrides all (avoid) |

Block theme styles from `theme.json` are injected as `body { ... }` (specificity: 0,0,0,1) — they are intentionally low-specificity. Per-block CSS at `.wp-block-{name}` is (0,0,1,0).

Plugin styles are often at (0,0,2,0) or higher. To override:
```css
/* Add .wp-site-blocks ancestor for +1 class specificity */
.wp-site-blocks .wpforms-container input { }

/* Or use :is() to avoid raising specificity of the rest */
:is(.wpforms-container) input { }
```

### Order-Based Override (No Specificity Increase)

Load your stylesheet AFTER the plugin's:
```php
wp_enqueue_style(
    'my-theme-wpforms',
    get_theme_file_uri( 'assets/css/plugins/wpforms.css' ),
    array( 'wpforms-full' ), // Depend on plugin handle → loads after
    filemtime( get_theme_file_path( 'assets/css/plugins/wpforms.css' ) )
);
```

`array( 'wpforms-full' )` means your CSS loads after WPForms' CSS, allowing same-specificity overrides.

---

## Block Theme + Classic Plugin Coexistence

### Classic Widgets in Block Theme

Block themes disable widget areas and the classic Widgets screen by default. If a plugin still uses `register_sidebar()` / `dynamic_sidebar()`:

```php
// Re-enable classic widgets screen for specific plugins that require it
add_action( 'after_setup_theme', function(): void {
    // Only re-enable if the specific plugin is active and needs it
    if ( class_exists( 'SomeLegacyPlugin' ) ) {
        remove_theme_support( 'widgets-block-editor' );
    }
} );
```

**This is a last resort.** Prefer finding the plugin's block equivalent first.

### Classic Menus in Block Theme

Block themes use `core/navigation` block. If a plugin calls `wp_nav_menu()`:

```php
// Register a nav menu location so the plugin's wp_nav_menu() call works
add_action( 'after_setup_theme', function(): void {
    register_nav_menus( array(
        'primary' => __( 'Primary Menu', 'my-theme' ),
    ) );
} );
```

The `core/navigation` block can then reference this location.

### Template File Conflicts

Some classic plugins check for specific template files (e.g., `page-contact.php`). Block themes don't use PHP template files. Solutions:

1. **Use FSE templates** — create `templates/page-contact.html` and assign it to the page in Site Editor
2. **Filter `template_include`** — intercept the template load and return the FSE template
3. **Use a plugin with FSE support** — prefer plugins with block-native equivalents

---

## Page Builder Coexistence

### Elementor + Block Theme

Elementor can run alongside a block theme, but individual pages either use Elementor OR the block editor — not both.

```php
// Prevent Elementor from loading its styles on non-Elementor pages
add_action( 'wp_enqueue_scripts', function(): void {
    if ( ! is_singular() || ! get_post_meta( get_the_ID(), '_elementor_edit_mode', true ) ) {
        wp_dequeue_style( 'elementor-frontend' );
    }
}, 100 );
```

### Divi + Block Theme

Divi builder is incompatible with FSE. If Divi is active:
1. Divi-built pages must be rebuilt as FSE templates or block patterns
2. Divi should be deactivated after migration

---

## Caching Plugin Compatibility

### WP Rocket

WP Rocket is generally compatible with block themes. Key settings to configure:

```php
// Exclude Interactivity API script module from WP Rocket's defer
add_filter( 'rocket_delay_js_exclusions', function( array $exclusions ): array {
    $exclusions[] = 'wp-interactivity';
    $exclusions[] = '{{theme-slug}}-interactions';
    return $exclusions;
} );

// Exclude per-block CSS from combine (they're already optimized)
add_filter( 'rocket_css_files_exclusions', function( array $exclusions ): array {
    $exclusions[] = 'assets/css/blocks/';
    return $exclusions;
} );
```

### LiteSpeed Cache

```php
// Purge LiteSpeed cache on theme update
add_action( 'upgrader_process_complete', function(): void {
    if ( class_exists( 'LiteSpeed_Cache_API' ) ) {
        LiteSpeed_Cache_API::purge_all();
    }
} );
```

### Object Caching (Redis / Memcached)

If the site uses object caching, cache expensive plugin queries in `render.php`:

```php
// Cache the result of an expensive plugin query
$cache_key = 'my_plugin_data_' . get_the_ID();
$data = wp_cache_get( $cache_key, 'my-theme' );

if ( false === $data ) {
    $data = some_expensive_plugin_function();
    wp_cache_set( $cache_key, $data, 'my-theme', HOUR_IN_SECONDS );
}
```

---

## Plugin Compatibility Checklist

### Before Activation

- [ ] Required plugins declared in `style.css` header (`Requires Plugins:`)
- [ ] Admin notice generated if required plugin is deactivated
- [ ] Plugin versions verified against minimum requirements

### CSS

- [ ] Plugin-specific CSS in `assets/css/plugins/{{plugin}}.css`
- [ ] Plugin CSS enqueued conditionally (only when plugin is active)
- [ ] Plugin CSS enqueued AFTER plugin's own stylesheet (using `array( 'plugin-handle' )` dependency)
- [ ] No hardcoded colors in plugin CSS — all `var(--wp--preset--*)` references
- [ ] Plugin CSS only overrides visual styles — no layout resets that break plugin functionality
- [ ] Plugin default CSS disabled where replaced by theme CSS (`__return_false` filter)

### PHP

- [ ] All plugin function calls wrapped in `function_exists()` / `class_exists()` checks
- [ ] No plugin functions called directly in `.html` template files
- [ ] Plugin-specific hooks and filters only added when plugin is active

### Conflicts

- [ ] No `!important` in plugin override CSS (unless the plugin itself uses it)
- [ ] Interactivity API scripts excluded from WP Rocket / LiteSpeed defer lists
- [ ] Per-block CSS excluded from cache plugin's combine/minify
- [ ] Classic widgets NOT re-enabled unless absolutely required by a plugin

### Testing

- [ ] Tested with plugin active AND inactive (no fatal errors in either state)
- [ ] Forms submit correctly and show success/error messages in theme styles
- [ ] SEO breadcrumbs render and are styled correctly
- [ ] Language switcher renders correctly in all language contexts (if translation plugin)
- [ ] Events render correctly on archive and single pages (if events plugin)
- [ ] No admin bar overlap on sticky headers
- [ ] No JavaScript console errors with all plugins active simultaneously
