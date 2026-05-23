# Content Migration Reference

Deep-dive reference for migrating existing WordPress content — Classic Editor, ACF, shortcodes, widget areas, Custom Post Types, and page builder templates — into a block theme. Read this when `/wp-migrate` is invoked.

---

## Table of Contents

1. [Migration Strategy Overview](#migration-strategy-overview)
2. [WP-CLI Command Reference](#wp-cli-command-reference)
3. [Classic Editor → Block Editor Conversion](#classic-editor--block-editor-conversion)
4. [Shortcode → Block Conversion Patterns](#shortcode--block-conversion-patterns)
5. [Widget Areas → Template Parts](#widget-areas--template-parts)
6. [ACF / Custom Fields → Block Bindings](#acf--custom-fields--block-bindings)
7. [Custom Post Types in Block Themes](#custom-post-types-in-block-themes)
8. [Page Builder → FSE Migration](#page-builder--fse-migration)
9. [Database-Level Operations](#database-level-operations)
10. [Rollback and Safety](#rollback-and-safety)
11. [Migration Checklist](#migration-checklist)

---

## Migration Strategy Overview

### Three Migration Approaches

| Approach | When to use | Risk | Effort |
|----------|------------|------|--------|
| **In-place** — migrate content in the live database | Small sites (<50 posts), low traffic | High | Low |
| **Staged** — migrate on staging, push to production | Medium sites, any traffic | Medium | Medium |
| **Parallel** — run both themes simultaneously, migrate page by page | Large sites (500+ posts), high traffic | Low | High |

For most projects, use **Staged**. Always start there unless the user explicitly says "live site, small content set."

### Migration Phases

```
Phase 1: Audit   → Inventory all content, shortcodes, widgets, CPTs, fields
Phase 2: Theme   → Activate block theme (in staging) with classic content still working
Phase 3: Parts   → Replace widget areas with template parts
Phase 4: CPTs    → Add archive/single templates for each CPT
Phase 5: Fields  → Wire ACF/meta fields via Block Bindings
Phase 6: Posts   → Convert individual posts/pages to blocks (manual or batch)
Phase 7: Verify  → Visual regression, accessibility, performance
Phase 8: Go Live → Switch production to block theme
```

---

## WP-CLI Command Reference

All commands require WP-CLI 2.8+ and access to the WordPress root.

### Content Audit

```bash
# Count posts still in Classic Editor format (no block markup)
wp post list --post_type=post,page --posts_per_page=-1 --format=json | \
  php -r '$posts=json_decode(file_get_contents("php://stdin"),true); echo count(array_filter($posts, fn($p)=>!str_contains($p["post_content"],"<!-- wp:")));'

# List all shortcodes in use across the database
wp db query "SELECT DISTINCT SUBSTRING_INDEX(SUBSTRING_INDEX(post_content, '[', -1), ' ', 1) AS shortcode
FROM wp_posts WHERE post_content LIKE '%[%' AND post_status='publish'
ORDER BY shortcode;" --skip-column-names

# List all registered widget areas and their active widgets
wp sidebar list --fields=id,name,description --format=table

# List all active widgets in a sidebar
wp widget list {{sidebar-id}} --format=table

# List all CPTs (excluding built-ins)
wp post-type list --format=table --fields=name,label,public

# Count posts per CPT
wp post list --post_type={{cpt-slug}} --post_status=publish --format=count

# List all ACF field groups (requires ACF active)
wp post list --post_type=acf-field-group --format=table --fields=ID,post_title,post_status
```

### Content Transformation

```bash
# Dry-run search-replace (preview only — no changes)
wp search-replace '[old_shortcode]' '<!-- wp:my-theme/block /-->' --dry-run --all-tables --precise

# Run search-replace (ALWAYS back up first)
wp db export backup-pre-migration.sql && \
  wp search-replace '[old_shortcode]' '<!-- wp:my-theme/block /-->' --all-tables --precise

# Force-flush rewrite rules after adding CPT templates
wp rewrite flush --hard

# Regenerate block editor content for a single post
wp post update {{post_id}} --post_content="$(wp post get {{post_id}} --field=post_content)"

# Activate block theme without breaking classic editor access
wp theme activate {{theme-slug}}
wp plugin deactivate classic-editor  # Only after all content migrated
```

### Verification

```bash
# Check for PHP errors after theme switch
wp option get active_plugins && wp eval 'echo "WordPress OK\n";'

# Verify a specific post renders without errors
wp eval 'echo apply_filters("the_content", get_post({{post_id}})->post_content);' 2>&1 | head -50

# Count posts that still have shortcodes after migration
wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_content REGEXP '\[[a-z_]+[[:space:]\]]' AND post_status='publish';"
```

---

## Classic Editor → Block Editor Conversion

### How WordPress Handles Classic Content

When a Classic Editor post is opened in the Block Editor, WordPress automatically wraps content in a `<!-- wp:freeform -->` (Classic block). This preserves existing content but does not convert it to individual blocks.

To convert to proper blocks: open the post → click the three-dot menu on the Classic block → "Convert to Blocks". WordPress uses the `wp_parse_blocks()` heuristic, which works well for:
- Paragraphs and headings
- Lists
- Images (plain `<img>` tags)
- Blockquotes
- Tables

It works poorly for:
- Floated images (becomes Group + Image)
- Shortcodes (stays as Classic block unless shortcode is registered as a block)
- Complex nested HTML (becomes Custom HTML block)
- Page builder markup (stays as-is)

### Batch Conversion via REST API

For sites with many posts, trigger the block editor's "Convert to Blocks" programmatically:

```php
<?php
// Run via WP-CLI: wp eval-file convert-classic-to-blocks.php
// Converts plain HTML paragraphs to wp:paragraph blocks.

$posts = get_posts( array(
    'post_type'      => array( 'post', 'page' ),
    'posts_per_page' => -1,
    'post_status'    => 'publish',
) );

$converted = 0;
foreach ( $posts as $post ) {
    if ( has_blocks( $post->post_content ) ) {
        continue; // Already block content.
    }

    // Use WordPress's own block conversion.
    $blocks = parse_blocks( $post->post_content );
    if ( empty( $blocks ) ) {
        continue;
    }

    $new_content = serialize_blocks( $blocks );

    wp_update_post( array(
        'ID'           => $post->ID,
        'post_content' => $new_content,
    ) );

    $converted++;
    WP_CLI::log( "Converted post {$post->ID}: {$post->post_title}" );
}

WP_CLI::success( "Converted {$converted} posts." );
```

### HTML → Block Conversion Mapping

For manual rebuilds, use this mapping from `references/block-conversion-map.md`. Key patterns:

| Classic HTML | Block equivalent |
|-------------|-----------------|
| `<p>` | `<!-- wp:paragraph -->` |
| `<h1>`–`<h6>` | `<!-- wp:heading {"level":N} -->` |
| `<ul><li>` | `<!-- wp:list --> <!-- wp:list-item -->` |
| `<ol><li>` | `<!-- wp:list {"ordered":true} --> <!-- wp:list-item -->` |
| `<blockquote>` | `<!-- wp:quote -->` |
| `<hr>` | `<!-- wp:separator /-->` |
| `<img>` | `<!-- wp:image -->` |
| `<figure><img><figcaption>` | `<!-- wp:image -->` with `caption` attribute |
| `<table>` | `<!-- wp:table -->` |
| `<pre><code>` | `<!-- wp:code -->` |
| Two-column layout | `<!-- wp:columns --> <!-- wp:column -->` |
| Grid layout | `<!-- wp:group {"layout":{"type":"grid"}} -->` |

---

## Shortcode → Block Conversion Patterns

### Strategy by Shortcode Type

| Shortcode Type | Conversion approach |
|----------------|-------------------|
| Core WordPress shortcode (`[gallery]`, `[caption]`, `[audio]`, `[video]`, `[embed]`) | Replace with core blocks — WordPress does this automatically in block editor |
| Plugin block shortcode (Jetpack, Contact Form 7, Gravity Forms) | Plugin provides a block equivalent — insert the block, delete the shortcode |
| Custom display shortcode (hero, CTA, feature list) | Replace with a block pattern |
| Custom data shortcode (recent posts, custom query) | Replace with a dynamic block |
| Layout/structural shortcode (columns, rows) | Replace with `core/columns` or `core/group` with grid layout |

### Compatibility Shim Pattern

During a long migration where some posts still use shortcodes, keep a compatibility shim active. Remove it only after all posts are migrated:

```php
// inc/shortcode-compat.php — TEMPORARY. Remove after migration complete.
add_shortcode( 'cta_button', function( array $atts ): string {
    $atts = shortcode_atts( array(
        'text' => __( 'Click Here', 'my-theme' ),
        'url'  => '#',
        'style' => 'primary',
    ), $atts, 'cta_button' );

    return sprintf(
        '<!-- wp:buttons --><div class="wp-block-buttons"><!-- wp:button {"className":"is-style-%s"} --><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="%s">%s</a></div><!-- /wp:button --></div><!-- /wp:buttons -->',
        esc_attr( $atts['style'] ),
        esc_url( $atts['url'] ),
        esc_html( $atts['text'] )
    );
} );
```

### Common Plugin Shortcode → Block Map

| Plugin / Shortcode | Block replacement |
|--------------------|------------------|
| `[contact-form-7 id=""]` | CF7 block or Gravity Forms block |
| `[gravityforms id=""]` | `gravityforms/form` block |
| `[gallery ids=""]` | `core/gallery` |
| `[jetpack_subscription_form]` | `jetpack/subscriptions` |
| `[woocommerce_cart]` | `woocommerce/cart` |
| `[woocommerce_checkout]` | `woocommerce/checkout` |
| `[products limit="" columns=""]` | `woocommerce/product-collection` |
| `[yotpo_reviews_tab]` | Yotpo block (if available) or iframe embed |
| `[su_columns]` `[su_column]` | `core/columns` + `core/column` |
| `[vc_row]` `[vc_column]` (WPBakery) | Manual rebuild required |

---

## Widget Areas → Template Parts

### Removal from functions.php

Remove `register_sidebar()` calls and replace with a note:

```php
// REMOVED: Sidebar widget areas replaced by block template parts.
// @see parts/sidebar.html, parts/footer-widgets.html
```

Also remove `dynamic_sidebar()` calls from any classic template files if they exist in the old theme.

### Widget → Block Reference

Full mapping of all default WordPress widgets:

| Widget | Block markup |
|--------|-------------|
| Text | `<!-- wp:paragraph -->` or `<!-- wp:group -->` + `<!-- wp:heading -->` + `<!-- wp:paragraph -->` |
| Image | `<!-- wp:image -->` |
| Search | `<!-- wp:search /-->` |
| Recent Posts | `<!-- wp:latest-posts {"postsToShow":5} /-->` |
| Recent Comments | `<!-- wp:latest-comments {"commentsToShow":5} /-->` |
| Archives | `<!-- wp:archives /-->` |
| Categories | `<!-- wp:categories /-->` |
| Tag Cloud | `<!-- wp:tag-cloud /-->` |
| Navigation Menu | `<!-- wp:navigation /-->` |
| Custom HTML | `<!-- wp:html -->` |
| RSS | `<!-- wp:rss {"feedURL":"..."} /-->` |
| Calendar | `<!-- wp:calendar /-->` |
| Meta | No block equivalent — omit (login link, RSS, WordPress.org) |
| Audio | `<!-- wp:audio /-->` |
| Video | `<!-- wp:video /-->` |
| Media & Text | `<!-- wp:media-text /-->` |

### Footer Widget Grid Pattern

Common 3-column footer widget area → block template part:

```html
<!-- wp:group {"tagName":"div","className":"footer-widgets","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group footer-widgets">
    <!-- wp:columns {"isStackedOnMobile":true} -->
    <div class="wp-block-columns">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- Widget 1 content blocks here -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- Widget 2 content blocks here -->
        </div>
        <!-- /wp:column -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- Widget 3 content blocks here -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->
```

---

## ACF / Custom Fields → Block Bindings

### Block Bindings API Overview

Available since WordPress 6.5. Allows block attributes (content, url, alt, title) to be populated dynamically from PHP data sources.

**Bindable blocks and attributes:**

| Block | Bindable attributes |
|-------|-------------------|
| `core/paragraph` | `content` |
| `core/heading` | `content` |
| `core/image` | `url`, `alt`, `title` |
| `core/button` | `url`, `text`, `linkTarget`, `rel` |

### Built-in Sources

**`core/post-meta`** — reads registered post meta. No setup needed beyond `register_post_meta()`.

```html
<!-- wp:heading {
    "metadata": {
        "bindings": {
            "content": {
                "source": "core/post-meta",
                "args": { "key": "project_headline" }
            }
        }
    }
} -->
<h2></h2>
<!-- /wp:heading -->
```

**`core/post-terms`** — reads post taxonomy terms.

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": { "source": "core/post-terms", "args": { "taxonomy": "category" } }
        }
    }
} -->
<p></p>
<!-- /wp:paragraph -->
```

### ACF PRO 6.3+ Built-in Binding Source

ACF PRO 6.3+ registers `acf/field` as a native binding source:

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "acf/field",
                "args": { "key": "field_64abc12345" }
            }
        }
    }
} -->
<p></p>
<!-- /wp:paragraph -->
```

Use the ACF field key (starts with `field_`), not the field name, for reliable lookups.

### Post Meta Registration (required for `core/post-meta` binding)

```php
// In inc/post-meta.php
function {{theme_slug_underscored}}_register_post_meta(): void {
    $fields = array(
        array(
            'post_type' => '{{post_type}}',
            'meta_key'  => 'project_headline',
            'type'      => 'string',
        ),
        array(
            'post_type' => '{{post_type}}',
            'meta_key'  => 'project_url',
            'type'      => 'string',
        ),
    );

    foreach ( $fields as $field ) {
        register_post_meta(
            $field['post_type'],
            $field['meta_key'],
            array(
                'show_in_rest'  => true,
                'single'        => true,
                'type'          => $field['type'],
                'auth_callback' => function(): bool {
                    return current_user_can( 'edit_posts' );
                },
            )
        );
    }
}
add_action( 'init', '{{theme_slug_underscored}}_register_post_meta' );
```

### Image Field Binding Pattern

ACF image fields return an array. Bind URL and alt separately using a custom source:

```php
register_block_bindings_source(
    '{{theme-slug}}/acf-image',
    array(
        'label'              => __( 'ACF Image Field', '{{text-domain}}' ),
        'get_value_callback' => function( array $args, WP_Block $block ): ?string {
            if ( empty( $args['key'] ) || empty( $args['prop'] ) ) {
                return null;
            }
            $post_id = $block->context['postId'] ?? get_the_ID();
            $image   = function_exists( 'get_field' )
                ? get_field( $args['key'], $post_id )
                : null;

            if ( ! is_array( $image ) ) {
                return null;
            }

            return match ( $args['prop'] ) {
                'url'   => esc_url( $image['url'] ?? '' ),
                'alt'   => esc_attr( $image['alt'] ?? '' ),
                'title' => esc_attr( $image['title'] ?? '' ),
                default => null,
            };
        },
        'uses_context' => array( 'postId' ),
    )
);
```

Usage in a block:
```html
<!-- wp:image {
    "metadata": {
        "bindings": {
            "url": { "source": "my-theme/acf-image", "args": { "key": "hero_image", "prop": "url" } },
            "alt": { "source": "my-theme/acf-image", "args": { "key": "hero_image", "prop": "alt" } }
        }
    }
} -->
<figure class="wp-block-image"><img src="" alt=""/></figure>
<!-- /wp:image -->
```

---

## Custom Post Types in Block Themes

### Template Hierarchy

Block themes support the full WordPress template hierarchy via HTML files in `templates/`:

| Template file | Serves |
|--------------|--------|
| `templates/archive-{{cpt}}.html` | CPT archive (`/{{cpt-slug}}/`) |
| `templates/single-{{cpt}}.html` | CPT single post |
| `templates/taxonomy-{{tax}}.html` | Custom taxonomy archive |
| `templates/taxonomy-{{tax}}-{{term}}.html` | Specific term archive |

Register in `theme.json` so they appear in Site Editor:

```json
"customTemplates": [
    {
        "name": "archive-project",
        "title": "Projects Archive",
        "postTypes": ["project"]
    },
    {
        "name": "single-project",
        "title": "Project Single",
        "postTypes": ["project"]
    }
]
```

### CPT Registration (if not already registered by a plugin)

Register in `inc/post-types.php`:

```php
function {{theme_slug_underscored}}_register_post_types(): void {
    register_post_type(
        '{{cpt-slug}}',
        array(
            'labels'             => array(
                'name'               => _x( '{{CPT Plural}}', 'post type general name', '{{text-domain}}' ),
                'singular_name'      => _x( '{{CPT Singular}}', 'post type singular name', '{{text-domain}}' ),
                'add_new_item'       => __( 'Add New {{CPT Singular}}', '{{text-domain}}' ),
                'edit_item'          => __( 'Edit {{CPT Singular}}', '{{text-domain}}' ),
                'new_item'           => __( 'New {{CPT Singular}}', '{{text-domain}}' ),
                'view_item'          => __( 'View {{CPT Singular}}', '{{text-domain}}' ),
                'search_items'       => __( 'Search {{CPT Plural}}', '{{text-domain}}' ),
                'not_found'          => __( 'No {{cpt plural}} found', '{{text-domain}}' ),
                'not_found_in_trash' => __( 'No {{cpt plural}} found in trash', '{{text-domain}}' ),
            ),
            'public'             => true,
            'show_in_rest'       => true,
            'has_archive'        => true,
            'rewrite'            => array( 'slug' => '{{cpt-slug}}' ),
            'supports'           => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
            'menu_icon'          => 'dashicons-portfolio',
        )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_post_types' );
```

**Always set `show_in_rest: true`** — required for block editor support and Block Bindings.

---

## Page Builder → FSE Migration

### Elementor

Elementor stores its data in `_elementor_data` post meta (JSON). The post `post_content` contains an empty `[et_pb_section]`-like placeholder or nothing useful.

**Steps:**
1. Screenshot the Elementor layout
2. Rebuild in FSE as a template or block pattern
3. Clear Elementor data for that page: `wp post meta delete {{post_id}} _elementor_data`
4. Set the page to use the new FSE template

**Export Elementor template for reference:**
```bash
wp post meta get {{post_id}} _elementor_data | python3 -m json.tool > elementor-template.json
```

### Divi

Divi stores content as shortcodes directly in `post_content`. The shortcodes are deeply nested and not convertible programmatically.

```bash
# Extract Divi content for a page
wp post get {{post_id}} --field=post_content > divi-content.txt
```

Rebuild manually using the Divi output as a visual reference.

### Beaver Builder

Similar to Elementor — stores data in `_fl_builder_data` post meta.

```bash
wp post meta get {{post_id}} _fl_builder_data
```

Rebuild manually.

### Common Pattern for All Page Builders

1. Export a visual screenshot of each page builder page
2. Identify reusable sections → create block patterns
3. Rebuild unique layouts as FSE templates
4. Prioritise: home page → key landing pages → CPT templates → remaining pages

---

## Database-Level Operations

### Always Back Up First

```bash
# Full database export with timestamp
wp db export "backup-$(wp option get blogname | tr ' ' '-')-$(date +%Y%m%d-%H%M%S).sql"

# Verify backup is readable
wp db check
```

### Safe search-replace Pattern

```bash
# Step 1: Preview changes (no writes)
wp search-replace '{{old_string}}' '{{new_string}}' --dry-run --all-tables --precise --report-changed-only

# Step 2: Confirm output, then apply
wp search-replace '{{old_string}}' '{{new_string}}' --all-tables --precise

# Step 3: Flush cache
wp cache flush
wp rewrite flush --hard
```

### Remove Orphaned Page Builder Meta

After all pages are migrated off a page builder:

```bash
# Elementor
wp post meta delete $(wp post list --post_type=page --format=ids) _elementor_data _elementor_edit_mode _elementor_version

# Divi
wp post meta delete $(wp post list --post_type=page --format=ids) _et_pb_use_builder _et_pb_old_content
```

---

## Rollback and Safety

### Before Starting

```bash
# Full site snapshot: database + uploads
wp db export pre-migration.sql
wp eval 'echo ABSPATH;'  # Confirm WP root for file backup

# Verify staging URL matches production routes
wp option get siteurl
wp option get home
```

### If Migration Fails

```bash
# Restore database
wp db import pre-migration.sql

# Reactivate previous theme
wp theme activate {{previous-theme-slug}}

# Clear all caches
wp cache flush
wp rewrite flush --hard
```

### Testing Before Go-Live

```bash
# Visual regression: compare staging screenshots to production
# Use a tool like Percy, Playwright, or BackstopJS

# Accessibility: run axe on key pages
npx axe-cli https://staging.example.com

# Performance: Lighthouse CLI
npx lighthouse https://staging.example.com --output=json --output-path=./lighthouse.json
```

---

## Migration Checklist

### Pre-Migration

- [ ] Full database backup created and verified
- [ ] Staging environment set up and matches production content
- [ ] All content audited: posts by type, shortcodes in use, widget areas, CPTs, custom fields
- [ ] Migration map reviewed and approved
- [ ] Classic Editor plugin set to "allow switching" (not "classic editor for all users")

### During Migration

- [ ] Template parts created for each widget area
- [ ] CPT archive and single templates created and registered in theme.json
- [ ] Post meta registered with `show_in_rest: true` for all fields used in bindings
- [ ] Block Bindings sources registered and tested with one post before applying to all templates
- [ ] Shortcode compatibility shims added for any shortcodes still in posts
- [ ] WP-CLI search-replace run with `--dry-run` first, then applied
- [ ] Rewrite rules flushed after CPT template additions

### Post-Migration Verification

- [ ] All CPT archive pages load correctly (check `/{{cpt-slug}}/` URL)
- [ ] All CPT single pages load correctly
- [ ] Block Bindings display correct data for each post
- [ ] No PHP notices or errors in debug.log
- [ ] Shortcodes no longer appear as raw text on any page
- [ ] Widget area content appears in correct template parts
- [ ] Images have correct alt text (migrated from ACF or post meta)
- [ ] Navigation menus work correctly in the block theme
- [ ] Search results page renders correctly
- [ ] 404 page renders correctly
- [ ] WooCommerce pages (if applicable) render correctly
- [ ] Mobile layout verified on key pages
- [ ] Accessibility: keyboard navigation, skip link, ARIA attributes
- [ ] Performance: Lighthouse score comparable to or better than pre-migration
- [ ] Shortcode compat shims removed (or scheduled for removal after all posts migrated)
