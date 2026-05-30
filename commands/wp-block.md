---
description: Scaffold a custom WordPress block (block.json, edit.js, save.js or render.php, styles) ready to register inside a block theme.
---

# /wp-block

**Purpose:** Scaffold a custom WordPress block — `block.json`, `edit.js`, `save.js` or `render.php`, `style.css`, and `editor.css` — ready to register inside a block theme.

## When to Use

Use this command when no core block (or combination of core blocks in a pattern) satisfies the requirement. Ask before scaffolding a custom block:

> "This interaction/layout could also be achieved with a `core/group` + Interactivity API pattern. Do you want a custom block, or would a block pattern be simpler?"

Only proceed with a custom block if the user confirms or the use case clearly requires it (e.g., server-side dynamic rendering with custom REST data, deeply custom editor UI, registering a new block type for a plugin).

## Workflow

### Step 1: Gather Block Requirements

Ask (or infer from context):

| Question | Default if silent |
|----------|-------------------|
| Block name (human-readable) | Required — always ask |
| Block slug (`namespace/block-name`) | Derive from theme slug + block name |
| Block category | `theme` |
| Block type: **static** (save.js renders HTML) or **dynamic** (render.php renders HTML server-side) | Ask — explain the tradeoff below |
| Attributes needed | Infer from description |
| Supports needed (innerBlocks, align, color, typography, spacing) | Minimal — only what's asked |
| Icon | `block-default` (dashicons slug) |
| Keywords | 3 inferred from block name |

**Static vs Dynamic — explain the tradeoff:**

| | Static Block | Dynamic Block |
|--|-------------|---------------|
| Output stored in | Post content (HTML) | Database (attributes only) |
| Re-renders when | Post saved | Every page load |
| Best for | Design components (hero, card, CTA) | Data-driven content (recent posts, live inventory) |
| `save.js` | Required | Must return `null` |
| `render.php` | Not used | Required |

### Step 2: Plan the Block Structure

State the file list before generating:

```
BLOCK PLAN: {{namespace}}/{{block-name}}
Type: Static | Dynamic
Files to generate:
  blocks/{{block-name}}/block.json
  blocks/{{block-name}}/edit.js
  blocks/{{block-name}}/save.js          (static only)
  blocks/{{block-name}}/render.php       (dynamic only)
  blocks/{{block-name}}/style.css
  blocks/{{block-name}}/editor.css
  inc/block-registration.php             (only if not already present)
Attributes: [list]
Supports: [list]
```

### Step 3: Generate block.json

> For the complete `block.json` schema — all properties, every attribute type, deprecated API versions — see [`references/custom-blocks.md`](../references/custom-blocks.md).

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "{{namespace}}/{{block-name}}",
    "version": "1.0.0",
    "title": "{{Block Name}}",
    "category": "{{category}}",
    "icon": "{{icon}}",
    "description": "{{One-line description}}",
    "keywords": ["{{keyword1}}", "{{keyword2}}", "{{keyword3}}"],
    "textdomain": "{{text-domain}}",
    "attributes": {
        {{attributes}}
    },
    "supports": {
        {{supports}}
    },
    "style": "file:./style.css",
    "editorStyle": "file:./editor.css",
    "editorScript": "file:./edit.js",
    "viewScript": "file:./view.js"
}
```

**Attribute type reference:**

| Data | `type` | `default` example |
|------|--------|-------------------|
| Short text | `"string"` | `""` |
| Long/rich text | `"string"` + `"source": "html"` | `""` |
| True/false toggle | `"boolean"` | `false` |
| Number | `"number"` | `0` |
| URL | `"string"` | `""` |
| Image (media picker) | `"object"` with `id`, `url`, `alt` sub-attrs | see below |
| Array of items | `"array"` | `[]` |
| Color (free) | `"string"` | `""` |

Image attribute pattern:

```json
"image": {
    "type": "object",
    "default": { "id": 0, "url": "", "alt": "" }
}
```

**Supports reference (only include what's needed):**

```json
"supports": {
    "html": false,
    "align": ["wide", "full"],
    "color": { "background": true, "text": true, "gradients": true },
    "typography": { "fontSize": true, "lineHeight": true },
    "spacing": { "margin": true, "padding": true, "blockGap": true },
    "dimensions": { "minHeight": true },
    "position": { "sticky": false }
}
```

### Step 4: Generate edit.js

```js
import { __ } from '@wordpress/i18n';
import { useBlockProps{{, InnerBlocks, RichText, MediaUpload, InspectorControls}} } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
    const blockProps = useBlockProps();
    const { {{attribute_names}} } = attributes;

    return (
        <>
            {/* Inspector sidebar controls */}
            <InspectorControls>
                <PanelBody title={ __( '{{Block Name}} Settings', '{{text-domain}}' ) }>
                    {/* Controls mapped to attributes */}
                </PanelBody>
            </InspectorControls>

            {/* Block canvas */}
            <div { ...blockProps }>
                {/* Editable block content */}
            </div>
        </>
    );
}
```

**Common edit.js patterns — include only what's needed:**

| Need | Import + JSX |
|------|-------------|
| Editable heading | `RichText` with `tagName`, `value`, `onChange` |
| Editable paragraph | `RichText` with `tagName="p"` |
| Media picker (image) | `MediaUpload` + `MediaUploadCheck` |
| Nested blocks | `InnerBlocks` with optional `allowedBlocks`, `template` |
| Sidebar text field | `TextControl` inside `InspectorControls > PanelBody` |
| Sidebar toggle | `ToggleControl` inside `InspectorControls > PanelBody` |
| Color picker | `PanelColorSettings` or `useSettings` from `@wordpress/block-editor` |

### Step 5: Generate save.js (Static blocks only)

```js
import { useBlockProps{{, RichText, InnerBlocks}} } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const blockProps = useBlockProps.save();
    const { {{attribute_names}} } = attributes;

    return (
        <div { ...blockProps }>
            {/* Serialised output — must be deterministic */}
        </div>
    );
}
```

Rules for `save.js`:

- Output must be **deterministic** — same attributes always produce same HTML
- Never use `Math.random()`, `Date.now()`, or any non-deterministic value
- Never access external data — only `attributes` and `useBlockProps.save()`
- Use `RichText.Content` (not `RichText`) for rich text attributes
- Use `InnerBlocks.Content` (not `InnerBlocks`) for inner block slots

### Step 6: Generate render.php (Dynamic blocks only)

```php
<?php
/**
 * Render callback for the {{namespace}}/{{block-name}} block.
 *
 * @param array    $attributes Block attributes.
 * @param string   $content    Inner blocks content (empty for dynamic blocks with no innerBlocks).
 * @param WP_Block $block      Block object.
 */

$wrapper_attributes = get_block_wrapper_attributes();
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php
    // Block output. Escape all output.
    echo wp_kses_post( $content );
    ?>
</div>
```

Rules for `render.php`:

- Always use `get_block_wrapper_attributes()` for the wrapper — never hardcode classes/attributes
- Always escape output: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`
- Access attributes via `$attributes['attributeName'] ?? $default`
- Access context via `$block->context['{{contextKey}}']`
- Never use `$_GET`, `$_POST`, or global variables directly

### Step 7: Generate style.css and editor.css

`style.css` — loaded on frontend AND in editor:

```css
.wp-block-{{namespace}}-{{block-name}} {
    /* Base styles using theme.json custom properties only */
}
```

`editor.css` — loaded ONLY in the block editor:

```css
.wp-block-{{namespace}}-{{block-name}} {
    /* Editor-only overrides (placeholder styling, canvas adjustments) */
}
```

Rules:

- NEVER hardcode colors — use `var(--wp--preset--color--{slug})`
- NEVER hardcode font sizes — use `var(--wp--preset--font-size--{slug})`
- NEVER hardcode spacing — use `var(--wp--preset--spacing--{slug})`
- NEVER use `#id` selectors
- ALWAYS use logical CSS properties (`margin-inline-start`, not `margin-left`)

### Step 8: Generate inc/block-registration.php (if absent)

```php
<?php
/**
 * Register custom blocks.
 */
function {{theme_slug_underscored}}_register_blocks(): void {
    $blocks = array(
        '{{block-name}}',
    );

    foreach ( $blocks as $block ) {
        register_block_type( get_template_directory() . '/blocks/' . $block );
    }
}
add_action( 'init', '{{theme_slug_underscored}}_register_blocks' );
```

Add to `functions.php`:

```php
require_once get_template_directory() . '/inc/block-registration.php';
```

If `inc/block-registration.php` already exists, output only the `register_block_type()` line to add to the existing array, not the whole file.

### Step 9: Output

Deliver files with labeled headers:

```
=== FILE: {{theme-slug}}/blocks/{{block-name}}/block.json ===
=== FILE: {{theme-slug}}/blocks/{{block-name}}/edit.js ===
=== FILE: {{theme-slug}}/blocks/{{block-name}}/save.js ===          (static only)
=== FILE: {{theme-slug}}/blocks/{{block-name}}/render.php ===       (dynamic only)
=== FILE: {{theme-slug}}/blocks/{{block-name}}/style.css ===
=== FILE: {{theme-slug}}/blocks/{{block-name}}/editor.css ===
=== FILE: {{theme-slug}}/inc/block-registration.php ===             (if new)
```

After all files, provide:

**Build note:**

```
Add to vite.config.js input entries:
  '{{block-name}}-edit': 'blocks/{{block-name}}/edit.js',
  '{{block-name}}-view': 'blocks/{{block-name}}/view.js',   (if dynamic)
```

**Verification:**

```
✅ Block appears in inserter under "{{category}}" category
✅ Block renders correctly on the frontend
✅ Editor canvas matches frontend output
✅ All attributes editable in the block toolbar / Inspector sidebar
✅ No JS errors in browser console
✅ PHPCS WordPress-Extra passes on render.php (dynamic blocks)
```

## Example Invocations

```
/wp-block
I need a "Testimonial Card" block — shows a quote, author name, author title,
and optional avatar. The user can edit all text in the editor. No server-side
rendering needed.
```

```
/wp-block
Dynamic block: "Latest Projects" — fetches the 3 most recent posts in the
"project" custom post type and renders them as a responsive grid. Editor shows
a placeholder with a count control (1–6 items).
```

## Read Also

- `references/custom-blocks.md` — `block.json` schema deep-dive, advanced patterns, testing
- `references/modern-blocks.md` — Interactivity API (for adding client-side behaviour to custom blocks)
- `references/quality-rules.md` — escaping, CSS, and PHP rules that apply inside `render.php`
