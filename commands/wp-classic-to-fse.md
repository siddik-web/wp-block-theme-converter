# /wp-classic-to-fse

**Purpose:** Convert an existing classic WordPress theme (PHP template files, `functions.php`, `style.css`) into a Full Site Editing (FSE) block theme, preserving the visual design and site structure.

## When to Use

This command is specifically for users who already have a **WordPress classic theme** (one with `header.php`, `footer.php`, `index.php`, `single.php`, etc.) and want to convert it to a block theme.

- **Use this command** when the source is an existing WordPress classic theme
- **Use `/convert-to-wp-theme`** when the source is static HTML/CSS/JS (non-WordPress)
- **Use `/wp-migrate`** when the user wants to migrate content (posts, widgets, ACF) rather than the theme files themselves

## Workflow

### Step 1: Audit the Classic Theme

Ask the user to provide:
1. The theme's `style.css` (header metadata)
2. List of PHP template files present
3. `functions.php` (or key sections of it)
4. Any CSS files and their structure
5. Whether any page builders (Elementor, Divi) are being used on top of the classic theme

From these, identify:

```
CLASSIC THEME AUDIT
====================
Theme name:    {{Classic Theme Name}}
Template files: {{list of .php files}}
Style:          {{CSS methodology — BEM, utility, custom?}}
Plugins used:  {{list active plugins affecting display}}
Dynamic areas: {{sidebars, widget areas, nav menus}}
Custom functionality: {{shortcodes, custom post types, custom queries}}
JavaScript:    {{enqueued scripts and their purpose}}
```

### Step 2: Mapping — Classic to FSE

Map each classic theme file to its FSE equivalent:

| Classic File | FSE Equivalent | Notes |
|-------------|----------------|-------|
| `header.php` | `parts/header.html` | Convert PHP to block markup |
| `footer.php` | `parts/footer.html` | Convert PHP to block markup |
| `sidebar.php` | `parts/sidebar.html` | Widget areas → blocks |
| `index.php` | `templates/index.html` | |
| `home.php` | `templates/home.html` | Blog home page |
| `front-page.php` | `templates/front-page.html` | Static front page |
| `page.php` | `templates/page.html` | |
| `single.php` | `templates/single.html` | |
| `single-{{cpt}}.php` | `templates/single-{{cpt}}.html` | Per CPT |
| `archive.php` | `templates/archive.html` | |
| `archive-{{cpt}}.php` | `templates/archive-{{cpt}}.html` | Per CPT |
| `category.php` | `templates/category.html` | |
| `tag.php` | `templates/tag.html` | |
| `taxonomy-{{tax}}.php` | `templates/taxonomy-{{tax}}.html` | |
| `search.php` | `templates/search.html` | |
| `404.php` | `templates/404.html` | |
| `comments.php` | Block-based comments in template | `core/comments` block |
| Custom page template | `templates/{{slug}}.html` + `customTemplates` entry in theme.json |
| `woocommerce/` | WC block templates in `templates/` | See `references/woocommerce.md` |

### Step 3: Convert functions.php

Identify which functionality must be kept vs replaced:

```
FUNCTIONS.PHP AUDIT
====================
KEEP (convert to FSE patterns):
  - Theme setup (add_theme_support calls)
  - Asset enqueueing (move to inc/enqueue.php)
  - Custom post type registration (move to inc/post-types.php)
  - Custom taxonomy registration (move to inc/taxonomies.php)
  - Block Bindings source registration (move to inc/block-bindings.php)

REPLACE (FSE handles this natively):
  - add_theme_support( 'menus' )         → core/navigation block
  - register_nav_menus()                 → core/navigation block
  - register_sidebar()                   → template parts
  - dynamic_sidebar()                    → template parts
  - wp_nav_menu()                        → core/navigation block
  - get_header() / get_footer()          → template parts referenced in templates
  - get_sidebar()                        → template parts

REMOVE (no longer needed in FSE):
  - add_theme_support( 'block-templates' )  → implicit in FSE
  - Custom walker_nav_menu classes          → core/navigation renders its own
  - Breadcrumb functions (if Yoast active)  → use breadcrumbs template part
```

### Step 4: CSS Strategy

The classic theme's CSS cannot be used unchanged — it targets classic markup, not block markup.

Options:

**A. Full Rewrite (recommended for clean results)**
- Extract the design tokens (colors, fonts, spacing) → put in `theme.json`
- Rewrite CSS targeting block classes (`wp-block-*`) instead of classic selectors
- Use per-block CSS files in `assets/css/blocks/`

**B. Incremental Migration (for large CSS codebases)**
- Keep existing CSS as a global stylesheet
- Add per-block CSS overrides for block-specific elements
- Gradually refactor selectors over time

**C. CSS Audit + Cherry-Pick**
- Run Chrome DevTools Coverage tab → identify which CSS rules are actually used
- Copy used rules only, then rewrite selectors

Always state which approach is being taken and why.

### Step 5: Convert Header and Footer

Convert `header.php` to `parts/header.html`:

**Classic `header.php` (simplified):**
```php
<header class="site-header">
    <div class="container">
        <a href="<?php echo esc_url( home_url() ); ?>" class="site-logo">
            <?php bloginfo( 'name' ); ?>
        </a>
        <?php wp_nav_menu( array( 'theme_location' => 'primary' ) ); ?>
    </div>
</header>
```

**FSE `parts/header.html`:**
```html
<!-- wp:group {"tagName":"header","className":"site-header","layout":{"type":"constrained"}} -->
<header class="wp-block-group site-header">
    <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
    <div class="wp-block-group">
        <!-- wp:site-logo /-->
        <!-- wp:navigation {"ariaLabel":"<?php esc_attr_e( 'Primary', 'my-theme' ); ?>"} /-->
    </div>
    <!-- /wp:group -->
</header>
<!-- /wp:group -->
```

### Step 6: Convert Templates

**Classic `single.php` (simplified):**
```php
<?php get_header(); ?>
<main class="site-main">
    <?php while ( have_posts() ) : the_post(); ?>
        <article>
            <h1><?php the_title(); ?></h1>
            <div class="entry-content"><?php the_content(); ?></div>
        </article>
        <?php comments_template(); ?>
    <?php endwhile; ?>
</main>
<?php get_sidebar(); ?>
<?php get_footer(); ?>
```

**FSE `templates/single.html`:**
```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">

    <!-- wp:group {"layout":{"type":"constrained"}} -->
    <div class="wp-block-group">
        <!-- wp:post-featured-image {"isLink":false} /-->
        <!-- wp:post-title {"level":1} /-->
        <!-- wp:post-meta /-->
        <!-- wp:post-content /-->
        <!-- wp:post-tags /-->
    </div>
    <!-- /wp:group -->

    <!-- wp:separator /-->

    <!-- wp:comments -->
    <div class="wp-block-comments">
        <!-- wp:comments-title /-->
        <!-- wp:comment-template -->
            <!-- wp:columns -->
            <div class="wp-block-columns">
                <!-- wp:column {"width":"40px"} -->
                <div class="wp-block-column" style="flex-basis:40px">
                    <!-- wp:avatar {"size":40} /-->
                </div>
                <!-- /wp:column -->
                <!-- wp:column -->
                <div class="wp-block-column">
                    <!-- wp:comment-author-name /-->
                    <!-- wp:comment-date /-->
                    <!-- wp:comment-content /-->
                    <!-- wp:comment-reply-link /-->
                </div>
                <!-- /wp:column -->
            </div>
            <!-- /wp:columns -->
        <!-- /wp:comment-template -->
        <!-- wp:comments-pagination -->
            <!-- wp:comments-pagination-previous /-->
            <!-- wp:comments-pagination-numbers /-->
            <!-- wp:comments-pagination-next /-->
        <!-- /wp:comments-pagination -->
        <!-- wp:post-comments-form /-->
    </div>
    <!-- /wp:comments -->

</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

### Step 7: Handle Shortcodes and Custom Functions

For each custom shortcode in the classic theme:

| Shortcode | FSE Approach |
|-----------|-------------|
| `[my_posts_grid]` | Replace with Query Loop block + custom template part |
| `[my_cta]` | Replace with a block pattern |
| `[my_team]` | Replace with a block pattern or custom dynamic block |
| `[contact_form]` | Replace with form plugin's native block |
| Custom template tags | Replace with core blocks or custom dynamic blocks |

### Step 8: theme.json from Existing CSS

Extract design tokens from the classic theme's CSS:

```css
/* Classic theme CSS variables → theme.json values */
:root {
    --color-primary: #0052CC;      → "primary" in palette
    --color-secondary: #6554C0;    → "secondary" in palette
    --color-text: #172B4D;         → "foreground" in palette
    --color-bg: #FFFFFF;           → "background" in palette
    --font-heading: 'Inter', sans-serif;  → heading fontFamily
    --font-body: 'Roboto', sans-serif;    → body fontFamily
    --container-width: 1200px;     → contentSize in layout
    --spacing-sm: 1rem;            → spacing preset "30"
    --spacing-md: 2rem;            → spacing preset "50"
    --spacing-lg: 4rem;            → spacing preset "70"
}
```

Use `/wp-theme-json` command to generate the `theme.json` from these tokens.

### Step 9: Output Delivery

Deliver in this order:

1. **Conversion Plan** — mapping table from Step 2
2. `style.css` — updated header (keep metadata, remove all CSS)
3. `theme.json` — full schema v3 with design tokens from classic CSS
4. `functions.php` — stripped to essential functions only
5. `inc/setup.php` — theme support declarations
6. `inc/enqueue.php` — asset registration
7. `inc/post-types.php` — CPT registration (if any)
8. `parts/header.html` — converted from `header.php`
9. `parts/footer.html` — converted from `footer.php`
10. `parts/*.html` — any other template parts
11. `templates/*.html` — all page templates
12. `patterns/*.php` — patterns replacing shortcodes

For large classic themes (10+ template files), use the multi-turn strategy from `references/multi-turn-strategy.md`.

### Step 10: Verification

```
VERIFICATION:
✅ Theme activates without PHP errors (check debug.log)
✅ All template files listed in Site Editor → Templates
✅ Header and footer render correctly on all templates
✅ Navigation menus display in core/navigation block
✅ Blog posts render on home/archive templates
✅ Single post template renders correctly
✅ Comments work on single post template
✅ Custom post types have archive and single templates
✅ Search results page renders
✅ 404 page renders
✅ Former shortcodes either work via pattern or removed gracefully
✅ No inline styles in block markup
✅ All user-facing strings translation-ready
✅ No missing CSS — visual output matches classic theme
```

## Common Classic Theme Patterns and Their FSE Equivalents

| Classic Pattern | FSE Equivalent |
|----------------|----------------|
| `the_title()` | `core/post-title` |
| `the_content()` | `core/post-content` |
| `the_excerpt()` | `core/post-excerpt` |
| `the_author()` / `the_author_posts_link()` | `core/post-author` |
| `the_date()` / `get_the_date()` | `core/post-date` |
| `get_the_post_thumbnail()` | `core/post-featured-image` |
| `the_tags()` / `get_the_tag_list()` | `core/post-terms {"taxonomy":"post_tag"}` |
| `the_category()` | `core/post-terms {"taxonomy":"category"}` |
| `comments_template()` | `core/comments` block |
| `wp_nav_menu()` | `core/navigation` |
| `get_the_archive_title()` | `core/query-title` |
| `WP_Query` loop | `core/query` + `core/post-template` |
| `next_posts_link()` / `previous_posts_link()` | `core/query-pagination` |
| `the_search_form()` | `core/search` |
| `bloginfo( 'name' )` | `core/site-title` |
| `bloginfo( 'description' )` | `core/site-tagline` |
| Custom sidebar | `parts/sidebar.html` template part |
| `get_sidebar()` | `<!-- wp:template-part {"slug":"sidebar"} /-->` |
| `get_template_part( 'content', 'single' )` | Block pattern inserted in template |

## Example Invocations

```
/wp-classic-to-fse
My classic theme has: header.php, footer.php, page.php, single.php,
archive.php, front-page.php, and a sidebar.php with a search widget
and recent posts widget. The theme uses Bootstrap 4 for styling.
Here's the functions.php: [paste]
Here's the style.css: [paste]
```

```
/wp-classic-to-fse
Converting Twenty Seventeen child theme to FSE.
The child theme adds a portfolio CPT and a custom testimonials shortcode.
The parent theme's PHP templates are standard WordPress.
```

## Read Also

- `commands/convert-to-wp-theme.md` — for converting static HTML (not a WordPress classic theme)
- `commands/wp-migrate.md` — for migrating content (posts, ACF, widgets) to the new theme
- `references/methodology.md` — 10-phase conversion process
- `references/block-conversion-map.md` — HTML element → block lookup table
- `references/woocommerce.md` — if the classic theme has WooCommerce templates
