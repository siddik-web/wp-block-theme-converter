# /wp-migrate

**Purpose:** Generate the code, queries, and patterns needed to migrate existing WordPress content — classic editor posts, widget areas, ACF fields, shortcodes, or Custom Post Types — into the new block theme structure.

## When to Use

Trigger this command when:
- The user has an existing WordPress site (not a static HTML project) they are upgrading to a block theme
- The user wants to convert Classic Editor content to block editor content
- The user has custom fields (ACF, CMB2, Meta Box) they want to surface via Block Bindings API
- The user has widget areas they want to replace with template parts
- The user has shortcodes they want to replace with blocks or patterns
- The user has a Custom Post Type they want to surface via Query Loop or a custom dynamic block

This command is NOT for converting static HTML → WordPress (use `/convert-to-wp-theme` for that).

## Workflow

### Step 1: Identify Migration Scope

Ask (or infer from context):

| Question | Why it matters |
|----------|---------------|
| WordPress version currently running | Determines available migration tools |
| Active page builder (Elementor, Divi, Beaver Builder, WPBakery, none) | Different conversion strategies per builder |
| Using Classic Editor or already using Gutenberg? | Classic content needs block conversion |
| Custom Post Types (CPTs) — list their slugs | Need Query Loop templates or custom blocks |
| Custom fields plugin (ACF, CMB2, Meta Box, Pods, none) | Determines Block Bindings approach |
| Widget areas — list names and their content | Become template parts in block theme |
| Shortcodes in use — list them | Need block or pattern equivalents |
| How many posts/pages need migration (estimate) | Batch vs programmatic migration |
| WooCommerce products? | WooCommerce-specific template migration |

### Step 2: Produce a Migration Map

Before writing any code, output a table mapping old content to its new block equivalent:

```
MIGRATION MAP
==============
| Old Element                        | New Block Equivalent                    | Migration Method      |
|------------------------------------|----------------------------------------|----------------------|
| Classic Editor post                | Block editor post (auto-convert)        | Content Transform API |
| [hero] shortcode                   | my-theme/hero pattern                   | Shortcode replacement |
| sidebar widget area                | parts/sidebar.html template part       | Template part         |
| footer widget area                 | parts/footer.html (already exists)     | Template part         |
| ACF field: `hero_headline`         | Block Binding → post meta              | Bindings API          |
| CPT: `project`                     | Query Loop + custom template part      | Template hierarchy    |
| Elementor template: Landing Page   | FSE page template                      | Manual rebuild        |
```

Show this map and get user confirmation before generating code.

### Step 3: Execute Migration by Category

Handle each category in order:

---

#### Category A: Classic Editor Content → Block Editor

WordPress's built-in parser handles most of this automatically. Provide:

**1. PHP script to audit content (run via WP-CLI or a one-off plugin):**

```php
<?php
// Identify posts still using classic editor content (no block markup).
// Run via: wp eval-file audit-classic-content.php

$posts = get_posts( array(
    'post_type'      => 'any',
    'posts_per_page' => -1,
    'post_status'    => array( 'publish', 'draft', 'private' ),
) );

$classic_posts = array();
foreach ( $posts as $post ) {
    if ( ! has_blocks( $post->post_content ) ) {
        $classic_posts[] = array(
            'ID'         => $post->ID,
            'post_type'  => $post->post_type,
            'post_title' => $post->post_title,
            'edit_url'   => get_edit_post_link( $post->ID ),
        );
    }
}

echo 'Classic Editor posts: ' . count( $classic_posts ) . PHP_EOL;
foreach ( $classic_posts as $p ) {
    echo sprintf( '[%d] %s (%s) — %s', $p['ID'], $p['post_title'], $p['post_type'], $p['edit_url'] ) . PHP_EOL;
}
```

**2. Bulk conversion note:**

WordPress automatically wraps Classic Editor paragraphs in `<!-- wp:paragraph -->` blocks when displayed in the block editor. For most text content this is sufficient. For complex layouts (tables, floated images, shortcodes), manual editing is needed.

---

#### Category B: Shortcodes → Blocks / Patterns

For each shortcode, provide:

1. The block or pattern equivalent
2. A PHP filter to render the block equivalent instead of the shortcode (for programmatic posts)
3. A WP-CLI command to find all posts using the shortcode

**Finding all shortcode usages:**
```bash
wp post list --post_type=post,page --format=ids | xargs -I{} wp post get {} --field=post_content | grep -c '\[{{shortcode_tag}}'
```

**Replacing shortcodes in existing content (WP-CLI batch):**
```bash
wp search-replace '[{{shortcode_tag}}]' '<!-- wp:my-theme/{{block-name}} /-->' --all-tables --precise
```

Use with caution — always back up before running.

> ⚠️ **Simple shortcodes only.** The above find-replace works only for shortcodes with no attributes (e.g., `[hero]`). Shortcodes with attributes — e.g., `[gallery id="5" size="medium"]` — cannot be safely replaced with a single string. Use WP-CLI to identify affected posts and handle them individually:
>
> ```bash
> # Find all posts containing the shortcode (with or without attributes)
> wp post list --post_type=post,page --format=ids \
>   | xargs -I{} wp post get {} --field=post_content \
>   | grep -l '\[{{shortcode_tag}}'
> ```
>
> For programmatic replacement of shortcodes with attributes, write a WP-CLI eval script:
>
> ```php
> // Replace [{{shortcode_tag}} id="X"] with the block equivalent. Run via: wp eval-file migrate-shortcode.php
> $posts = get_posts( array( 'post_type' => 'any', 'posts_per_page' => -1 ) );
> foreach ( $posts as $post ) {
>     if ( strpos( $post->post_content, '[{{shortcode_tag}}' ) === false ) continue;
>     $new_content = preg_replace_callback(
>         '/\[{{shortcode_tag}}([^\]]*)\]/',
>         function( $matches ) {
>             $atts = shortcode_parse_atts( $matches[1] );
>             $id   = isset( $atts['id'] ) ? (int) $atts['id'] : 0;
>             return '<!-- wp:my-theme/{{block-name}} {"id":' . $id . '} /-->';
>         },
>         $post->post_content
>     );
>     wp_update_post( array( 'ID' => $post->ID, 'post_content' => $new_content ) );
>     WP_CLI::success( "Updated post {$post->ID}" );
> }
> ```

**Pattern-based replacement for complex shortcodes:**
```php
// In inc/shortcode-migration.php — keep active only during migration period.
add_shortcode( '{{shortcode_tag}}', function( array $atts ): string {
    $atts = shortcode_atts( array(
        'title' => '',
    ), $atts, '{{shortcode_tag}}' );

    // Render the block pattern markup as a fallback while authors update posts.
    ob_start();
    ?>
    <!-- wp:my-theme/{{block-name}} {"title":"<?php echo esc_attr( $atts['title'] ); ?>"} /-->
    <?php
    return ob_get_clean();
} );
```

---

#### Category C: Widget Areas → Template Parts

For each widget area:

1. Identify what widgets are in it (ask user to list, or provide SQL to query)
2. Create the corresponding block template part in `parts/`
3. Remove the widget area registration from `functions.php`

**SQL to list active widgets:**
```sql
SELECT option_name, option_value
FROM wp_options
WHERE option_name LIKE 'widget_%'
   OR option_name = 'sidebars_widgets'
ORDER BY option_name;
```

**Widget → Block conversion map:**

| Classic Widget | Block Equivalent |
|----------------|-----------------|
| Text | `core/paragraph` or `core/group` |
| Image | `core/image` |
| Recent Posts | `core/latest-posts` |
| Categories | `core/categories` |
| Archives | `core/archives` |
| Search | `core/search` |
| Navigation Menu | `core/navigation` |
| HTML | `core/html` |
| RSS | `core/rss` |
| Social Links | `core/social-links` |
| WooCommerce Cart | `woocommerce/mini-cart` |
| Custom (plugin) | Equivalent plugin block or pattern |

**Template part output (example: sidebar):**
```
=== FILE: {{theme-slug}}/parts/sidebar.html ===
<!-- wp:group {"tagName":"aside","className":"site-sidebar","layout":{"type":"flex","orientation":"vertical"}} -->
<aside class="wp-block-group site-sidebar">
    <!-- wp:search {"label":"<?php esc_html_e( 'Search', 'my-theme' ); ?>","buttonText":"<?php esc_html_e( 'Search', 'my-theme' ); ?>"} /-->
    <!-- wp:latest-posts {"postsToShow":5} /-->
    <!-- wp:categories {"showPostCounts":true} /-->
</aside>
<!-- /wp:group -->
```

---

#### Category D: ACF / Custom Fields → Block Bindings API

For each custom field that should display dynamically in block patterns:

**1. Register the Block Bindings source in `inc/block-bindings.php`:**

```php
<?php
/**
 * Register custom Block Bindings sources.
 * Requires WordPress 6.5+.
 */
function {{theme_slug_underscored}}_register_block_bindings(): void {
    if ( ! function_exists( 'register_block_bindings_source' ) ) {
        return;
    }

    register_block_bindings_source(
        '{{theme-slug}}/acf',
        array(
            'label'              => __( 'ACF Fields', '{{text-domain}}' ),
            'get_value_callback' => '{{theme_slug_underscored}}_get_acf_binding_value',
            'uses_context'       => array( 'postId', 'postType' ),
        )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_block_bindings' );

function {{theme_slug_underscored}}_get_acf_binding_value( array $source_args, WP_Block $block_instance ): ?string {
    if ( ! isset( $source_args['key'] ) ) {
        return null;
    }

    $post_id = $block_instance->context['postId'] ?? get_the_ID();

    if ( function_exists( 'get_field' ) ) {
        // ACF.
        $value = get_field( $source_args['key'], $post_id );
    } else {
        // Post meta fallback.
        $value = get_post_meta( $post_id, $source_args['key'], true );
    }

    return $value ? esc_html( (string) $value ) : null;
}
```

**2. Use the binding in a block pattern:**

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "{{theme-slug}}/acf",
                "args": { "key": "hero_headline" }
            }
        }
    }
} -->
<p>Fallback text shown in editor</p>
<!-- /wp:paragraph -->
```

**Native post meta binding (no custom source needed, WP 6.5+):**

```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "core/post-meta",
                "args": { "key": "{{meta_key}}" }
            }
        }
    }
} -->
<p></p>
<!-- /wp:paragraph -->
```

Requirements for `core/post-meta` binding:
- Meta key must be registered with `register_post_meta()` and `show_in_rest: true`
- Only works inside Query Loop context or on single post/page templates

**Register post meta for bindings:**
```php
register_post_meta( '{{post_type}}', '{{meta_key}}', array(
    'show_in_rest'  => true,
    'single'        => true,
    'type'          => 'string',
    'auth_callback' => function(): bool {
        return current_user_can( 'edit_posts' );
    },
) );
```

---

#### Category E: Custom Post Types → Query Loop Templates

For each CPT, provide:

**1. Template hierarchy file** (`templates/archive-{{cpt-slug}}.html`):

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:query-title {"type":"archive"} /-->
    <!-- wp:query {
        "query": {
            "postType": "{{cpt-slug}}",
            "perPage": 12,
            "inherit": true
        },
        "layout": {"type":"default"}
    } -->
    <div class="wp-block-query">
        <!-- wp:post-template {"layout":{"type":"grid","columnCount":3}} -->
            <!-- wp:pattern {"slug":"{{theme-slug}}/{{cpt-slug}}-card"} /-->
        <!-- /wp:post-template -->
        <!-- wp:query-pagination -->
            <!-- wp:query-pagination-previous /-->
            <!-- wp:query-pagination-numbers /-->
            <!-- wp:query-pagination-next /-->
        <!-- /wp:query-pagination -->
    </div>
    <!-- /wp:query -->
</main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

**2. Single template** (`templates/single-{{cpt-slug}}.html`) — output similar to above with `core/post-title`, `core/post-content`, `core/post-featured-image`, and custom field bindings.

**3. Register the template in `theme.json`:**

```json
"customTemplates": [
    {
        "name": "archive-{{cpt-slug}}",
        "title": "{{CPT Label}} Archive",
        "postTypes": ["{{cpt-slug}}"]
    },
    {
        "name": "single-{{cpt-slug}}",
        "title": "{{CPT Label}} Single",
        "postTypes": ["{{cpt-slug}}"]
    }
]
```

---

#### Category F: Page Builder Content → FSE Templates

Page builder content (Elementor, Divi, etc.) cannot be auto-converted. Provide:

1. **Audit query** — identify all posts/pages built with the page builder
2. **Rebuild plan** — map each page builder template to an FSE template or pattern
3. **Priority order** — high-traffic pages first

**Find Elementor-built pages:**
```bash
wp post list --meta_key=_elementor_edit_mode --meta_value=builder --post_type=page --format=table
```

**Find Divi-built pages:**
```bash
wp post list --post_type=page --format=ids | xargs -I{} wp post meta get {} _et_pb_use_builder
```

For each page builder page, the migration path is:
1. Screenshot the page builder output
2. Rebuild as an FSE template or block pattern (use `/convert-to-wp-theme` for this)
3. Publish the FSE version and deactivate the page builder on that page

---

### Step 4: Output Delivery Order

1. `audit-classic-content.php` (WP-CLI script, if Classic Editor content exists)
2. `inc/block-bindings.php` (if ACF/custom fields exist)
3. `inc/shortcode-migration.php` (if shortcodes need compatibility shims)
4. Template part files (`parts/*.html`) — for each migrated widget area
5. Archive + single templates (`templates/archive-*.html`, `templates/single-*.html`) — for each CPT
6. Updated `theme.json` — `customTemplates` additions only
7. Updated `functions.php` additions — `require_once` for new `inc/` files

Use labeled file headers:
```
=== FILE: {{theme-slug}}/inc/block-bindings.php ===
```

### Step 5: Migration Safety Notes

Always include these warnings:

```
⚠️  BEFORE RUNNING ANY WP-CLI OR SQL MIGRATION:
1. Create a full database backup: wp db export backup-$(date +%Y%m%d).sql
2. Test on a staging environment first
3. Deactivate caching plugins during migration
4. Check WP_DEBUG is off on production before going live

⚠️  SHORTCODE REPLACEMENT:
- search-replace is irreversible without a backup
- Run with --dry-run first to preview changes
- Custom shortcodes from plugins need the plugin active to render; don't remove the plugin before verifying block replacement works

⚠️  ACF BLOCK BINDINGS:
- Block Bindings API requires WordPress 6.5+
- ACF bindings require ACF PRO 6.3+ OR the custom binding source registered above
- Test with a sample post before updating all templates
```

## Example Invocations

```
/wp-migrate
I have a WordPress site running Classic Editor with 200 posts.
I also have ACF fields: hero_headline, hero_subtext, and hero_image
on all "project" CPTs. My footer has 3 widget areas.
No page builder — I built templates in Classic Editor.
```

```
/wp-migrate
Moving from Elementor to block theme. I have 12 landing pages built
in Elementor and a "portfolio" CPT with fields: project_url, project_tags,
and client_name (all ACF). Need archive and single templates.
```

## Read Also

- `references/content-migration.md` — detailed classic-to-block conversion patterns, WP-CLI command reference, ACF Pro bindings setup
- `references/modern-blocks.md` — Block Bindings API in depth
- `commands/wp-block.md` — building custom dynamic blocks for CPT data display
- `references/woocommerce.md` — if WooCommerce products are being migrated
