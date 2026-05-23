# /wp-plugin-theme

**Purpose:** Extend a block theme to declare plugin dependencies, add plugin-specific CSS stubs, and generate compatibility code for the most common WordPress plugins (Yoast SEO, WPForms, Gravity Forms, ACF, Jetpack, WooCommerce, and others).

## Trigger

User types `/wp-plugin-theme` OR asks for plugin compatibility in their theme, OR their conversion source HTML references plugin output (e.g., a contact form, SEO breadcrumbs, a review widget).

## Workflow

### Step 1: Identify Plugins

Ask (or infer from source HTML / context):

| Question | Why it matters |
|----------|---------------|
| Which plugins are **required** (theme breaks without them)? | Go into `required_plugins` declaration |
| Which plugins are **recommended** (optional features)? | Go into `recommended_plugins` declaration |
| Which plugins is the user already using? | Determines which CSS stubs to generate |
| Any page builder plugins (Elementor, Divi)? | Different compatibility approach |

**Common plugins to ask about:**
- Yoast SEO / Rank Math / SEOPress (breadcrumbs, OG tags)
- WPForms / Gravity Forms / Contact Form 7 (forms)
- ACF / CMB2 / Meta Box (custom fields)
- WooCommerce (eCommerce — use `/convert-to-wp-theme` + `references/woocommerce.md` instead for full WooCommerce themes)
- Jetpack (social sharing, related posts)
- WP Rocket / LiteSpeed Cache (caching plugins)
- Yoast Duplicate Post / WP All Import (content tools)
- TranslatePress / Polylang / WPML (translation)
- The Events Calendar (events)
- MemberPress / Restrict Content Pro (membership)

### Step 2: Produce a Plugin Compatibility Plan

```
PLUGIN COMPATIBILITY PLAN
==========================
| Plugin              | Status      | What theme generates                              |
|---------------------|-------------|--------------------------------------------------|
| Yoast SEO           | Required    | Breadcrumb template part, OG image size, CSS stub |
| WPForms             | Required    | Form CSS stub, accessibility overrides            |
| ACF                 | Required    | Block Bindings source, post meta registration     |
| Gravity Forms       | Recommended | CSS stub, AJAX compat note                        |
| Jetpack             | Recommended | CSS stub for sharing buttons                      |
```

Show plan, get confirmation before generating files.

### Step 3: Plugin Dependency Declaration

WordPress 6.5+ supports declaring required plugins in `style.css` header. Additionally use the TGMPA pattern for backward compatibility.

**style.css header addition:**
```css
/*
 * Theme Name:   {{Theme Name}}
 * ...
 * Requires Plugins: {{plugin-slug}}, {{plugin-slug-2}}
 */
```

Slugs must match the plugin's **WordPress.org directory slug** — the folder name under `wp-content/plugins/`. For example, WPForms is `wpforms-lite` (free) or `wpforms` (pro); ACF is `advanced-custom-fields` (free) or `advanced-custom-fields-pro` (pro). Verify slugs at `wordpress.org/plugins/{{slug}}` before committing.

> **ACF Block Bindings version requirement:** Using ACF fields with the Block Bindings API requires **ACF PRO 6.3+** (for native binding support) or the custom `register_block_bindings_source()` approach shown in `commands/wp-migrate.md`. The Block Bindings API itself requires **WordPress 6.5+**. Always check both version constraints before declaring ACF as a required plugin for binding-dependent features.

**TGMPA-style helper in `inc/plugin-dependencies.php`:**

```php
<?php
/**
 * Plugin dependency declarations.
 *
 * Note: WordPress 6.5+ reads "Requires Plugins" from style.css header.
 * This file provides a user-facing admin notice for older WP versions
 * and for plugins not on WordPress.org.
 */
function {{theme_slug_underscored}}_check_plugin_dependencies(): void {
    if ( ! is_admin() ) {
        return;
    }

    $required = array(
        array(
            'slug'    => '{{plugin-slug}}',
            'name'    => '{{Plugin Name}}',
            'version' => '{{min-version}}',
        ),
    );

    $missing = array();
    foreach ( $required as $plugin ) {
        if ( ! is_plugin_active( $plugin['slug'] . '/' . $plugin['slug'] . '.php' )
            && ! is_plugin_active( $plugin['slug'] . '/index.php' ) ) {
            $missing[] = $plugin['name'] . ' (v' . $plugin['version'] . '+)';
        }
    }

    if ( ! empty( $missing ) ) {
        add_action( 'admin_notices', function() use ( $missing ) {
            printf(
                '<div class="notice notice-error"><p>%s</p></div>',
                sprintf(
                    /* translators: %s: list of required plugins */
                    esc_html__( '{{Theme Name}} requires the following plugins: %s', '{{text-domain}}' ),
                    '<strong>' . esc_html( implode( ', ', $missing ) ) . '</strong>'
                )
            );
        } );
    }
}
add_action( 'admin_init', '{{theme_slug_underscored}}_check_plugin_dependencies' );
```

Add to `functions.php`:
```php
require_once get_template_directory() . '/inc/plugin-dependencies.php';
```

### Step 4: Generate Per-Plugin Compatibility Code

Output only the files relevant to the plugins identified in Step 1.

---

#### Yoast SEO / Rank Math / SEOPress

**Breadcrumb template part** (`parts/breadcrumbs.html`):

```html
<!-- wp:group {"tagName":"nav","ariaLabel":"Breadcrumb","className":"site-breadcrumbs","layout":{"type":"constrained"}} -->
<nav class="wp-block-group site-breadcrumbs" aria-label="<?php esc_attr_e( 'Breadcrumb', '{{text-domain}}' ); ?>">
    <!-- wp:html -->
    <?php
    if ( function_exists( 'yoast_breadcrumb' ) ) {
        yoast_breadcrumb( '<p class="breadcrumb">', '</p>' );
    } elseif ( function_exists( 'rank_math_the_breadcrumbs' ) ) {
        rank_math_the_breadcrumbs();
    } elseif ( function_exists( 'seopress_display_breadcrumbs' ) ) {
        seopress_display_breadcrumbs();
    }
    ?>
    <!-- /wp:html -->
</nav>
<!-- /wp:group -->
```

**OG image size** (in `inc/setup.php`):
```php
add_image_size( 'og-image', 1200, 630, true );
```

**Yoast CSS stub** (`assets/css/plugins/yoast.css`):
```css
/* Breadcrumb navigation */
.site-breadcrumbs .breadcrumb {
    font-size: var(--wp--preset--font-size--small);
    color: var(--wp--preset--color--muted);
}
.site-breadcrumbs .breadcrumb a {
    color: var(--wp--preset--color--primary);
    text-decoration: none;
}
.site-breadcrumbs .breadcrumb a:hover {
    text-decoration: underline;
}
.site-breadcrumbs .breadcrumb-separator {
    margin-inline: var(--wp--preset--spacing--20);
    color: var(--wp--preset--color--muted);
}
```

Enqueue conditionally:
```php
if ( defined( 'WPSEO_VERSION' ) || defined( 'RANK_MATH_VERSION' ) || defined( 'SEOPRESS_VERSION' ) ) {
    wp_enqueue_style(
        '{{theme-slug}}-yoast',
        get_template_directory_uri() . '/assets/css/plugins/yoast.css',
        array( '{{theme-slug}}-style' ),
        filemtime( get_template_directory() . '/assets/css/plugins/yoast.css' )
    );
}
```

---

#### WPForms

**CSS stub** (`assets/css/plugins/wpforms.css`):
```css
/* WPForms — reset to match theme styling */
.wpforms-container .wpforms-form .wpforms-field input,
.wpforms-container .wpforms-form .wpforms-field textarea,
.wpforms-container .wpforms-form .wpforms-field select {
    border: 1px solid var(--wp--preset--color--border, #d1d5db);
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--40);
    font-family: var(--wp--preset--font-family--body);
    font-size: var(--wp--preset--font-size--medium);
    color: var(--wp--preset--color--foreground);
    background-color: var(--wp--preset--color--background);
    width: 100%;
}

.wpforms-container .wpforms-form .wpforms-submit-container .wpforms-submit {
    background-color: var(--wp--preset--color--primary);
    color: var(--wp--preset--color--background);
    border: none;
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--60);
    font-size: var(--wp--preset--font-size--medium);
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.wpforms-container .wpforms-form .wpforms-submit-container .wpforms-submit:hover {
    background-color: var(--wp--preset--color--primary-dark, var(--wp--preset--color--primary));
    opacity: 0.9;
}

.wpforms-container .wpforms-form label.wpforms-error {
    color: var(--wp--preset--color--error, #dc2626);
    font-size: var(--wp--preset--font-size--small);
}
```

Enqueue conditionally:
```php
if ( class_exists( 'WPForms' ) ) {
    wp_enqueue_style(
        '{{theme-slug}}-wpforms',
        get_template_directory_uri() . '/assets/css/plugins/wpforms.css',
        array( '{{theme-slug}}-style' ),
        filemtime( get_template_directory() . '/assets/css/plugins/wpforms.css' )
    );
}
```

---

#### Gravity Forms

**CSS stub** (`assets/css/plugins/gravity-forms.css`):
```css
/* Gravity Forms — theme integration */
.gform_wrapper.gravity-theme .gfield input,
.gform_wrapper.gravity-theme .gfield textarea,
.gform_wrapper.gravity-theme .gfield select {
    border: 1px solid var(--wp--preset--color--border, #d1d5db);
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--40);
    font-family: var(--wp--preset--font-family--body);
    font-size: var(--wp--preset--font-size--medium);
    color: var(--wp--preset--color--foreground);
    background-color: var(--wp--preset--color--background);
}

.gform_wrapper.gravity-theme .gform_footer input[type="submit"],
.gform_wrapper.gravity-theme .gform_page_footer input[type="submit"] {
    background-color: var(--wp--preset--color--primary);
    color: var(--wp--preset--color--background);
    border: none;
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--60);
    font-size: var(--wp--preset--font-size--medium);
    font-weight: 600;
    cursor: pointer;
}

.gform_wrapper.gravity-theme .gfield_validation_message,
.gform_wrapper.gravity-theme .validation_message {
    color: var(--wp--preset--color--error, #dc2626);
    font-size: var(--wp--preset--font-size--small);
}
```

Enqueue conditionally:
```php
if ( class_exists( 'GFForms' ) ) {
    wp_enqueue_style(
        '{{theme-slug}}-gravity-forms',
        get_template_directory_uri() . '/assets/css/plugins/gravity-forms.css',
        array( '{{theme-slug}}-style' ),
        filemtime( get_template_directory() . '/assets/css/plugins/gravity-forms.css' )
    );
}
```

---

#### Contact Form 7

**CSS stub** (`assets/css/plugins/cf7.css`):
```css
/* Contact Form 7 */
.wpcf7-form .wpcf7-text,
.wpcf7-form .wpcf7-email,
.wpcf7-form .wpcf7-textarea,
.wpcf7-form .wpcf7-select {
    border: 1px solid var(--wp--preset--color--border, #d1d5db);
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--40);
    font-family: var(--wp--preset--font-family--body);
    font-size: var(--wp--preset--font-size--medium);
    width: 100%;
}

.wpcf7-form input[type="submit"] {
    background-color: var(--wp--preset--color--primary);
    color: var(--wp--preset--color--background);
    border: none;
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--60);
    cursor: pointer;
    font-weight: 600;
}

.wpcf7-not-valid-tip {
    color: var(--wp--preset--color--error, #dc2626);
    font-size: var(--wp--preset--font-size--small);
}

.wpcf7-response-output {
    border: 1px solid currentColor;
    border-radius: 4px;
    padding: var(--wp--preset--spacing--30);
    margin-block-start: var(--wp--preset--spacing--40);
}
```

Enqueue conditionally:
```php
if ( defined( 'WPCF7_VERSION' ) ) {
    wp_enqueue_style(
        '{{theme-slug}}-cf7',
        get_template_directory_uri() . '/assets/css/plugins/cf7.css',
        array( '{{theme-slug}}-style' ),
        filemtime( get_template_directory() . '/assets/css/plugins/cf7.css' )
    );
}
```

---

#### The Events Calendar

**CSS stub** (`assets/css/plugins/events-calendar.css`):
```css
/* The Events Calendar */
.tribe-common .tribe-common-h2,
.tribe-events .tribe-events-calendar__month-grid-cell-title {
    font-family: var(--wp--preset--font-family--heading);
    color: var(--wp--preset--color--foreground);
}

.tribe-common .tribe-common-c-btn,
.tribe-events .tribe-events-c-nav__next,
.tribe-events .tribe-events-c-nav__prev {
    background-color: var(--wp--preset--color--primary);
    color: var(--wp--preset--color--background);
    border-radius: 4px;
}

.tribe-events .tribe-events-calendar__month-grid-cell--current {
    background-color: var(--wp--preset--color--surface, #f8f9fa);
}
```

**Declare theme support** (in `inc/setup.php`):
```php
add_action( 'tribe_events_before_html', function(): void {
    // Opt into The Events Calendar's block theme support.
    if ( function_exists( 'tribe_is_event' ) ) {
        add_theme_support( 'tribe-events-views' );
    }
} );
```

---

#### Jetpack

**CSS stub** (`assets/css/plugins/jetpack.css`):
```css
/* Jetpack sharing buttons */
.sharedaddy .sd-content ul li a.share-button {
    border-radius: 4px;
    font-size: var(--wp--preset--font-size--small);
}

/* Jetpack related posts */
.jp-relatedposts {
    margin-block-start: var(--wp--preset--spacing--70);
    padding-block-start: var(--wp--preset--spacing--50);
    border-block-start: 1px solid var(--wp--preset--color--border, #e5e7eb);
}

.jp-relatedposts-post-title a {
    font-family: var(--wp--preset--font-family--heading);
    color: var(--wp--preset--color--foreground);
    text-decoration: none;
}
```

---

#### Polylang / WPML (Translation Plugins)

**Language switcher template part** (`parts/language-switcher.html`):

```html
<!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group">
    <!-- wp:html -->
    <?php
    if ( function_exists( 'pll_the_languages' ) ) {
        // Polylang
        pll_the_languages( array(
            'show_flags'  => 0,
            'show_names'  => 1,
            'raw'         => 0,
        ) );
    } elseif ( has_filter( 'wpml_current_language' ) ) {
        // WPML
        do_action( 'wpml_add_language_selector' );
    }
    ?>
    <!-- /wp:html -->
</div>
<!-- /wp:group -->
```

**CSS stub** (`assets/css/plugins/language-switcher.css`):
```css
/* Language switcher (Polylang / WPML) */
.pll-parent-menu-item a,
.wpml-ls-item a {
    font-size: var(--wp--preset--font-size--small);
    color: var(--wp--preset--color--foreground);
    text-decoration: none;
    padding-inline: var(--wp--preset--spacing--20);
}
```

**RTL direction support** (in `inc/setup.php`):
```php
add_action( 'after_setup_theme', function(): void {
    // Load RTL stylesheet for right-to-left languages.
    load_theme_textdomain( '{{text-domain}}', get_template_directory() . '/languages' );
} );
```

---

#### MemberPress / Restrict Content Pro

**Protected content CSS stub** (`assets/css/plugins/members.css`):
```css
/* MemberPress login/registration */
.mepr-login-form input[type="text"],
.mepr-login-form input[type="password"],
.mepr-login-form input[type="email"] {
    border: 1px solid var(--wp--preset--color--border, #d1d5db);
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--40);
    width: 100%;
}

.mepr-submit,
.mepr-btn {
    background-color: var(--wp--preset--color--primary);
    color: var(--wp--preset--color--background);
    border: none;
    border-radius: 4px;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--60);
    cursor: pointer;
    font-weight: 600;
}

/* "Members only" content notice */
.mepr-unauthorized-excerpt {
    padding: var(--wp--preset--spacing--50);
    background-color: var(--wp--preset--color--surface, #f8f9fa);
    border-inline-start: 4px solid var(--wp--preset--color--primary);
    border-radius: 0 4px 4px 0;
}
```

---

### Step 5: Enqueue Architecture

Consolidate all conditional plugin styles in `inc/plugin-compat.php`:

```php
<?php
/**
 * Plugin compatibility styles — loaded only when the plugin is active.
 */
function {{theme_slug_underscored}}_enqueue_plugin_styles(): void {
    $plugins = array(
        'wpforms'       => array( 'check' => 'class_exists("WPForms")',         'slug' => 'wpforms' ),
        'gravity-forms' => array( 'check' => 'class_exists("GFForms")',          'slug' => 'gravity-forms' ),
        'cf7'           => array( 'check' => 'defined("WPCF7_VERSION")',         'slug' => 'cf7' ),
        'yoast'         => array( 'check' => 'defined("WPSEO_VERSION")',         'slug' => 'yoast' ),
        'jetpack'       => array( 'check' => 'class_exists("Jetpack")',          'slug' => 'jetpack' ),
        'members'       => array( 'check' => 'class_exists("MeprOptions")',      'slug' => 'members' ),
    );

    foreach ( $plugins as $handle => $plugin ) {
        // phpcs:ignore Squiz.PHP.Eval.Discouraged
        if ( ! eval( "return {$plugin['check']};" ) ) {
            continue;
        }

        $file = get_template_directory() . "/assets/css/plugins/{$plugin['slug']}.css";
        if ( ! file_exists( $file ) ) {
            continue;
        }

        wp_enqueue_style(
            "{{theme-slug}}-{$handle}",
            get_template_directory_uri() . "/assets/css/plugins/{$plugin['slug']}.css",
            array( '{{theme-slug}}-style' ),
            filemtime( $file )
        );
    }
}
add_action( 'wp_enqueue_scripts', '{{theme_slug_underscored}}_enqueue_plugin_styles' );
```

**Note:** Replace `eval()` above with explicit `if` checks for each plugin in production code — `eval()` is used here only to reduce repetition in the template. The generated output should use explicit conditionals.

### Step 6: Output File List

```
=== FILE: {{theme-slug}}/inc/plugin-dependencies.php ===
=== FILE: {{theme-slug}}/inc/plugin-compat.php ===
=== FILE: {{theme-slug}}/assets/css/plugins/{{plugin-slug}}.css ===  (one per plugin)
=== FILE: {{theme-slug}}/parts/breadcrumbs.html ===                   (if SEO plugin)
=== FILE: {{theme-slug}}/parts/language-switcher.html ===             (if translation plugin)
```

Also output the `style.css` header addition and `functions.php` additions:
```
=== ADDITION: {{theme-slug}}/style.css (header) ===
=== ADDITION: {{theme-slug}}/functions.php ===
```

### Step 7: Verification Steps

```
✅ Admin notice appears if required plugin is deactivated
✅ Admin notice disappears when plugin is activated
✅ Plugin-specific CSS loads only on pages where plugin renders output
✅ Form fields match theme color palette (check with DevTools)
✅ Form submit button matches theme button styles
✅ SEO breadcrumbs render correctly in breadcrumbs template part
✅ Language switcher renders in the correct template part
✅ No PHP errors related to missing plugin functions (test with plugin deactivated)
```

## Example Invocations

```
/wp-plugin-theme
My theme uses Yoast SEO (required) and WPForms (required).
Gravity Forms is optional. Theme slug is "lumina".
```

```
/wp-plugin-theme
Add compatibility for Polylang language switcher and
The Events Calendar to my block theme "cascada".
```

## Read Also

- `references/plugin-compatibility.md` — plugin detection patterns, conflict resolution, plugin-specific hooks
- `references/woocommerce.md` — full WooCommerce theme support (not covered here)
- `commands/wp-migrate.md` — if migrating ACF fields to Block Bindings
