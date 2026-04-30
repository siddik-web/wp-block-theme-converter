# Modern Block Theme Features (WordPress 6.5+)

Reference for features introduced in WordPress 6.5–6.8+ that production block themes should leverage.

## Table of Contents

1. [Interactivity API](#interactivity-api)
2. [Block Bindings API](#block-bindings-api)
3. [Per-Block CSS Loading](#per-block-css-loading)
4. [Section Styles](#section-styles)
5. [Grid Layout Enhancements](#grid-layout-enhancements)
6. [Pattern Overrides](#pattern-overrides)
7. [Dark Mode & prefers-color-scheme](#dark-mode--prefers-color-scheme)
8. [RTL & Logical Properties](#rtl--logical-properties)
9. [View Script Modules](#view-script-modules)
10. [Decision Matrix: When to Use What](#decision-matrix)

---

## Interactivity API

**Available since:** WordPress 6.5 (stable)
**Replaces:** Alpine.js, vanilla JS for most interactive patterns

The Interactivity API (`@wordpress/interactivity`) is WordPress's native reactivity system for block themes. It replaces Alpine.js and most vanilla JS for common interactive patterns (modals, accordions, tabs, dropdowns, lightboxes, infinite scroll).

### When to Use

| Interactive Feature | Strategy |
|---------------------|----------|
| Accordion / FAQ | `core/details` block (native, no JS needed) |
| Modal / Dialog | Interactivity API |
| Tabs | Interactivity API |
| Dropdown menus | Interactivity API |
| Lightbox | Built into `core/image` block (6.5+) |
| Scroll-based reveal | Interactivity API OR CSS `@scroll-timeline` |
| Carousel / Slider | Swiper.js via `wp_enqueue_script()` (Interactivity API lacks gesture support) |
| Complex animation (GSAP) | GSAP via `wp_enqueue_script()` |
| Form validation | Interactivity API for simple, plugin for complex |
| Real-time search/filter | Interactivity API |

### Implementation Pattern

**1. Register the view script module in `functions.php` or `inc/enqueue.php`:**

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

**2. Create the interaction script (`assets/js/interactions.js`):**

```js
import { store, getContext } from '@wordpress/interactivity';

store( '{{themeSlugCamel}}', {
    state: {
        get isMenuOpen() {
            return getContext().isOpen;
        },
    },
    actions: {
        toggleMenu() {
            const ctx = getContext();
            ctx.isOpen = ! ctx.isOpen;
        },
    },
    callbacks: {
        onMenuToggle() {
            const ctx = getContext();
            // Side effects when menu state changes
        },
    },
} );
```

**3. Use directives in block pattern markup:**

```php
<!-- wp:group {
    "tagName":"div",
    "metadata":{"name":"Mobile Menu"},
    "interactivity":{"namespace":"{{themeSlugCamel}}"}
} -->
<div
    class="wp-block-group"
    data-wp-interactive="{{themeSlugCamel}}"
    data-wp-context='{"isOpen": false}'
>
    <!-- wp:html -->
    <button
        data-wp-on--click="actions.toggleMenu"
        data-wp-bind--aria-expanded="state.isMenuOpen"
        aria-label="<?php esc_attr_e( 'Toggle menu', '{{text-domain}}' ); ?>"
    >
        <span data-wp-text="state.isMenuOpen ? '<?php esc_attr_e( 'Close', '{{text-domain}}' ); ?>' : '<?php esc_attr_e( 'Menu', '{{text-domain}}' ); ?>'"></span>
    </button>
    <!-- /wp:html -->

    <!-- wp:group {"className":"mobile-nav","metadata":{"name":"Menu Panel"}} -->
    <div
        class="wp-block-group mobile-nav"
        data-wp-class--is-open="state.isMenuOpen"
        data-wp-bind--aria-hidden="!state.isMenuOpen"
        role="region"
    >
        <!-- nav items here -->
    </div>
    <!-- /wp:group -->
</div>
<!-- /wp:group -->
```

### Key Directives Reference

| Directive | Purpose | Example |
|-----------|---------|---------|
| `data-wp-interactive` | Declare namespace | `data-wp-interactive="myTheme"` |
| `data-wp-context` | Local reactive state | `data-wp-context='{"isOpen":false}'` |
| `data-wp-on--{event}` | Event handler | `data-wp-on--click="actions.toggle"` |
| `data-wp-bind--{attr}` | Bind attribute | `data-wp-bind--aria-expanded="state.isOpen"` |
| `data-wp-class--{class}` | Toggle CSS class | `data-wp-class--is-active="state.isActive"` |
| `data-wp-text` | Set text content | `data-wp-text="state.label"` |
| `data-wp-style--{prop}` | Bind CSS property | `data-wp-style--opacity="state.opacity"` |
| `data-wp-watch` | Run callback on state change | `data-wp-watch="callbacks.onUpdate"` |
| `data-wp-init` | Run once on mount | `data-wp-init="callbacks.init"` |
| `data-wp-each` | Loop over array | `data-wp-each="state.items"` |
| `data-wp-key` | Unique key in loops | `data-wp-key="context.item.id"` |

### Context Scope

Context is **DOM-tree scoped**. Each element with `data-wp-context` creates its own scope for its subtree:

- Nested `data-wp-context` elements merge with the parent context, with child values shadowing parent values.
- Two sibling elements each with `data-wp-context` have isolated state — changing `isOpen` in one does NOT affect the other.
- `state` (from `store()`) is global across all instances; `context` (from `data-wp-context`) is instance-local.

Use `context` for per-instance state (e.g., "is THIS card open?"). Use `state` for shared state (e.g., "is the global menu open?").

### Migration from Alpine.js

| Alpine.js | Interactivity API |
|-----------|-------------------|
| `x-data="{ open: false }"` | `data-wp-context='{"open":false}'` |
| `x-on:click="open = !open"` | `data-wp-on--click="actions.toggle"` |
| `x-show="open"` | `data-wp-class--is-visible="state.isOpen"` + CSS |
| `x-bind:class="{ 'active': open }"` | `data-wp-class--active="state.isOpen"` |
| `x-text="label"` | `data-wp-text="state.label"` |
| `x-transition` | CSS transitions on the toggled class |

**Important:** Unlike Alpine.js, Interactivity API does NOT support inline expressions. All logic must be in the `store()` definition.

---

## Block Bindings API

**Available since:** WordPress 6.5
**Purpose:** Connect block attributes to dynamic data sources (custom fields, post meta, options, etc.)

### When to Use

Use Block Bindings when you need to display dynamic data in block markup WITHOUT writing a custom block or using PHP render callbacks. Common use cases:

- Display custom field values in patterns
- Show site options (phone, address, hours) in header/footer
- Connect product metadata to block attributes
- Dynamic image sources from custom fields

### Implementation

**1. Register a custom bindings source in PHP (`inc/block-bindings.php`):**

```php
<?php
defined( 'ABSPATH' ) || exit;

function {{theme_slug_underscored}}_register_block_bindings() {
    register_block_bindings_source(
        '{{theme-slug}}/site-info',
        array(
            'label'              => __( 'Site Info', '{{text-domain}}' ),
            'get_value_callback' => '{{theme_slug_underscored}}_site_info_binding',
            'uses_context'       => array( 'postId', 'postType' ),
        )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_register_block_bindings' );

function {{theme_slug_underscored}}_site_info_binding( array $args, $block_instance, string $attr_name ) {
    $key = $args['key'] ?? '';

    switch ( $key ) {
        case 'phone':
            return get_option( '{{theme_slug_underscored}}_phone', '' );
        case 'address':
            return get_option( '{{theme_slug_underscored}}_address', '' );
        case 'email':
            return get_option( '{{theme_slug_underscored}}_email', '' );
        default:
            return '';
    }
}
```

**2. Use in block markup (pattern or template):**

```html
<!-- wp:paragraph {
    "metadata":{
        "bindings":{
            "content":{
                "source":"{{theme-slug}}/site-info",
                "args":{"key":"phone"}
            }
        }
    }
} -->
<p>+1 (555) 000-0000</p>
<!-- /wp:paragraph -->
```

The paragraph content will be replaced with the dynamic value at render time. The hardcoded text serves as fallback.

**3. Built-in sources (no registration needed):**

- `core/post-meta` — read post meta fields
- `core/site` — read site-level options (title, description, URL)

```html
<!-- wp:paragraph {
    "metadata":{
        "bindings":{
            "content":{
                "source":"core/post-meta",
                "args":{"key":"my_custom_field"}
            }
        }
    }
} -->
<p>Fallback value</p>
<!-- /wp:paragraph -->
```

---

## Per-Block CSS Loading

**Available since:** WordPress 6.3
**API:** `wp_enqueue_block_style()`
**Purpose:** Load CSS files only when a specific block is used on the page

### Why This Matters

Instead of loading ALL custom block CSS upfront in a single `style.css`, you can split styles per block. CSS only loads when the block appears on the page, significantly reducing unused CSS.

### Implementation

**In `inc/enqueue.php`:**

```php
function {{theme_slug_underscored}}_enqueue_block_styles() {
    // Custom styles for core/quote — only loaded when a Quote block is on the page.
    wp_enqueue_block_style(
        'core/quote',
        array(
            'handle' => '{{theme-slug}}-quote-style',
            'src'    => get_template_directory_uri() . '/assets/css/blocks/quote.css',
            'ver'    => filemtime( get_template_directory() . '/assets/css/blocks/quote.css' ),
            'path'   => get_template_directory() . '/assets/css/blocks/quote.css',
        )
    );

    wp_enqueue_block_style(
        'core/cover',
        array(
            'handle' => '{{theme-slug}}-cover-style',
            'src'    => get_template_directory_uri() . '/assets/css/blocks/cover.css',
            'ver'    => filemtime( get_template_directory() . '/assets/css/blocks/cover.css' ),
            'path'   => get_template_directory() . '/assets/css/blocks/cover.css',
        )
    );
}
add_action( 'init', '{{theme_slug_underscored}}_enqueue_block_styles' );
```

### File Structure

```
assets/css/
├── style.css          # Global styles (layout, typography, utilities)
├── editor.css         # Editor parity styles
├── critical.css       # Above-fold critical CSS (optional)
└── blocks/            # Per-block styles (NEW)
    ├── quote.css
    ├── cover.css
    ├── navigation.css
    ├── table.css
    ├── separator.css
    └── details.css
```

### What Goes Where

| CSS Type | File | Loading |
|----------|------|---------|
| Root styles, body typography, root spacing | `theme.json` styles section | Always loaded |
| Global utilities, layout helpers, skip-link | `assets/css/style.css` | Always loaded |
| Block-specific customizations | `assets/css/blocks/{block}.css` | Only when block is used |
| Custom block styles (`.is-style-*`) | `assets/css/blocks/{block}.css` | Only when block is used |
| Editor parity | `assets/css/editor.css` | Editor only |

### Which Blocks to Split

Split CSS for blocks that have substantial custom styling. Don't split blocks with only 1-2 rules — the HTTP overhead isn't worth it.

**Good candidates:** `core/quote`, `core/cover`, `core/table`, `core/navigation`, `core/separator`, `core/details`, `core/code`, `core/pullquote`, WooCommerce blocks.

**Keep in global:** `core/group`, `core/heading`, `core/paragraph`, `core/button`, `core/image`, `core/columns` — these appear on virtually every page.

---

## Section Styles

**Available since:** WordPress 6.6
**Purpose:** Apply coordinated style changes to a group of nested blocks at once

Section Styles allow a `core/group` block to carry a `className` that cascades visual changes to all child blocks within that section. This is declared via theme.json `styles.blocks` + `variations`.

### Example: Dark Section

In `theme.json`:

```json
{
    "styles": {
        "blocks": {
            "core/group": {
                "variations": {
                    "section-dark": {
                        "color": {
                            "background": "var(--wp--preset--color--primary)",
                            "text": "var(--wp--preset--color--background)"
                        },
                        "elements": {
                            "heading": {
                                "color": { "text": "var(--wp--preset--color--background)" }
                            },
                            "link": {
                                "color": { "text": "var(--wp--preset--color--accent)" },
                                ":hover": {
                                    "color": { "text": "var(--wp--preset--color--background)" }
                                }
                            },
                            "button": {
                                "color": {
                                    "text": "var(--wp--preset--color--primary)",
                                    "background": "var(--wp--preset--color--background)"
                                }
                            }
                        }
                    },
                    "section-highlight": {
                        "color": {
                            "background": "var(--wp--preset--color--accent)",
                            "text": "var(--wp--preset--color--background)"
                        },
                        "elements": {
                            "heading": {
                                "color": { "text": "var(--wp--preset--color--background)" }
                            },
                            "button": {
                                "color": {
                                    "text": "var(--wp--preset--color--accent)",
                                    "background": "var(--wp--preset--color--background)"
                                }
                            }
                        }
                    }
                }
                
            }
        }
    }
}
```

Usage in patterns:

```html
<!-- wp:group {"className":"is-style-section-dark","tagName":"section","layout":{"type":"constrained"}} -->
<section class="wp-block-group is-style-section-dark">
    <!-- All child blocks automatically inherit dark section colors -->
    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading"><?php esc_html_e( 'Features', '{{text-domain}}' ); ?></h2>
    <!-- /wp:heading -->
</section>
<!-- /wp:group -->
```

### Registering Section Styles

In `inc/block-styles.php`, register matching block styles so they appear in the editor:

```php
register_block_style(
    'core/group',
    array(
        'name'  => 'section-dark',
        'label' => __( 'Dark Section', '{{text-domain}}' ),
    )
);
register_block_style(
    'core/group',
    array(
        'name'  => 'section-highlight',
        'label' => __( 'Highlight Section', '{{text-domain}}' ),
    )
);
```

---

## Grid Layout Enhancements

**Available since:** WordPress 6.3 (basic), 6.6+ (improved controls)

### CSS Grid via theme.json

```html
<!-- wp:group {"layout":{"type":"grid","columnCount":3,"minimumColumnWidth":null}} -->
<div class="wp-block-group">
    <!-- Child blocks placed in grid cells -->
</div>
<!-- /wp:group -->
```

### Responsive Grid (minimum column width)

```html
<!-- wp:group {"layout":{"type":"grid","minimumColumnWidth":"280px"}} -->
<div class="wp-block-group">
    <!-- Auto-fills columns, wrapping at 280px minimum -->
</div>
<!-- /wp:group -->
```

This generates `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` — fully responsive with no media queries needed.

### When to Use Grid vs Columns

| Layout Need | Use |
|-------------|-----|
| 2-4 equal columns, simple | `core/columns` |
| Responsive wrapping grid | `core/group` with grid layout + `minimumColumnWidth` |
| Fixed column count | `core/group` with grid layout + `columnCount` |
| Masonry-like | Not natively supported — use CSS in `style.css` |

---

## Pattern Overrides

**Available since:** WordPress 6.6
**Purpose:** Allow per-instance customization of synced patterns

When a pattern is synced (reusable block), edits propagate everywhere. Pattern Overrides let specific attributes be customizable per instance while keeping the structure synced.

In the pattern's block markup, mark editable attributes:

```html
<!-- wp:heading {
    "metadata":{
        "name":"Card Title",
        "bindings":{
            "content":{
                "source":"core/pattern-overrides"
            }
        }
    }
} -->
<h2 class="wp-block-heading">Default Title</h2>
<!-- /wp:heading -->
```

This is particularly useful for card patterns, testimonial patterns, and pricing tier patterns where the structure is fixed but content varies.

---

## Pattern Overrides vs Block Bindings — Which to Use

Both features let block content vary per use, but they solve different problems:

| Scenario | Use |
|----------|-----|
| Editor wants to type different text/swap an image per page instance | **Pattern Overrides** |
| Value comes from post meta, custom fields, or a registered data source | **Block Bindings** |
| Pattern is synced (reusable block) but needs per-placement variation | **Pattern Overrides** |
| Content is dynamic and should NOT be editable in the block editor | **Block Bindings** |
| Displaying ACF field, options table, or external API data | **Block Bindings** |
| Card grid where each card has a different title/image but same layout | **Pattern Overrides** |

**Key distinction:** Pattern Overrides are an *editor* affordance — a human customizes the value in Site Editor. Block Bindings are a *developer* affordance — the value is pulled programmatically from a data source.

**Available since:** Pattern Overrides → WP 6.6 | Block Bindings → WP 6.5

---

## Dark Mode & prefers-color-scheme

### Automatic Dark Mode via CSS

For themes that should respect the user's OS dark mode setting:

**In `assets/css/style.css`:**

```css
@media (prefers-color-scheme: dark) {
    body {
        --wp--preset--color--background: #0A0A0A;
        --wp--preset--color--text: #FAFAF7;
        --wp--preset--color--surface: #1A1A1A;
        --wp--preset--color--border: #333333;
        --wp--preset--color--muted: #999999;
    }
}
```

### Manual Dark Mode via Style Variation

For user-selectable dark mode, create `styles/dark.json` (see `theme-json-schema.md`).

### Combined Approach

Provide both a manual style variation AND automatic dark mode. The style variation overrides the auto detection when explicitly chosen.

---

## RTL & Logical Properties

### CSS Logical Properties

For themes targeting international / RTL markets, use CSS logical properties instead of physical ones:

| Physical (avoid) | Logical (prefer) |
|-------------------|-------------------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `border-left` | `border-inline-start` |
| `left: 0` | `inset-inline-start: 0` |

### RTL in theme.json

WordPress automatically flips `padding.left` / `padding.right` in theme.json for RTL contexts. Stick to the standard four-sided padding notation:

```json
"spacing": {
    "padding": {
        "top": "0",
        "right": "var(--wp--preset--spacing--40)",
        "bottom": "0",
        "left": "var(--wp--preset--spacing--40)"
    }
}
```

### RTL Stylesheet

If the theme has substantial custom CSS, provide an `rtl.css` alongside `style.css`. WordPress auto-loads `rtl.css` when `is_rtl()` is true.

Alternatively, using CSS logical properties throughout eliminates the need for a separate RTL stylesheet entirely. This is the **recommended approach** for new themes.

---

## View Script Modules

**Available since:** WordPress 6.5

`wp_register_script_module()` and `wp_enqueue_script_module()` use native ES module loading (`<script type="module">`) instead of the classic `wp_enqueue_script()`. Benefits:

- Native `import` / `export` syntax
- Automatic deferred loading
- Tree-shakeable
- Required for Interactivity API

### When to Use Script Modules vs Classic Scripts

| Scenario | API |
|----------|-----|
| Interactivity API interactions | `wp_register_script_module()` |
| New frontend JS with no legacy deps | `wp_register_script_module()` |
| JS that depends on jQuery or legacy WP scripts | `wp_enqueue_script()` |
| Block editor scripts | `wp_enqueue_script()` (editor uses classic system) |
| Third-party libraries (Swiper, GSAP) | `wp_enqueue_script()` with `defer` |

---

## Decision Matrix

When the source HTML includes interactive features, use this matrix to decide the implementation strategy:

```
Is it a native WP block feature?
├── YES → Use the core block (details, lightbox, navigation)
└── NO ↓
    Is it a simple state toggle (open/close, show/hide, active/inactive)?
    ├── YES → Use Interactivity API
    └── NO ↓
        Does it need gesture support (swipe, drag, pinch)?
        ├── YES → Enqueue specialized library (Swiper, SortableJS)
        └── NO ↓
            Does it need complex animation sequences?
            ├── YES → Enqueue GSAP via wp_enqueue_script()
            └── NO → Use Interactivity API
```

### Alpine.js Migration Note

If the source project uses Alpine.js, **do NOT simply enqueue Alpine.js in the WordPress theme**. Instead:

1. Convert `x-data` / `x-on` / `x-show` patterns to Interactivity API directives
2. Move inline Alpine expressions to a `store()` definition
3. Register via `wp_register_script_module()`
4. Use `data-wp-*` attributes in patterns

This ensures the theme uses WordPress-native APIs, reducing bundle size and improving compatibility with the block editor.

The only exception is if the Alpine.js usage is extremely complex (100+ components with complex stores) and converting would be impractical for the project timeline. In that case, enqueue Alpine.js properly via `wp_enqueue_script()` and document the dependency.
