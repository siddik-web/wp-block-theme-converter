# Page Builder Migration Reference

Comprehensive reference for migrating from popular page builders to native WordPress block themes. Read this when `/wp-migrate` is invoked for sites that use Elementor, Divi, WPBakery, or Beaver Builder.

---

## Table of Contents

1. [Overview](#overview)
2. [Elementor Migration](#1-elementor-migration)
3. [Divi Migration](#2-divi-migration)
4. [WPBakery Migration](#3-wpbakery-visual-composer-migration)
5. [Beaver Builder Migration](#4-beaver-builder-migration)
6. [Classic Gutenberg Migration](#5-classic-gutenberg-no-theme-builder-migration)
7. [General Migration Workflow](#6-general-migration-workflow-applies-to-all-builders)
8. [What Cannot Be Auto-Migrated](#7-what-cannot-be-auto-migrated-honest-boundaries)

---

## Overview

### Why Page-Builder Lock-In Is a Problem

Page builders are dominant: Elementor alone powers 10M+ active sites; Divi, WPBakery, and Beaver Builder add several million more. But they impose real costs that compound over time:

**Shortcode soup.** Divi and WPBakery store their layout data as shortcodes directly in `post_content`. A single page can contain hundreds of nested `[et_pb_section]`, `[vc_row]`, and `[vc_column]` tags. If the plugin is ever deactivated, raw shortcode text renders on the public page. Content is inseparable from presentation.

**Proprietary markup bleed.** Elementor writes its own CSS class names (`.elementor-section`, `.elementor-column`, `.e-con`) into the database alongside its JSON. These classes do nothing without the Elementor plugin active. Sites carry invisible plugin debt even on pages that look fine.

**Performance overhead.** Page builders load their own JS and CSS unconditionally, often 200–400 KB per page, regardless of which widgets are used on that specific page. Most builders are incompatible with modern bundling and code-splitting at the page level.

**Editor fragmentation.** Teams must maintain two parallel skill sets: the builder's drag-and-drop interface and the block editor. When Gutenberg updates its rendering, builder pages may visually regress.

**Upgrade coupling.** Every WordPress core update carries a risk of breaking builder compatibility. Every builder major version risks breaking your customizations. The risk compounds annually.

### The Honest "What Can't Be Auto-Migrated" List

Before starting any migration, document which elements will require human judgment and manual rebuilds:

| Category | Why it cannot be auto-migrated |
|----------|-------------------------------|
| Complex CSS animation sequences | Keyframe animations and builder-specific transition JS have no block equivalent; must be rebuilt with custom CSS or the Interactivity API |
| Heavily customized builder widgets with custom JS | Widget-specific JS is tightly coupled to builder DOM; must be ported to a standalone script |
| Elementor Loop Grid with custom skins | Skins reference Elementor's template system with PHP hooks; replace with Query Loop + custom block pattern |
| Divi module shortcodes with complex dynamic data | Dynamic content that calls Divi PHP APIs cannot be extracted without running Divi |
| Paid third-party add-on widgets | Commercial Elementor/Divi add-ons (OceanWP extras, JetElements, DiviBooster modules) have no block equivalent without the plugin active |
| Custom builder PHP modules | Modules that register custom Elementor/Divi widget classes require a rewrite as custom blocks |
| Builder-specific global section templates | Elementor Theme Builder headers/footers stored as posts of type `elementor_library`; must be rebuilt as FSE template parts |
| Countdown timers with builder-native countdown widgets | Require a JS rebuild; use the Interactivity API pattern or a standalone Alpine/vanilla JS approach |
| Popups and off-canvas drawers | Builder popups are stored separately and controlled by builder JS; rebuild with Interactivity API |

### Migration Philosophy

The correct mental model for page builder migration is: **extract content and design intent, not markup.**

You are not trying to convert builder HTML/JSON back into block markup automatically. You are:

1. Reading the builder data to understand the *content* (headings, body text, images, CTAs)
2. Reading the builder data to understand the *design intent* (section background, column widths, font size, color)
3. Rebuilding that intent in FSE using block patterns and theme.json tokens

Trying to auto-convert builder markup to blocks produces unmaintainable garbage. Rebuild the structure; migrate the content.

---

## 1. Elementor Migration

### What Elementor Produces (How Its Data Is Stored in the DB)

Elementor does not use `post_content` for layout. When a page is edited with Elementor, the layout JSON is stored in the `wp_postmeta` table under the key `_elementor_data`. The `post_content` field either contains an empty string, a legacy shortcode placeholder `[elementor-tag]`, or (with Elementor 3.x+) rendered HTML that Elementor regenerates on save — but this rendered HTML is controlled output, not editable content.

Additional meta keys Elementor writes per post:

| Meta key | Purpose |
|----------|---------|
| `_elementor_data` | Full layout JSON (the source of truth) |
| `_elementor_edit_mode` | `"builder"` when the page is controlled by Elementor |
| `_elementor_version` | Elementor version at last save |
| `_elementor_template_type` | `"page"`, `"section"`, `"popup"` etc. |
| `_elementor_page_settings` | Page-level settings (title color, page layout, background) |
| `_elementor_css` | Cached per-page CSS (regenerated automatically) |

The `_elementor_data` value is a JSON array of elements. Each element has a `elType` (`section`, `column`, `widget`), a `widgetType` (for widgets), `settings` (the configuration), and `elements` (children). A simplified structure:

```json
[
  {
    "id": "3a2b1c",
    "elType": "section",
    "settings": {
      "background_color": "#F8F8F8",
      "layout": "boxed"
    },
    "elements": [
      {
        "id": "4d5e6f",
        "elType": "column",
        "settings": { "_column_size": 50 },
        "elements": [
          {
            "id": "7g8h9i",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "Transform Your Outdoor Space",
              "header_size": "h1",
              "align": "left"
            }
          },
          {
            "id": "0j1k2l",
            "elType": "widget",
            "widgetType": "text-editor",
            "settings": {
              "editor": "<p>We design landscapes that last a lifetime.</p>"
            }
          }
        ]
      }
    ]
  }
]
```

Elementor 3.x+ introduced "Containers" (`e-con`) as a replacement for the Section/Column hierarchy. Containers use `elType: "container"` and may be nested. When inventorying, check both `"section"` and `"container"` as top-level element types.

### Inventory Step (WP-CLI)

```bash
# Count all posts/pages that have Elementor data
wp db query "SELECT COUNT(*) FROM wp_postmeta WHERE meta_key = '_elementor_data';"

# List all posts where Elementor is active (builder mode set)
wp db query "SELECT p.ID, p.post_title, p.post_type, p.post_status
FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm.meta_key = '_elementor_edit_mode'
  AND pm.meta_value = 'builder'
  AND p.post_status IN ('publish', 'draft')
ORDER BY p.post_type, p.post_title;" --skip-column-names

# Export the list to CSV for migration planning
wp db query "SELECT p.ID, p.post_title, p.post_type FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm.meta_key = '_elementor_edit_mode' AND pm.meta_value = 'builder'
AND p.post_status = 'publish';" --skip-column-names > elementor-pages.csv

# Check if Elementor Theme Builder header/footer templates exist
wp post list --post_type=elementor_library --format=table --fields=ID,post_title,post_status

# Inspect one page's Elementor data (pretty-print JSON)
wp post meta get <post_id> _elementor_data | python3 -m json.tool | head -100

# Save one page's full Elementor data for reference
wp post meta get <post_id> _elementor_data | python3 -m json.tool > elementor-page-<post_id>.json
```

### Elementor Element to Core Block Mapping

| Elementor element / widget | Core block equivalent | Notes |
|---------------------------|----------------------|-------|
| Section (`elType: "section"`) | `core/group` | Background, min-height, stretch via Cover when bg image present |
| Section with bg image/video | `core/cover` | |
| Column (`elType: "column"`) | `core/column` inside `core/columns` | |
| Container (`elType: "container"`, flex) | `core/group` with `"layout":{"type":"flex"}` | |
| Container (grid) | `core/group` with `"layout":{"type":"grid"}` | |
| Heading widget | `core/heading` | Map `header_size` to `level` |
| Text Editor widget | `core/paragraph` (or `core/freeform`) | Strip wrapper `<div>` |
| Image widget | `core/image` | Preserve alt text from settings |
| Button widget | `core/button` inside `core/buttons` | |
| Divider widget | `core/separator` | |
| Spacer widget | `core/spacer` | Map `space.size` to `height` |
| Icon Box widget | `core/group` + `core/html` (for SVG icon) + `core/heading` + `core/paragraph` | No native icon block; use custom pattern |
| Image Box widget | `core/media-text` | |
| Testimonial widget | Custom pattern (group + quote + image + cite) | |
| Accordion widget | `core/details` (WP 6.3+) | One `details` per accordion item |
| Tabs widget | Custom pattern with Interactivity API | See `references/interactivity-api-advanced.md` |
| Toggle widget | `core/details` | |
| Video widget | `core/video` or `core/embed` | YouTube/Vimeo → `core/embed` |
| Image Carousel widget | Pattern + Swiper enqueue | Manual — no native carousel block |
| Image Gallery widget | `core/gallery` | |
| Posts widget | `core/query` (Query Loop) | |
| Portfolio widget | `core/query` with custom post type | |
| Counter widget | `core/paragraph` + custom CSS animation | |
| Progress Bar widget | `core/html` with custom markup | No native equivalent |
| Countdown widget | Interactivity API pattern | See interactivity-api-advanced.md |
| Call to Action widget | Custom pattern (group + heading + paragraph + button) | |
| Icon List widget | `core/list` with icon via CSS `::before` | |
| Basic Gallery widget | `core/gallery` | |
| Google Maps widget | `core/html` with `<iframe>` embed | |
| SoundCloud / Video Playlist widget | `core/embed` | |
| Shortcode widget | Depends on shortcode — see `content-migration.md` | |
| HTML widget | `core/html` | |
| Menu Anchor widget | `core/html` with `<span id="...">` | |
| Search widget | `core/search` | |
| Sidebar widget | Remove — replace with template part | |
| Table of Contents widget | Use a plugin (LuckyWP TOC) or custom block | |
| Form widget (Elementor Pro) | Replace with Contact Form 7 / Gravity Forms block | |
| Popup widget (Elementor Pro) | Interactivity API modal pattern | Full manual rebuild required |
| Loop Grid (Elementor Pro) | `core/query` + custom template | Custom skin must be rebuilt as block pattern |
| WooCommerce widgets (Elementor Pro) | WooCommerce block equivalents | |

### Extracting Content via WP-CLI

```bash
# Get the full _elementor_data JSON for a specific post
wp post meta get <post_id> _elementor_data

# Parse widget content using jq (extract all heading and text-editor widget text)
wp post meta get <post_id> _elementor_data | \
  jq '[.. | objects | select(.widgetType == "heading" or .widgetType == "text-editor") | {type: .widgetType, content: (.settings.title // .settings.editor)}]'

# Extract all button links and text
wp post meta get <post_id> _elementor_data | \
  jq '[.. | objects | select(.widgetType == "button") | {text: .settings.text, url: .settings.link.url}]'

# Extract all image URLs and alt text
wp post meta get <post_id> _elementor_data | \
  jq '[.. | objects | select(.widgetType == "image") | {url: .settings.image.url, alt: .settings.image.alt}]'

# Export widget inventory for all Elementor pages (requires jq)
for id in $(wp db query "SELECT p.ID FROM wp_posts p INNER JOIN wp_postmeta pm ON p.ID = pm.post_id WHERE pm.meta_key = '_elementor_edit_mode' AND pm.meta_value = 'builder' AND p.post_status = 'publish';" --skip-column-names); do
  echo "=== Post ID: $id ===" >> elementor-content-audit.txt
  wp post meta get $id _elementor_data | jq '[.. | objects | select(.elType == "widget") | {widget: .widgetType, id: .id}]' >> elementor-content-audit.txt 2>/dev/null
done
```

### Step-by-Step Migration Workflow (7 Steps)

**Step 1 — Screenshot every Elementor page**

Before touching anything, capture visual references. Use browser full-page screenshots or a tool like `puppeteer-capture`. These are your ground truth during QA.

```bash
# Using WP-CLI to get a list of all Elementor page URLs
wp post list --post_type=page --post_status=publish --format=json | \
  python3 -c "import json,sys; [print(p['guid']) for p in json.load(sys.stdin)]"
```

**Step 2 — Export Elementor data for all affected posts**

```bash
mkdir elementor-exports
for id in $(wp db query "SELECT p.ID FROM wp_posts p INNER JOIN wp_postmeta pm ON p.ID = pm.post_id WHERE pm.meta_key = '_elementor_edit_mode' AND pm.meta_value = 'builder' AND p.post_status = 'publish';" --skip-column-names); do
  wp post meta get $id _elementor_data | python3 -m json.tool > elementor-exports/post-${id}.json
done
```

**Step 3 — Identify reusable sections and create a pattern inventory**

Review the exports. Sections that appear on multiple pages (hero, CTA, testimonials, services grid) become block patterns. Unique layouts become FSE templates.

**Step 4 — Build the FSE theme on staging**

Install and activate the new block theme on a staging environment. Do not touch production yet. Create `patterns/`, `templates/`, and `parts/` directories.

**Step 5 — Rebuild template parts first (header, footer)**

Elementor Theme Builder headers/footers are stored as `elementor_library` posts. Rebuild these as `parts/header.html` and `parts/footer.html`. Export their Elementor data the same way as regular pages:

```bash
wp post list --post_type=elementor_library --format=table --fields=ID,post_title
wp post meta get <header_library_id> _elementor_data | python3 -m json.tool > header-elementor.json
```

**Step 6 — Migrate pages from high-traffic to low-traffic**

For each page, in order of business importance:
1. Open `elementor-exports/post-<id>.json`
2. Map each widget to its core block equivalent (see table above)
3. Extract content from settings fields
4. Write the block markup in the FSE template or pattern
5. Remove the Elementor meta and set the page content to the new block markup

```bash
# After rebuilding a page, clear Elementor's data and regenerate
wp post meta delete <post_id> _elementor_data
wp post meta update <post_id> _elementor_edit_mode "inactive"
wp post update <post_id> --post_content='<!-- wp:pattern {"slug":"mytheme/my-rebuilt-pattern"} /-->'
```

**Step 7 — Clean orphaned Elementor meta and CSS**

After all pages are migrated:

```bash
# Remove all Elementor meta from migrated posts (run per post or in batch)
wp post meta delete $(wp post list --post_type=post,page --format=ids) \
  _elementor_data _elementor_edit_mode _elementor_version _elementor_css _elementor_page_settings

# Delete orphaned Elementor library templates
wp post delete $(wp post list --post_type=elementor_library --format=ids) --force

# Flush CSS cache
wp cache flush
wp eval 'delete_option("elementor_css_print_method");'
```

### Known Elementor CSS Issues

Elementor injects class names into the database content and generates per-element CSS tied to those classes. After migration, two problems arise:

**Problem 1: `.elementor-section` and `.e-con` classes in rendered HTML**

If Elementor is still active, WordPress may still render Elementor's output for any post where `_elementor_edit_mode` is still `"builder"`. Deactivating Elementor before clearing this meta causes raw JSON or empty pages. The correct order is:

1. Clear `_elementor_data` and `_elementor_edit_mode` for a post
2. Verify the FSE template renders correctly for that post
3. Repeat for all posts
4. Only then deactivate the Elementor plugin

**Problem 2: Elementor global CSS in the `<head>`**

Elementor adds a global stylesheet generated from its options. After deactivating the plugin, this stops loading. But if any post content still references Elementor class names (e.g., from a copied HTML block), they will be unstyled. Audit for stray Elementor classes:

```bash
# Search post_content for leftover Elementor class names
wp db query "SELECT ID, post_title FROM wp_posts
WHERE post_content LIKE '%elementor-section%'
   OR post_content LIKE '%elementor-widget%'
   OR post_content LIKE '% e-con%'
AND post_status = 'publish';"

# Clean a specific post's content of Elementor wrapper divs
# (Only do this if the post was converted to blocks — do not strip builder data mid-migration)
wp post get <post_id> --field=post_content | \
  sed 's/<div class="elementor[^"]*">//g' | sed 's/<\/div>//g'
# NOTE: The sed approach is fragile. Prefer rebuilding the post from scratch.
```

**Problem 3: Inline styles from `_elementor_css` cached in postmeta**

The `_elementor_css` meta key stores per-page compiled CSS. This is regenerated automatically by Elementor but is not needed after migration. Delete it:

```bash
wp db query "DELETE FROM wp_postmeta WHERE meta_key = '_elementor_css';"
```

### Elementor Pro Widgets with No Core Block Equivalent

These widgets require either a plugin swap, a custom block, or manual rebuild:

| Elementor Pro widget | Recommended alternative |
|---------------------|------------------------|
| Form | Contact Form 7 block, Gravity Forms block, or WPForms block |
| Popup | Interactivity API modal pattern; see `references/interactivity-api-advanced.md` |
| Loop Grid with custom skin | `core/query` + custom block pattern for the loop template |
| Nav Menu (Theme Builder) | `core/navigation` in `parts/header.html` |
| Site Logo | `core/site-logo` |
| Site Title | `core/site-title` |
| Page Title | `core/post-title` |
| Post Content | `core/post-content` |
| Post Featured Image | `core/post-featured-image` |
| Theme Builder Archive Title | `core/query-title` |
| Posts Pagination | `core/query-pagination` |
| Search Form | `core/search` |
| Breadcrumbs | Use Yoast breadcrumbs block or Rank Math breadcrumbs block |
| WooCommerce Product Price | `woocommerce/product-price` |
| WooCommerce Add to Cart | `woocommerce/add-to-cart` |
| Dynamic Tags (custom field display) | Block Bindings API; see `references/content-migration.md` |
| Slides (full-screen slider) | Manual rebuild — no core equivalent; use Swiper.js pattern |
| Flip Box | Custom CSS + `core/group` with hover transition |
| Hotspot | Custom block or `core/html` with positioning CSS |
| Call to Action Pro | Custom block pattern |
| Price Table | Custom block pattern |
| Price List | `core/list` + custom CSS, or custom block pattern |
| Table | `core/table` for simple tables; TablePress plugin for complex |
| Lottie | `core/html` with Lottie Player script |
| Reviews (Elementor Pro) | `core/comments` or Yotpo/TrustPilot widget |

---

## 2. Divi Migration

### How Divi Stores Content

Unlike Elementor, Divi stores its layout data directly in `post_content` as shortcodes. This means the shortcodes are always visible to WordPress — they render as nothing (empty content) without Divi active, but the data is there and extractable without any custom queries.

A typical Divi page's `post_content` looks like:

```
[et_pb_section fb_built="1" _builder_version="4.24.0" background_color="#FFFFFF"]
[et_pb_row _builder_version="4.24.0" column_structure="1_2,1_2"]
[et_pb_column type="1_2" _builder_version="4.24.0"]
[et_pb_text _builder_version="4.24.0" text_font="||||||||"]
<h1>Transform Your Outdoor Space</h1>
<p>We design landscapes that last a lifetime.</p>
[/et_pb_text]
[/et_pb_column]
[et_pb_column type="1_2" _builder_version="4.24.0"]
[et_pb_image src="https://example.com/wp-content/uploads/hero.jpg" _builder_version="4.24.0"]
[/et_pb_image]
[/et_pb_column]
[/et_pb_row]
[/et_pb_section]
```

Divi Themer (the theme builder equivalent) creates `et_theme_layout` posts that control headers, footers, and archive templates. These are separate from page content and must be inventoried separately.

### WP-CLI Inventory Command

```bash
# Count posts that use Divi shortcodes
wp db query "SELECT COUNT(*) FROM wp_posts
WHERE post_content LIKE '%[et_pb_%'
  AND post_status IN ('publish', 'draft');"

# List all posts/pages with Divi content
wp db query "SELECT ID, post_title, post_type, post_status
FROM wp_posts
WHERE post_content LIKE '%[et_pb_%'
  AND post_status = 'publish'
ORDER BY post_type, post_title;"

# List Divi Theme Builder layouts
wp post list --post_type=et_theme_layout --format=table --fields=ID,post_title,post_status

# Get raw content for a Divi page
wp post get <post_id> --field=post_content > divi-page-<post_id>.txt

# Extract all text content from a Divi page (strips shortcodes, keeps inner content)
wp post get <post_id> --field=post_content | \
  sed 's/\[et_pb_[^]]*\]//g' | sed 's/\[\/et_pb_[^]]*\]//g' | sed '/^$/d'
```

### Divi Module to Core Block Mapping

| Divi module | Core block equivalent |
|------------|----------------------|
| `[et_pb_section]` | `core/group` or `core/cover` (when has bg image) |
| `[et_pb_row]` | `core/columns` wrapper |
| `[et_pb_column]` | `core/column` |
| `[et_pb_text]` | `core/paragraph` or `core/heading` (based on inner HTML) |
| `[et_pb_image]` | `core/image` |
| `[et_pb_button]` | `core/button` inside `core/buttons` |
| `[et_pb_gallery]` | `core/gallery` |
| `[et_pb_video]` | `core/video` or `core/embed` |
| `[et_pb_blurb]` | `core/group` + `core/image` + `core/heading` + `core/paragraph` |
| `[et_pb_testimonial]` | Custom testimonial pattern |
| `[et_pb_accordion]` | `core/details` (one per item) |
| `[et_pb_tab]` / `[et_pb_tabs]` | Interactivity API tabs pattern |
| `[et_pb_slider]` / `[et_pb_slide]` | Swiper.js carousel pattern |
| `[et_pb_fullwidth_slider]` | `core/cover` for static; Swiper for animated |
| `[et_pb_contact_form]` | Contact Form 7 or Gravity Forms block |
| `[et_pb_code]` | `core/html` |
| `[et_pb_search]` | `core/search` |
| `[et_pb_sidebar]` | Remove — replace with template part |
| `[et_pb_blog]` | `core/query` (Query Loop) |
| `[et_pb_portfolio]` | `core/query` with CPT |
| `[et_pb_shop]` | `woocommerce/product-collection` |
| `[et_pb_wc_cart_notice]` | `woocommerce/cart` |
| `[et_pb_number_counter]` | `core/paragraph` + CSS counter animation |
| `[et_pb_countdown_timer]` | Interactivity API countdown pattern |
| `[et_pb_social_media_follow]` | Custom pattern with `core/buttons` |
| `[et_pb_divider]` | `core/separator` |
| `[et_pb_space]` | `core/spacer` |
| `[et_pb_pricing_tables]` | Custom pricing pattern |
| `[et_pb_team_members]` | Custom team grid pattern |
| `[et_pb_fullwidth_code]` | `core/html` |
| `[et_pb_post_title]` | `core/post-title` |

### The Divi Shortcode Extraction Approach

Since Divi content lives in `post_content`, PHP's `do_shortcode()` and regex can extract content without the Divi plugin active. Use this WP-CLI eval script:

```php
<?php
// Run via: wp eval-file divi-extract-content.php
// Extracts text and image content from Divi shortcodes for migration reference.

$posts = get_posts( array(
    'post_type'      => array( 'post', 'page' ),
    'posts_per_page' => -1,
    'post_status'    => 'publish',
    's'              => '',
) );

$output = array();

foreach ( $posts as $post ) {
    if ( ! str_contains( $post->post_content, '[et_pb_' ) ) {
        continue;
    }

    // Extract all text content from et_pb_text modules.
    preg_match_all( '/\[et_pb_text[^\]]*\](.*?)\[\/et_pb_text\]/s', $post->post_content, $text_matches );

    // Extract all image src attributes.
    preg_match_all( '/\[et_pb_image\s+src="([^"]+)"/', $post->post_content, $img_matches );

    // Extract all button text and URLs.
    preg_match_all( '/\[et_pb_button\s+button_url="([^"]+)"\s+button_text="([^"]+)"/', $post->post_content, $btn_matches );

    $output[ $post->ID ] = array(
        'title'   => $post->post_title,
        'texts'   => $text_matches[1],
        'images'  => $img_matches[1],
        'buttons' => array_map( null, $btn_matches[1], $btn_matches[2] ),
    );

    WP_CLI::log( "Extracted post {$post->ID}: {$post->post_title}" );
}

file_put_contents( 'divi-content-export.json', json_encode( $output, JSON_PRETTY_PRINT ) );
WP_CLI::success( 'Content exported to divi-content-export.json' );
```

```bash
wp eval-file divi-extract-content.php
```

### Divi Builder Layouts vs. Divi Theme Builder Templates

These are two distinct systems:

**Divi Builder layouts** are the shortcode content in regular `post_content` fields. These are what appear when you query `wp_posts` for pages with `[et_pb_section]` content.

**Divi Theme Builder templates** are posts of type `et_theme_layout`. They control the global header, footer, and can override templates for specific pages, CPTs, or taxonomies. To inventory them:

```bash
# List all Divi Theme Builder templates
wp post list --post_type=et_theme_layout --format=json --fields=ID,post_title,post_status

# Export a Theme Builder header template
wp post get <header_layout_id> --field=post_content > divi-header-template.txt
```

Rebuild Divi Theme Builder headers and footers as FSE template parts (`parts/header.html`, `parts/footer.html`). Rebuild Divi archive/single templates as FSE templates (`templates/archive-<cpt>.html`).

### Known Divi Gotchas

**Divi injects global CSS in the options table.** Divi writes large CSS blobs to `wp_options` under keys like `et_divi` and `et_options`. After migration, deactivating Divi removes these from rendering, but the data persists. Clean up:

```bash
# Preview what Divi has stored (do not delete until migration is complete)
wp option get et_divi | python3 -m json.tool | head -50

# After full migration and verification, remove Divi options
wp option delete et_divi et_options et_pb_recent_fonts et_automatic_updates_options
```

**Divi custom fonts.** If the client uses fonts loaded via the Divi font manager, those fonts are served through Divi's font system. After migration, add the same fonts to `theme.json` `fontFamilies` with either a Google Fonts embed or self-hosted woff2 files.

**Divi global colors.** Divi has a global color palette stored in its options. Extract the hex values and add them to `theme.json` `settings.color.palette`. Run:

```bash
wp option get et_divi | python3 -c "
import json, sys
data = json.load(sys.stdin)
colors = data.get('global_colors', {})
for slug, val in colors.items():
    print(f'{slug}: {val}')
"
```

**Divi shortcodes in excerpts.** Divi sometimes saves shortcodes to `post_excerpt` too. Clean these after migration:

```bash
# Find posts with Divi shortcodes in the excerpt
wp db query "SELECT ID, post_title FROM wp_posts
WHERE post_excerpt LIKE '%[et_pb_%' AND post_status = 'publish';"

# Clear excerpt for a specific post
wp post update <post_id> --post_excerpt=""
```

---

## 3. WPBakery (Visual Composer) Migration

### How WPBakery Stores Content

Like Divi, WPBakery stores layout data as shortcodes directly in `post_content`. WPBakery shortcodes use the `vc_` prefix:

```
[vc_row][vc_column width="1/2"]
[vc_column_text]
<h2>Our Services</h2>
<p>Professional landscaping for residential and commercial properties.</p>
[/vc_column_text]
[/vc_column][vc_column width="1/2"]
[vc_single_image image="42" img_size="full" alignment="center"]
[/vc_column][/vc_row]
```

WPBakery also has a "Classic mode" that interleaves shortcodes with raw HTML, and a "Backend Editor" mode that renders the same shortcodes differently in wp-admin. The `post_content` is the canonical data source in both cases.

### WPBakery Inventory Commands

```bash
# Count posts with WPBakery content
wp db query "SELECT COUNT(*) FROM wp_posts
WHERE post_content LIKE '%[vc_row%'
  AND post_status = 'publish';"

# List all posts using WPBakery
wp db query "SELECT ID, post_title, post_type
FROM wp_posts
WHERE post_content LIKE '%[vc_row%'
  AND post_status = 'publish'
ORDER BY post_type, post_title;"

# Check for WPBakery global templates (Saved Elements)
wp post list --post_type=vc_element --format=table --fields=ID,post_title

# Extract text from WPBakery column text modules for one post
wp post get <post_id> --field=post_content | \
  grep -oP '(?<=\[vc_column_text\]).*?(?=\[/vc_column_text\])' | head -20
```

### WPBakery to Core Block Mapping

| WPBakery shortcode | Core block equivalent |
|-------------------|----------------------|
| `[vc_row]` | `core/group` or container in `core/columns` |
| `[vc_column]` | `core/column` |
| `[vc_column_text]` | `core/paragraph`, `core/heading`, `core/list` (based on inner HTML) |
| `[vc_btn]` | `core/button` inside `core/buttons` |
| `[vc_single_image]` | `core/image` |
| `[vc_gallery]` | `core/gallery` |
| `[vc_separator]` | `core/separator` |
| `[vc_empty_space]` | `core/spacer` |
| `[vc_raw_html]` | `core/html` |
| `[vc_raw_js]` | `core/html` (with `<script>`) — review for security |
| `[vc_video]` | `core/embed` |
| `[vc_accordion]` / `[vc_accordion_tab]` | `core/details` (one per tab) |
| `[vc_tabs]` / `[vc_tab]` | Interactivity API tabs pattern |
| `[vc_row_inner]` / `[vc_column_inner]` | Nested `core/columns` + `core/column` |
| `[vc_wp_posts]` | `core/query` |
| `[vc_wp_search]` | `core/search` |
| `[vc_wp_text]` | `core/paragraph` |
| `[vc_wp_images]` | `core/gallery` |
| `[vc_wp_tagcloud]` | `core/tag-cloud` |
| `[vc_wp_categories]` | `core/categories` |
| `[vc_wp_archives]` | `core/archives` |
| `[vc_text_separator]` | `core/separator` with custom label (custom CSS needed) |
| `[vc_cta]` | Custom CTA pattern |
| `[vc_icon]` | `core/html` with SVG or Dashicon |
| `[vc_progress_bar]` | `core/html` with custom markup |
| `[vc_pie]` | `core/html` with canvas or SVG |

### The `content_blocks_shortcode_render` Filter Approach

WPBakery registers a filter `content_blocks_shortcode_render` that allows shortcode output to be intercepted. While Divi and WPBakery share the same "shortcodes in post_content" approach, WPBakery's filter makes it possible to extract rendered output programmatically while the plugin is still active. This is useful for capturing final rendered HTML of complex WPBakery widgets as a reference before rebuilding:

```php
<?php
// Run via: wp eval-file wpbakery-render-pages.php
// Renders WPBakery shortcode content for a post while the plugin is active.
// Use the output as a visual/markup reference for rebuilding in FSE.

$post_id = (int) $GLOBALS['argv'][1] ?? 0;
if ( ! $post_id ) {
    WP_CLI::error( 'Usage: wp eval-file wpbakery-render-pages.php -- <post_id>' );
}

$post = get_post( $post_id );
if ( ! $post ) {
    WP_CLI::error( "Post {$post_id} not found." );
}

// Force WPBakery to render the shortcodes.
$rendered = apply_filters( 'the_content', $post->post_content );

file_put_contents( "wpbakery-rendered-{$post_id}.html", $rendered );
WP_CLI::success( "Rendered HTML saved to wpbakery-rendered-{$post_id}.html" );
```

```bash
wp eval-file wpbakery-render-pages.php -- <post_id>
```

### Classic Editor Shortcode Soup Cleaning

After migration, posts may still contain WPBakery shortcodes if they were not fully rebuilt. Perform a database cleanup pass:

```bash
# Preview: count posts that still have vc_ shortcodes
wp db query "SELECT COUNT(*) FROM wp_posts
WHERE post_content REGEXP '\[vc_[a-z_]+' AND post_status = 'publish';"

# After all pages are migrated, clean the post_content of any stragglers
# ALWAYS back up first and run --dry-run preview
wp db export "backup-pre-wpbakery-cleanup-$(date +%Y%m%d).sql"

# Remove all vc_ shortcode wrappers (preserves inner content)
# NOTE: This regex approach is safe for simple wrappers but review manually first
wp db query "UPDATE wp_posts
SET post_content = REGEXP_REPLACE(
  post_content,
  '\\\\[/?vc_[a-z_]+[^\\\\]]*\\\\]',
  ''
)
WHERE post_content LIKE '%[vc_%' AND post_status = 'publish';"

wp cache flush
wp rewrite flush --hard
```

---

## 4. Beaver Builder Migration

### How Beaver Builder Stores Content

Beaver Builder uses the same pattern as Elementor: layout data in `wp_postmeta`, not in `post_content`. The primary meta key is `_fl_builder_data`. When a page is published, Beaver Builder also caches the rendered HTML in `_fl_builder_data_preview`. The `post_content` field contains Beaver Builder's rendered output as plain HTML — this is not the source of truth but can be useful as a reference.

| Meta key | Purpose |
|----------|---------|
| `_fl_builder_data` | Full layout as serialized PHP objects (not JSON) |
| `_fl_builder_data_preview` | Rendered HTML cache from last publish |
| `_fl_builder_enabled` | `"1"` when page is controlled by BB |
| `_fl_builder_version` | BB version at last save |

Note: `_fl_builder_data` is stored as PHP-serialized data, not JSON. Use PHP to unserialize it:

```bash
# Export Beaver Builder data as JSON via WP-CLI PHP eval
wp eval '
$data = get_post_meta(<post_id>, "_fl_builder_data", true);
echo json_encode($data, JSON_PRETTY_PRINT);
' > bb-page-<post_id>.json

# List all posts where Beaver Builder is enabled
wp db query "SELECT p.ID, p.post_title, p.post_type
FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm.meta_key = '_fl_builder_enabled' AND pm.meta_value = '1'
AND p.post_status = 'publish'
ORDER BY p.post_type, p.post_title;"

# Use the rendered HTML preview as a visual reference
wp post meta get <post_id> _fl_builder_data_preview > bb-preview-<post_id>.html
```

### Beaver Builder Module to Core Block Mapping

| BB module | Core block equivalent |
|-----------|----------------------|
| `row` | `core/group` or `core/columns` |
| `column` | `core/column` |
| `heading` | `core/heading` |
| `rich-text` | `core/paragraph` |
| `photo` | `core/image` |
| `video` | `core/video` or `core/embed` |
| `button` | `core/button` |
| `icon` | `core/html` with SVG |
| `icon-group` | `core/group` + multiple `core/html` icons |
| `html` | `core/html` |
| `separator` | `core/separator` |
| `spacer` | `core/spacer` |
| `callout` | Custom CTA pattern |
| `cta` | Custom CTA pattern |
| `accordion` | `core/details` (one per item) |
| `tabs` | Interactivity API tabs pattern |
| `slideshow` | Swiper.js carousel pattern |
| `gallery` | `core/gallery` |
| `posts` | `core/query` |
| `search` | `core/search` |
| `subscribe-form` | Mailchimp block or custom form |
| `contact-form` | Contact Form 7 or Gravity Forms block |
| `map` | `core/html` with Google Maps iframe |
| `testimonials` | Custom testimonial pattern |
| `countdown` | Interactivity API countdown pattern |
| `number-counter` | Custom animation pattern |
| `pricing-table` | Custom pricing pattern |
| `social-buttons` | Custom `core/buttons` pattern |
| `menu` | `core/navigation` |
| `sidebar` | Remove — replace with template part |
| `woo-products` (BB Themer) | `woocommerce/product-collection` |
| `woo-cart` (BB Themer) | `woocommerce/cart` |

### Beaver Builder Themer vs Block Theme Template Hierarchy

Beaver Builder Themer (the premium add-on) creates `fl-theme-layout` posts that map to WordPress template hierarchy hooks (header, footer, archive header, singular). These serve the same purpose as FSE template parts and templates.

The mapping from BB Themer hooks to FSE equivalents:

| BB Themer hook | FSE equivalent |
|---------------|---------------|
| `header` | `parts/header.html` |
| `footer` | `parts/footer.html` |
| `after_header` | Custom template part, included in base template |
| `before_footer` | Custom template part |
| Archive page (all archives) | `templates/archive.html` |
| Archive page (specific CPT) | `templates/archive-<cpt>.html` |
| Single post page | `templates/single.html` |
| Single CPT | `templates/single-<cpt>.html` |
| 404 page | `templates/404.html` |
| Search results | `templates/search.html` |

```bash
# List all BB Themer layouts
wp post list --post_type=fl-theme-layout --format=table --fields=ID,post_title,post_status

# Export a BB Themer layout for reference
wp eval '
$data = get_post_meta(<layout_id>, "_fl_builder_data", true);
echo json_encode($data, JSON_PRETTY_PRINT);
' > bb-themer-layout-<layout_id>.json
```

---

## 5. Classic Gutenberg (No Theme Builder) Migration

### Already-Block Content Migration

Sites that were built with the block editor (Gutenberg) but using a classic theme (e.g., Twenty Twenty-One) require the least structural migration. The `post_content` already contains valid block markup — the migration is primarily about activating a block theme and verifying visual compatibility.

```bash
# Verify posts are already in block format
wp db query "SELECT COUNT(*) FROM wp_posts
WHERE post_content LIKE '%<!-- wp:%'
  AND post_status = 'publish';"

# Find any Classic Editor posts that slipped through
wp db query "SELECT ID, post_title FROM wp_posts
WHERE post_content NOT LIKE '%<!-- wp:%'
  AND post_content != ''
  AND post_status = 'publish'
  AND post_type IN ('post', 'page');"
```

For any remaining Classic Editor posts, use the block editor's "Convert to Blocks" action in wp-admin, or run the batch conversion script from `references/content-migration.md`.

The main migration tasks for this scenario are:

1. **Build the FSE theme** that matches the visual design of the old classic theme
2. **Migrate widget areas** to template parts (see `content-migration.md` for the widget → block map)
3. **Migrate nav menus** — classic theme nav menus automatically become available in `core/navigation` blocks
4. **Update templates** — any classic theme PHP templates (`single.php`, `archive.php`) become HTML files in `templates/`

### Global Styles Migration from Classic Theme Customizer

Classic themes using the Customizer store their settings in `wp_options` as `theme_mods_<theme-slug>`. Extract the design tokens before switching themes:

```bash
# Export all Customizer settings for the active classic theme
wp option get theme_mods_$(wp option get stylesheet) | python3 -m json.tool

# Common Customizer keys to look for and migrate to theme.json
wp eval '
$mods = get_theme_mods();
$keys = ["background_color", "header_textcolor", "accent_color",
         "heading_font", "body_font", "container_width"];
foreach ($keys as $key) {
    if (isset($mods[$key])) {
        WP_CLI::log("{$key}: {$mods[$key]}");
    }
}
'
```

Map these values to `theme.json` `settings.color.palette`, `settings.typography.fontFamilies`, and `settings.layout.contentSize`.

---

## 6. General Migration Workflow (Applies to All Builders)

This 9-step workflow applies regardless of which page builder the site uses.

### Step 1 — Inventory Content (WP-CLI)

```bash
# Full content audit
wp post list --post_type=post,page --posts_per_page=-1 --format=table \
  --fields=ID,post_title,post_type,post_status

# Count all posts by type and status
wp db query "SELECT post_type, post_status, COUNT(*) as count
FROM wp_posts
WHERE post_status IN ('publish', 'draft', 'private')
GROUP BY post_type, post_status
ORDER BY post_type, post_status;"

# Identify which builder is in use
wp db query "SELECT meta_key, COUNT(*) FROM wp_postmeta
WHERE meta_key IN ('_elementor_edit_mode', '_fl_builder_enabled', '_et_pb_use_builder')
GROUP BY meta_key;" --skip-column-names

# Check for WPBakery (shortcode in post_content)
wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_content LIKE '%[vc_row%';" --skip-column-names

# List all media attachments for backup reference
wp post list --post_type=attachment --post_status=inherit --format=count
```

### Step 2 — Backup

```bash
# Database export with timestamp
wp db export "backup-pre-migration-$(date +%Y%m%d-%H%M%S).sql"

# Verify the export
ls -lh backup-pre-migration-*.sql

# Optional: export uploads directory listing for media audit
wp eval 'echo get_attached_file(get_posts(["post_type"=>"attachment","posts_per_page"=>1])[0]->ID);'
find $(wp eval 'echo ABSPATH;')wp-content/uploads -name "*.jpg" -o -name "*.png" -o -name "*.webp" | wc -l
```

Use UpdraftPlus (or equivalent backup plugin) for a full-site snapshot if direct server access is limited.

### Step 3 — Install Block Theme on Staging

```bash
# Upload and activate the new block theme (assuming theme directory is ready)
wp theme install /path/to/my-new-theme.zip --activate

# Or activate an already-installed theme
wp theme activate <theme-slug>

# Verify theme is active and no fatal errors
wp eval 'echo get_template() . "\n";'
wp eval 'echo "WordPress OK\n";'
```

Do not touch production until all verification steps pass on staging.

### Step 4 — Identify Template Hierarchy

Map each page, CPT, archive, and taxonomy to its FSE template. Document in a migration map spreadsheet:

| URL / Post type | Builder layout ID | FSE template | Priority |
|----------------|-------------------|-------------|---------|
| `/` (front page) | Elementor post 42 | `templates/front-page.html` | 1 |
| `/about/` | Elementor post 45 | `templates/page.html` (generic) | 2 |
| `/services/` | Elementor post 48 | `templates/page.html` (or custom) | 2 |
| `/blog/` | None (classic) | `templates/archive.html` | 3 |
| `/blog/post-slug/` | None (classic) | `templates/single.html` | 3 |
| `/contact/` | Elementor post 51 | `templates/page.html` | 2 |

### Step 5 — Rebuild Critical Templates and Patterns in FSE

Build in this order:

1. **Template parts** — header, footer (these appear on every page)
2. **Front page template** — highest traffic, most important to get right
3. **Reusable sections as patterns** — hero, CTA, testimonials, services grid
4. **CPT templates** — archive and single for each CPT
5. **Standard templates** — page, single, archive, search, 404
6. **Remaining unique pages** — rebuild from exported builder data

### Step 6 — Migrate Posts in Batches (WP-CLI)

```bash
# Dry-run: test a content replacement on one post
wp post update <post_id> --post_content='<!-- wp:pattern {"slug":"mytheme/hero"} /-->' --dry-run 2>/dev/null || \
  wp post update <post_id> --post_content='<!-- wp:pattern {"slug":"mytheme/hero"} /-->'

# After migrating a page off Elementor, clear its builder meta
wp post meta delete <post_id> _elementor_data _elementor_edit_mode _elementor_css

# Verify a post renders correctly
wp eval 'echo apply_filters("the_content", get_post(<post_id>)->post_content);' 2>&1 | head -30

# Batch update: set all migrated pages to use the standard page template
for id in 42 45 48 51; do
  wp post update $id --page_template="default"
  wp post meta delete $id _elementor_data _elementor_edit_mode
  echo "Migrated post $id"
done
```

### Step 7 — Fix Media References

```bash
# Search-replace old image URLs if staging domain differs from production
wp search-replace 'https://staging.example.com' 'https://example.com' \
  --all-tables --dry-run --report-changed-only

# Regenerate image sizes after theme switch (new theme may define different sizes)
wp media regenerate --yes

# Find broken image references
wp db query "SELECT p.ID, p.post_title, pm.meta_value as image_url
FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm.meta_key = '_thumbnail_id'
  AND pm.meta_value NOT IN (SELECT ID FROM wp_posts WHERE post_type = 'attachment');"
```

### Step 8 — QA Checklist

**Mobile and desktop:**
- [ ] Front page renders correctly at 375px, 768px, 1280px, 1600px viewports
- [ ] Navigation is functional (hamburger on mobile, expanded on desktop)
- [ ] All images load; no broken src references
- [ ] Forms submit correctly (test each form with a test submission)
- [ ] Videos and embeds load
- [ ] Carousels (if rebuilt) function on touch devices

**Accessibility:**
```bash
# Run axe on key pages
npx axe-cli https://staging.example.com --exit
npx axe-cli https://staging.example.com/about/ --exit
npx axe-cli https://staging.example.com/contact/ --exit
```

**Performance:**
```bash
npx lighthouse https://staging.example.com --output=json --output-path=./lh-home.json --only-categories=performance
```

**WordPress-specific:**
```bash
# Check for PHP errors
wp eval 'error_reporting(E_ALL); echo "No fatal errors\n";'

# Verify no builder shortcodes are visible on any page
wp db query "SELECT ID, post_title FROM wp_posts
WHERE (post_content LIKE '%[et_pb_%' OR post_content LIKE '%[vc_row%' OR post_content LIKE '%[et_pb_%')
  AND post_status = 'publish';"
```

### Step 9 — DNS Cutover

```bash
# Final pre-cutover checks on production-pointed staging
wp option update siteurl 'https://example.com'
wp option update home 'https://example.com'

# Flush everything
wp cache flush
wp rewrite flush --hard
wp cron event run --due-now

# Deactivate builder plugins after verifying all pages are migrated
wp plugin deactivate elementor elementor-pro  # Replace with actual plugin slugs
wp plugin deactivate divi-builder             # If applicable

# Final verification
wp eval 'echo "WordPress OK — builder deactivated\n";'
```

---

## 7. What Cannot Be Auto-Migrated (Honest Boundaries)

No tool — this skill included — can auto-migrate the following. Each requires a human to make design and engineering decisions:

**Complex animation sequences.** Builder animation controls (Elementor's Motion Effects, Divi's animation settings, WPBakery's animation add-ons) are deeply tied to each builder's JS engine. Recreating animations requires either the Interactivity API, a custom JS file, or a third-party animation library. The design intent (what animates, when, how fast) can be extracted from the builder data, but the implementation must be rebuilt from scratch.

**Paid third-party add-on widgets.** Commercial add-ons — JetElements, JetSmartFilters, DiviBooster, Ultimate Addons for Elementor, Essential Addons, WPBakery's premium Element Pack — have no open-source block equivalent. For each, you must either find a block plugin that replicates the functionality, build a custom block, or accept the feature is not migrating.

**Dynamic content tied to builder-specific APIs.** Elementor's Dynamic Tags system, Divi's Custom Field modules, and WPBakery's VC Param Group all have proprietary APIs for pulling in post meta, user data, or term data. The core Block Bindings API (WP 6.5+) can replace most of this functionality, but each binding must be mapped and registered manually. See `references/content-migration.md`.

**Custom builder PHP modules.** If a developer extended the builder by registering custom widget classes (`Elementor\Widget_Base`, `ET_Builder_Module`, `WPBakeryShortCode`), those classes must be rewritten as custom blocks. There is no automated path from a PHP widget class to a `block.json` + `render.php` custom block.

**Anything requiring a human designer's judgment on design intent.** When builder settings are ambiguous — when the designer used visual overrides, conditional visibility, A/B test variants, or when the layout differs significantly between desktop and mobile — a developer cannot safely infer the intended final design from data alone. A designer needs to review the original and approve the rebuilt version.

**Builder-specific conditional display logic.** Elementor's display conditions (show this section only on mobile, or only to logged-in users) require either the Interactivity API or server-side PHP logic in the block render callback. This must be rebuilt per-element.

**Multi-step builder popups and modal flows.** Popup sequences with triggers, conditions, and multi-step forms are not representable in block markup without significant custom code.

Set these expectations with clients and stakeholders before starting any page builder migration.
