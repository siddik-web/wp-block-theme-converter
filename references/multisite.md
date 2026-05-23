# WordPress Multisite Reference

Deep-dive reference for building and migrating block themes in WordPress Multisite (Network) installations. Read this whenever the user mentions multisite, network activation, sub-sites, domain mapping, or asks about themes that need to work across multiple WordPress sites.

---

## Table of Contents

1. [Multisite Fundamentals](#multisite-fundamentals)
2. [Theme Compatibility Checklist](#theme-compatibility-checklist)
3. [Network Activation vs Per-Site Activation](#network-activation-vs-per-site-activation)
4. [Multisite-Aware PHP Patterns](#multisite-aware-php-patterns)
5. [Shared vs Per-Site Theme Configuration](#shared-vs-per-site-theme-configuration)
6. [Style Variations for Network Sites](#style-variations-for-network-sites)
7. [Block Patterns Across the Network](#block-patterns-across-the-network)
8. [Content Migration in Multisite](#content-migration-in-multisite)
9. [WP-CLI Multisite Commands](#wp-cli-multisite-commands)
10. [Domain Mapping Considerations](#domain-mapping-considerations)
11. [CI Testing on Multisite](#ci-testing-on-multisite)
12. [Multisite Checklist](#multisite-checklist)

---

## Multisite Fundamentals

### Network Types

| Type | URL structure | When to use |
|------|--------------|-------------|
| **Subdirectory** | `example.com/site-a/`, `example.com/site-b/` | Single domain, multiple sites |
| **Subdomain** | `site-a.example.com`, `site-b.example.com` | Branded sub-sites under one root domain |
| **Domain mapping** | `site-a.com`, `site-b.com` | Fully independent domains backed by one WP install |

All three modes are handled identically from a theme's perspective — the theme does not need to know which network type is in use.

### Key Constants and Functions

| API | Description |
|-----|-------------|
| `is_multisite()` | Returns `true` when WordPress Network is enabled |
| `get_current_blog_id()` | Returns the current site's integer blog ID |
| `switch_to_blog( $blog_id )` | Switches context to another site in the network |
| `restore_current_blog()` | Restores context after `switch_to_blog()` |
| `get_blog_option( $blog_id, $key )` | Reads an option from a specific site |
| `get_network_option( null, $key )` | Reads a network-wide option |
| `update_network_option( null, $key, $value )` | Writes a network-wide option |
| `get_sites( $args )` | Lists all sites in the network |
| `is_main_site()` | Returns `true` if the current site is the network's primary site |
| `network_home_url( $path )` | Returns the network's root URL |

### Database Table Prefixes

Each site in a network has its own prefixed tables. Site 1 (main) uses `wp_`, site 2 uses `wp_2_`, site 3 uses `wp_3_`, and so on.

```
wp_posts          → site 1 posts
wp_2_posts        → site 2 posts
wp_3_posts        → site 3 posts
wp_options        → site 1 options
wp_2_options      → site 2 options
wp_sitemeta       → network-wide options
```

Block themes stored in `wp-content/themes/` are shared across all sites — theme files live once, data lives per-site.

---

## Theme Compatibility Checklist

A block theme is multisite-compatible when ALL of these hold:

- [ ] No hardcoded site URLs (use `home_url()`, `network_home_url()`, or `get_template_directory_uri()`)
- [ ] No hardcoded blog IDs or site slugs
- [ ] All `get_template_directory()` / `get_template_directory_uri()` calls are used (not `get_stylesheet_directory()` unless the theme supports child themes intentionally)
- [ ] Assets versioned with `filemtime()` — works identically on all sites since the theme files are shared
- [ ] Pattern slugs are unique and prefixed with the theme slug — avoids collisions when the theme is active on multiple network sites
- [ ] CPTs and taxonomies registered with `init` hook — fires per-site, not network-wide
- [ ] Post meta registered with `register_post_meta()` on `init` — scoped per-site automatically
- [ ] Block Bindings sources registered on `init` — scoped per-site automatically
- [ ] No `switch_to_blog()` calls inside templates or patterns (unnecessary and harmful to performance)
- [ ] Network activation handler implemented (see below) if the theme does anything on activation

---

## Network Activation vs Per-Site Activation

### Activation Modes

| Mode | How activated | When to use |
|------|-------------|-------------|
| **Per-site** | `Appearance → Themes` on each sub-site | Theme is customised per site; default for most themes |
| **Network-enabled** | `Network Admin → Themes → Network Enable` | Allows but does not force activation; super admins control which sites use it |
| **Network-default** | Set as `WP_DEFAULT_THEME` or via `stylesheet` network option | Forces the theme on all new sites; use sparingly |

### Detecting Network Admin Context

```php
// Only run certain setup code from the network admin.
if ( is_network_admin() ) {
    // e.g. display a network-wide notice.
}
```

### after_switch_theme on Individual Sites

When a super-admin activates the theme on a sub-site, `after_switch_theme` fires in the context of that site — `get_current_blog_id()` returns the correct ID. No special handling is needed.

---

## Multisite-Aware PHP Patterns

### Safe URL Generation

```php
// Always works regardless of network type or domain mapping.
$asset_url = get_template_directory_uri() . '/assets/dist/main.css';

// For links that should point to the current site's home.
$home = home_url( '/' );

// For links to the network root (subdirectory networks: example.com; subdomain: example.com).
$network_root = network_home_url( '/' );
```

### Reading Per-Site Options

```php
// Reading a site-specific option (reads from current site's wp_X_options table).
$value = get_option( 'my_theme_option', 'default' );

// Reading an option from a specific site in the network.
$value = get_blog_option( $blog_id, 'my_theme_option', 'default' );

// Reading a network-wide option from wp_sitemeta.
$value = get_network_option( null, 'my_network_option', 'default' );
```

### Querying Posts Across Sites

Only do this in admin context or background processes — never in front-end templates:

```php
// Query posts on a specific sub-site.
switch_to_blog( $blog_id );
$posts = get_posts( array( 'post_type' => 'post', 'numberposts' => 10 ) );
restore_current_blog();

// Iterate all sites in the network (admin context only).
$sites = get_sites( array( 'number' => 0 ) );
foreach ( $sites as $site ) {
    switch_to_blog( $site->blog_id );
    // ... do something
    restore_current_blog();
}
```

### Registering CPTs Only on Specific Sites

When a CPT should exist only on certain network sites, gate the registration:

```php
function {{theme_slug_underscored}}_register_post_types(): void {
    // Only register on the main site and site ID 5.
    if ( is_multisite() && ! in_array( get_current_blog_id(), array( 1, 5 ), true ) ) {
        return;
    }
    register_post_type( '{{cpt-slug}}', array( /* ... */ ) );
}
add_action( 'init', '{{theme_slug_underscored}}_register_post_types' );
```

### Uploads Path in Multisite

Each site in a multisite network stores uploads in a site-specific directory:

```
wp-content/uploads/sites/2/   ← site 2 uploads
wp-content/uploads/sites/3/   ← site 3 uploads
wp-content/uploads/           ← main site uploads (site 1)
```

`wp_upload_dir()` always returns the correct path for the current site — no special handling needed in themes.

---

## Shared vs Per-Site Theme Configuration

### theme.json is Shared

`theme.json` is a theme file — it applies identically to every site that activates the theme. It is NOT editable per-site through the file system.

**What this means:**
- Color palettes, typography, and spacing defined in `theme.json` apply to all network sites equally
- Per-site customisations are handled via **style variations** (see next section) or via **Global Styles** overrides in the Site Editor (stored in `wp_posts` per-site)

### Global Styles Overrides Are Per-Site

When an admin edits Global Styles in the Site Editor (`Appearance → Editor → Styles`), those overrides are stored as a `wp_global_styles` CPT post in that site's `wp_X_posts` table. Different sites can have different Global Styles even when sharing the same theme.json base.

### functions.php Runs Per-Site

`functions.php` is loaded once per request in the context of the active site. All WordPress hooks, filters, and registrations it performs are scoped to the current site. No multisite-specific setup is required in most themes.

---

## Style Variations for Network Sites

Use style variations to provide different brand identities across network sites. Each site admin picks the variation that matches their brand.

### Naming Convention

```
styles/
├── default.json         ← Base style (loaded automatically when no variation active)
├── brand-blue.json      ← Variation for site A
├── brand-green.json     ← Variation for site B
└── brand-dark.json      ← Dark mode / high-contrast variation
```

### Minimal Style Variation (colors + typography only)

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "Brand Blue",
    "settings": {
        "color": {
            "palette": [
                { "slug": "primary",    "color": "#1a4b8c", "name": "Primary" },
                { "slug": "secondary",  "color": "#e8f0fc", "name": "Secondary" },
                { "slug": "accent",     "color": "#f0a500", "name": "Accent" },
                { "slug": "background", "color": "#ffffff", "name": "Background" },
                { "slug": "foreground", "color": "#1a1a1a", "name": "Foreground" }
            ]
        },
        "typography": {
            "fontFamilies": [
                {
                    "fontFamily": "'Inter', sans-serif",
                    "slug": "body",
                    "name": "Body"
                }
            ]
        }
    }
}
```

### Programmatically Activating a Variation Per Site

If different network sites should get different variations automatically (without manual selection), apply the variation via PHP on `after_setup_theme`:

```php
function {{theme_slug_underscored}}_apply_network_site_variation(): void {
    if ( ! is_multisite() ) {
        return;
    }

    $site_variations = array(
        2 => 'brand-blue',
        3 => 'brand-green',
        4 => 'brand-dark',
    );

    $blog_id   = get_current_blog_id();
    $variation = $site_variations[ $blog_id ] ?? null;

    if ( $variation ) {
        add_filter(
            'get_block_theme_vars',
            function( array $vars ) use ( $variation ): array {
                $vars['variation'] = $variation;
                return $vars;
            }
        );
    }
}
add_action( 'after_setup_theme', '{{theme_slug_underscored}}_apply_network_site_variation' );
```

---

## Block Patterns Across the Network

### Pattern Registration is Per-Site

`register_block_pattern()` and `register_block_pattern_category()` both run on the `init` hook, which fires in the context of the current site. Patterns registered this way appear in the Site Editor only for the site where the theme is active.

### Suppressing Patterns on Specific Sites

```php
function {{theme_slug_underscored}}_register_patterns(): void {
    // Don't register the WooCommerce patterns on sites without WooCommerce.
    if ( is_multisite() && ! class_exists( 'WooCommerce' ) ) {
        // Register only non-WC patterns.
        register_block_pattern( /* ... */ );
        return;
    }

    // Full pattern set.
    register_block_pattern( /* ... */ );
    register_block_pattern( /* woocommerce pattern ... */ );
}
add_action( 'init', '{{theme_slug_underscored}}_register_patterns' );
```

### Synced Patterns (Reusable Blocks) Across Sites

Synced patterns (formerly "reusable blocks") are stored as `wp_block` posts and are **per-site**. They cannot be automatically shared across network sites.

To pre-populate synced patterns on new sites, hook into `wp_initialize_site`:

```php
function {{theme_slug_underscored}}_seed_synced_patterns( WP_Site $new_site ): void {
    switch_to_blog( $new_site->blog_id );

    wp_insert_post( array(
        'post_title'   => __( 'Site-wide CTA', '{{text-domain}}' ),
        'post_content' => '<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button /--></div><!-- /wp:buttons -->',
        'post_status'  => 'publish',
        'post_type'    => 'wp_block',
    ) );

    restore_current_blog();
}
add_action( 'wp_initialize_site', '{{theme_slug_underscored}}_seed_synced_patterns' );
```

---

## Content Migration in Multisite

### Scope Migration Per Site

Run WP-CLI commands with `--url=` to target a specific site in the network:

```bash
# List posts on a specific sub-site (subdirectory).
wp post list --url=example.com/site-a/ --post_type=post --format=table

# List posts on a subdomain site.
wp post list --url=site-a.example.com --post_type=post --format=table

# Count classic-format posts on site 2.
wp post list --url=example.com/site-a/ --post_type=post,page --posts_per_page=-1 \
  --format=json | php -r '$p=json_decode(file_get_contents("php://stdin"),true); \
  echo count(array_filter($p, fn($x)=>!str_contains($x["post_content"],"<!-- wp:")));'
```

### Migrating All Sites in a Network

```bash
# Loop over all site URLs in the network and run a WP-CLI command on each.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  echo "=== Migrating: $url ==="
  wp theme activate {{theme-slug}} --url="$url"
  wp cache flush --url="$url"
done
```

### Per-Site Database Backup

```bash
# Export only one site's tables (site ID 3 uses prefix wp_3_).
wp db export --tables=$(wp db tables --url=example.com/site-c/ --format=csv) \
  backup-site3-$(date +%Y%m%d).sql

# Restore a single site's tables.
wp db import backup-site3-20240901.sql
```

### Theme Activation Across All Sites

```bash
# Network-enable the theme (makes it available to all sites).
wp theme enable {{theme-slug}} --network

# Activate on every site in the network.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  wp theme activate {{theme-slug}} --url="$url"
done
```

### Search-Replace Per Site

```bash
# Run search-replace scoped to one site's tables (safe for multisite).
wp search-replace 'https://old-site-a.com' 'https://example.com/site-a' \
  --url=example.com/site-a/ \
  --precise \
  --dry-run

# Apply (no --dry-run).
wp search-replace 'https://old-site-a.com' 'https://example.com/site-a' \
  --url=example.com/site-a/ \
  --precise
```

---

## WP-CLI Multisite Commands

### Network Information

```bash
# List all sites in the network.
wp site list --fields=blog_id,domain,path,public,archived,deleted --format=table

# Get network-level options.
wp network-meta get 1 siteurl
wp network-meta get 1 admin_email

# List network-enabled themes.
wp theme list --status=active --network --format=table
```

### Creating and Managing Sites

```bash
# Create a new site in the network.
wp site create --slug=new-site --title="New Site" --email=admin@example.com

# Deactivate a site (archive it).
wp site archive {{blog_id}}

# Permanently delete a site.
wp site delete {{blog_id}} --yes
```

### Running Commands Across All Sites

```bash
# Flush cache on every site.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  wp cache flush --url="$url"
done

# Run rewrite flush on all sites.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  wp rewrite flush --hard --url="$url"
done

# Check for PHP errors on all sites.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  echo "Checking $url"
  wp eval 'echo "OK\n";' --url="$url"
done
```

### Verification After Migration

```bash
# Verify theme is active on all sites.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  active=$(wp theme list --status=active --url="$url" --field=name --format=csv | head -1)
  echo "$url → $active"
done

# Count remaining classic-format posts on all sites.
wp site list --field=url --format=csv | tail -n +2 | while IFS= read -r url; do
  count=$(wp post list --url="$url" --post_type=post,page --posts_per_page=-1 \
    --format=json | php -r '$p=json_decode(file_get_contents("php://stdin"),true); \
    echo count(array_filter($p, fn($x)=>!str_contains($x["post_content"],"<!-- wp:")));')
  echo "$url → $count classic posts remaining"
done
```

---

## Domain Mapping Considerations

### What Domain Mapping Does

Domain mapping (via plugins like Mercator, or WP Engine's built-in mapping, or Cloudflare) points independent custom domains at specific sites in a subdomain/subdirectory network.

### Theme Impact

- `home_url()` returns the mapped domain (e.g. `https://site-a.com`) — correct for all theme URLs
- `network_home_url()` returns the network root (e.g. `https://example.com`) — use this only for network-level links
- `get_template_directory_uri()` returns the **network root** domain, not the mapped domain, because theme files are stored once — this is correct and expected

### Asset URL Consistency

When domain mapping is active, theme asset URLs (`get_template_directory_uri()`) will point to the main network domain, not the mapped domain. This is correct WordPress behaviour — browsers load cross-origin assets normally. If a CSP header is blocking cross-origin asset loads, add the network root domain to the `img-src`, `script-src`, and `style-src` directives.

### Search-Replace After Domain Mapping

After mapping a domain to a site, run search-replace on that site's tables to update stored URLs in post content and meta:

```bash
wp search-replace 'https://example.com/site-a' 'https://site-a.com' \
  --url=site-a.com \
  --precise \
  --skip-columns=guid
```

---

## CI Testing on Multisite

### Matrix Strategy

Test the theme on both single-site and multisite in the same CI workflow using a matrix:

```yaml
wordpress-tests:
  name: WordPress Tests (PHP ${{ matrix.php }}, WP ${{ matrix.wp }}, MS ${{ matrix.multisite }})
  runs-on: ubuntu-latest
  needs: build

  strategy:
    fail-fast: false
    matrix:
      php: ['8.1', '8.2', '8.3']
      wp: ['6.5', '6.6', '6.7', '6.8']
      multisite: [false, true]
      exclude:
        # Only test latest PHP against all WP versions; test all PHP against latest WP.
        - php: '8.1'
          wp: '6.5'
        - php: '8.1'
          wp: '6.6'

  services:
    mysql:
      image: mysql:8.0
      env:
        MYSQL_ROOT_PASSWORD: root
        MYSQL_DATABASE: wordpress
      options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=5

  steps:
    - uses: actions/checkout@v4

    - name: Download built assets
      uses: actions/download-artifact@v4
      with:
        name: built-assets
        path: assets/dist/

    - name: Set up PHP ${{ matrix.php }}
      uses: shivammathur/setup-php@v2
      with:
        php-version: ${{ matrix.php }}
        extensions: mysqli

    - name: Set up WordPress ${{ matrix.wp }}
      uses: WordPress/setup-wordpress@v1
      with:
        version: ${{ matrix.wp }}
        multisite: ${{ matrix.multisite }}

    - name: Install Theme Check plugin
      run: wp plugin install theme-check --activate

    - name: Run Theme Check
      run: |
        wp theme activate {{theme-slug}}
        wp eval 'run_themechecks_against_theme( wp_get_theme() );' 2>&1 | \
          grep -E '(REQUIRED|WARNING)' | tee theme-check-results.txt || true
        if grep -q 'REQUIRED' theme-check-results.txt; then
          echo "Theme Check found REQUIRED violations"
          exit 1
        fi

    - name: Verify theme activates without errors
      run: |
        wp eval 'echo "Theme OK\n";' 2>&1 | grep -v 'PHP' | tee activation-result.txt
        if grep -qi 'fatal\|error\|warning\|notice' activation-result.txt; then
          echo "Theme activation produced errors"
          cat activation-result.txt
          exit 1
        fi

    - name: Verify no PHP errors in multisite context
      if: matrix.multisite == true
      run: |
        # Create a sub-site and activate the theme there too.
        wp site create --slug=test-subsite --title="Test Subsite" --email=test@example.com
        wp theme activate {{theme-slug}} --url=localhost/test-subsite/
        wp eval 'echo "Subsite OK\n";' --url=localhost/test-subsite/
```

### Multisite-Specific E2E Test

Add a Playwright test that visits a sub-site and verifies the theme renders correctly:

```js
// tests/e2e/multisite.spec.js
import { test, expect } from '@playwright/test';

test.describe( 'Multisite subsite rendering', () => {
    test( 'sub-site front page renders without errors', async ( { page } ) => {
        const response = await page.goto( process.env.SUBSITE_URL || 'http://localhost/test-subsite/' );
        expect( response.status() ).toBe( 200 );
        await expect( page.locator( 'body' ) ).not.toContainText( 'Fatal error' );
        await expect( page.locator( 'body' ) ).not.toContainText( 'Warning:' );
        await expect( page.locator( '#wp-admin-bar' ) ).toBeVisible();
    } );

    test( 'sub-site site editor opens', async ( { page } ) => {
        await page.goto(
            ( process.env.SUBSITE_URL || 'http://localhost/test-subsite/' ) + 'wp-admin/site-editor.php'
        );
        await expect( page.locator( '.edit-site' ) ).toBeVisible( { timeout: 15000 } );
    } );
} );
```

---

## Multisite Checklist

### Pre-Development

- [ ] Confirmed whether the theme needs to work on multisite or just single-site
- [ ] Identified if any features should be gated per-site (CPTs, patterns, WooCommerce)
- [ ] Decided on style variation strategy: shared base + per-site variations, or one theme.json for all

### Theme Development

- [ ] No hardcoded site URLs — all use `home_url()`, `network_home_url()`, or `get_template_directory_uri()`
- [ ] No hardcoded blog IDs
- [ ] All CPT and taxonomy registrations gate via `is_multisite()` where needed
- [ ] Pattern category registration unconditional (categories are not harmful if empty)
- [ ] Pattern registration gates correctly where patterns require specific plugins (e.g. WooCommerce)
- [ ] `wp_initialize_site` hook used to seed data on new sites (if required)
- [ ] Style variations created for each major brand/site identity in the network (if applicable)

### Testing

- [ ] Theme activates on main site without PHP errors
- [ ] Theme activates on a sub-site without PHP errors
- [ ] Site Editor opens and shows correct templates on main site
- [ ] Site Editor opens and shows correct templates on a sub-site
- [ ] Global Styles overrides on sub-site do not bleed into main site
- [ ] Block patterns appear in inserter on all active sites
- [ ] No `switch_to_blog()` calls in front-end templates
- [ ] Assets load correctly when domain mapping is active
- [ ] CI matrix includes `multisite: true` variant

### Migration

- [ ] WP-CLI commands scoped with `--url=` for per-site operations
- [ ] Per-site database backups taken before migration
- [ ] Theme network-enabled before per-site activation
- [ ] `wp rewrite flush --hard` run on all sites after CPT template changes
- [ ] Search-replace run per-site with correct old/new URLs
- [ ] Cache flushed on all sites after migration
