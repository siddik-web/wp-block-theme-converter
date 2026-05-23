# Custom Block Development Reference

Reference for creating custom WordPress blocks inside a block theme. Read this when `/wp-block` is invoked or when a conversion requires functionality no core block can provide.

---

## Table of Contents

1. [When to Build a Custom Block](#when-to-build-a-custom-block)
2. [block.json Schema Reference](#blockjson-schema-reference)
3. [Static vs Dynamic Blocks](#static-vs-dynamic-blocks)
4. [Attributes Deep-Dive](#attributes-deep-dive)
5. [Supports Deep-Dive](#supports-deep-dive)
6. [edit.js Patterns](#editjs-patterns)
7. [save.js Rules](#savejs-rules)
8. [render.php Patterns](#renderphp-patterns)
9. [Block Context](#block-context)
10. [InnerBlocks](#innerblocks)
11. [Block Variations](#block-variations)
12. [Block Transforms](#block-transforms)
13. [Deprecations](#deprecations)
14. [Testing Custom Blocks](#testing-custom-blocks)
15. [Checklist](#checklist)

---

## When to Build a Custom Block

Custom blocks add complexity (build step, JS bundle, deprecation management). Always prefer simpler alternatives:

| Requirement | Prefer instead |
|-------------|---------------|
| Reusable layout section | Block pattern (no JS required) |
| Simple toggle / accordion | `core/details` block |
| Modal / tabs / dropdown | Interactivity API on a block pattern |
| Dynamic content (posts, products) | Query Loop block with custom template parts |
| Custom editor UI + design component | **Custom block** |
| Server-rendered with custom PHP logic | **Custom block (dynamic)** |
| Custom post type data display | **Custom block (dynamic)** |

Build a custom block only when the above alternatives genuinely do not fit.

---

## block.json Schema Reference

`block.json` is the single source of truth for block registration. WordPress reads it via `register_block_type( $path )`.

```json
{
    "$schema": "https://schemas.wp.org/trunk/block.json",
    "apiVersion": 3,
    "name": "my-theme/block-name",
    "version": "1.0.0",
    "title": "Human-Readable Name",
    "category": "theme",
    "icon": "block-default",
    "description": "One sentence describing what this block does.",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "textdomain": "my-theme",
    "attributes": {},
    "providesContext": {},
    "usesContext": [],
    "supports": {},
    "styles": [],
    "example": {},
    "style": "file:./style.css",
    "editorStyle": "file:./editor.css",
    "editorScript": "file:./edit.js",
    "viewScript": "file:./view.js",
    "render": "file:./render.php"
}
```

### Key Fields

| Field | Notes |
|-------|-------|
| `apiVersion` | Always `3` for new blocks (WP 6.3+) |
| `name` | `namespace/slug` — namespace should be theme slug |
| `category` | `text`, `media`, `design`, `widgets`, `theme`, `embed` |
| `icon` | Dashicons slug (no `dashicons-` prefix) or inline SVG string |
| `style` | `file:./style.css` — loaded on frontend + editor |
| `editorStyle` | `file:./editor.css` — editor only |
| `editorScript` | `file:./edit.js` — editor only (registers Edit component) |
| `viewScript` | `file:./view.js` — frontend only (Interactivity API or vanilla JS) |
| `render` | `file:./render.php` — dynamic blocks only; replaces `save.js` returning `null` |

### Categories

| Value | Shown under |
|-------|------------|
| `text` | Text |
| `media` | Media |
| `design` | Design |
| `widgets` | Widgets |
| `theme` | Theme |
| `embed` | Embeds |

Register a custom category in `inc/block-registration.php`:
```php
add_filter( 'block_categories_all', function( array $categories ): array {
    return array_merge(
        array(
            array(
                'slug'  => 'my-theme-blocks',
                'title' => __( 'My Theme', 'my-theme' ),
                'icon'  => null,
            ),
        ),
        $categories
    );
} );
```

---

## Static vs Dynamic Blocks

### Static Block

- Output serialised to post content as HTML
- `save.js` returns the rendered JSX
- WordPress validates saved HTML against current `save.js` on every load (use deprecations when changing)
- Best for: design components where content is author-controlled and static

### Dynamic Block

- Only attributes serialised to post content
- `render.php` (or a PHP callback) generates HTML on each request
- No `save.js` needed (`save` returns `null` or is omitted)
- Best for: data-driven content, server-side data, content that should update without re-saving posts

**Use `render` in `block.json` (WP 6.1+):**
```json
"render": "file:./render.php"
```
This is preferred over registering a `render_callback` in PHP.

---

## Attributes Deep-Dive

### Primitive Types

```json
"attributes": {
    "heading": {
        "type": "string",
        "default": ""
    },
    "isReversed": {
        "type": "boolean",
        "default": false
    },
    "columns": {
        "type": "number",
        "default": 3
    }
}
```

### Rich Text (HTML source)

```json
"content": {
    "type": "string",
    "source": "html",
    "selector": ".block-content"
}
```

Use with `RichText` in `edit.js` and `RichText.Content` in `save.js`.

### Image Attribute

```json
"image": {
    "type": "object",
    "default": {
        "id": 0,
        "url": "",
        "alt": ""
    }
}
```

Use with `MediaUpload` + `MediaUploadCheck` in `edit.js`. In `save.js`/`render.php`, output `$attributes['image']['url']` and `$attributes['image']['alt']`.

### Array of Items

```json
"items": {
    "type": "array",
    "default": [],
    "items": {
        "type": "object"
    }
}
```

Manage with `setAttributes( { items: [...items, newItem] } )` in `edit.js`.

### Sourced Attributes (read from existing HTML)

Useful when migrating classic HTML markup. WordPress parses the saved HTML to populate the attribute:

```json
"url": {
    "type": "string",
    "source": "attribute",
    "selector": "a",
    "attribute": "href"
}
```

---

## Supports Deep-Dive

`supports` unlocks built-in block editor features without custom controls.

```json
"supports": {
    "html": false,
    "align": ["wide", "full"],
    "alignWide": true,
    "anchor": true,
    "className": true,
    "color": {
        "background": true,
        "text": true,
        "gradients": true,
        "link": true
    },
    "typography": {
        "fontSize": true,
        "lineHeight": true,
        "fontWeight": true,
        "fontFamily": true
    },
    "spacing": {
        "margin": ["top", "bottom"],
        "padding": true,
        "blockGap": true
    },
    "dimensions": {
        "minHeight": true
    },
    "position": {
        "sticky": true
    },
    "interactivity": {
        "clientNavigation": true
    }
}
```

| Support | What it adds |
|---------|-------------|
| `html: false` | Removes "Edit as HTML" option — recommended for most blocks |
| `align` | Alignment toolbar (wide / full) |
| `anchor` | "HTML anchor" field in Advanced tab |
| `color.background` | Background color picker linked to theme.json palette |
| `color.gradients` | Gradient picker |
| `typography.fontSize` | Font size picker from theme.json scale |
| `spacing.padding` | Padding controls (links to theme.json spacing) |
| `spacing.blockGap` | Gap between inner blocks |
| `dimensions.minHeight` | Min-height slider |
| `interactivity.clientNavigation` | Opt-in to client-side navigation (query blocks) |

---

## edit.js Patterns

### Basic Structure

```js
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
    const blockProps = useBlockProps( {
        className: 'my-block',
    } );
    const { heading } = attributes;

    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Settings', 'my-theme' ) }>
                    <TextControl
                        label={ __( 'Heading', 'my-theme' ) }
                        value={ heading }
                        onChange={ ( value ) => setAttributes( { heading: value } ) }
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...blockProps }>
                <h2>{ heading }</h2>
            </div>
        </>
    );
}
```

### Editable Rich Text

```js
import { RichText, useBlockProps } from '@wordpress/block-editor';

<RichText
    tagName="h2"
    value={ heading }
    onChange={ ( value ) => setAttributes( { heading: value } ) }
    placeholder={ __( 'Enter heading…', 'my-theme' ) }
    allowedFormats={ [ 'core/bold', 'core/italic' ] }
/>
```

### Media Upload (Image Picker)

```js
import { MediaUpload, MediaUploadCheck, useBlockProps } from '@wordpress/block-editor';
import { Button } from '@wordpress/components';

const { image } = attributes;

<MediaUploadCheck>
    <MediaUpload
        onSelect={ ( media ) =>
            setAttributes( {
                image: { id: media.id, url: media.url, alt: media.alt },
            } )
        }
        allowedTypes={ [ 'image' ] }
        value={ image.id }
        render={ ( { open } ) => (
            <Button onClick={ open } variant="secondary">
                { image.url
                    ? __( 'Replace Image', 'my-theme' )
                    : __( 'Select Image', 'my-theme' ) }
            </Button>
        ) }
    />
</MediaUploadCheck>
{ image.url && (
    <img src={ image.url } alt={ image.alt } />
) }
```

### Block Toolbar Controls

```js
import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { alignLeft, alignRight } from '@wordpress/icons';

<BlockControls>
    <ToolbarGroup>
        <ToolbarButton
            icon={ alignLeft }
            label={ __( 'Align Left', 'my-theme' ) }
            isActive={ ! isReversed }
            onClick={ () => setAttributes( { isReversed: false } ) }
        />
        <ToolbarButton
            icon={ alignRight }
            label={ __( 'Align Right', 'my-theme' ) }
            isActive={ isReversed }
            onClick={ () => setAttributes( { isReversed: true } ) }
        />
    </ToolbarGroup>
</BlockControls>
```

---

## save.js Rules

- Output must be **purely deterministic** — same attributes → same HTML, every time
- Spread `useBlockProps.save()` onto the wrapper element
- Use `RichText.Content` for rich text attributes (not `RichText`)
- Use `InnerBlocks.Content` for inner block slots (not `InnerBlocks`)
- Never read from external state, global variables, or `window`
- Never conditionally render based on anything other than attributes

```js
import { useBlockProps, RichText, InnerBlocks } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    const blockProps = useBlockProps.save();
    const { heading, content } = attributes;

    return (
        <div { ...blockProps }>
            <RichText.Content tagName="h2" value={ heading } />
            <RichText.Content tagName="p" value={ content } />
            <InnerBlocks.Content />
        </div>
    );
}
```

---

## render.php Patterns

### Basic Template

```php
<?php
$wrapper_attributes = get_block_wrapper_attributes(
    array( 'class' => 'my-extra-class' )
);
$heading = isset( $attributes['heading'] ) ? $attributes['heading'] : '';
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <h2><?php echo esc_html( $heading ); ?></h2>
    <?php echo wp_kses_post( $content ); ?>
</div>
```

### WP_Query Inside render.php

```php
<?php
$count   = isset( $attributes['count'] ) ? absint( $attributes['count'] ) : 3;
$post_type = isset( $attributes['postType'] ) ? sanitize_key( $attributes['postType'] ) : 'post';

$query = new WP_Query( array(
    'post_type'      => $post_type,
    'posts_per_page' => $count,
    'post_status'    => 'publish',
    'no_found_rows'  => true,
) );

$wrapper_attributes = get_block_wrapper_attributes();
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php if ( $query->have_posts() ) : ?>
        <ul class="posts-list">
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>
                <li>
                    <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                </li>
            <?php endwhile; wp_reset_postdata(); ?>
        </ul>
    <?php else : ?>
        <p><?php esc_html_e( 'No posts found.', 'my-theme' ); ?></p>
    <?php endif; ?>
</div>
```

### REST API Data in render.php

Avoid direct REST calls inside `render.php`; use `WP_Query` or WordPress data functions instead. If you must call the REST API, do so client-side using `view.js` with `wp_interactivity_state()` to pass initial state from the server:

```php
// In render.php — pass server state to Interactivity API
wp_interactivity_state( 'my-theme', array(
    'items' => $items,
) );
```

---

## Block Context

Share data between a parent block and its inner blocks without prop-drilling.

### Parent block — provide context

In `block.json`:
```json
"providesContext": {
    "my-theme/columnCount": "columns"
}
```

### Child block — consume context

In `block.json`:
```json
"usesContext": ["my-theme/columnCount"]
```

In `edit.js`:
```js
export default function Edit( { context } ) {
    const { 'my-theme/columnCount': columnCount } = context;
    // ...
}
```

In `render.php`:
```php
$column_count = isset( $block->context['my-theme/columnCount'] )
    ? absint( $block->context['my-theme/columnCount'] )
    : 3;
```

---

## InnerBlocks

Allow other blocks to be nested inside your custom block.

### Basic Usage

```js
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';

const ALLOWED_BLOCKS = [ 'core/paragraph', 'core/heading', 'core/image' ];
const TEMPLATE = [
    [ 'core/heading', { level: 2, placeholder: 'Enter heading…' } ],
    [ 'core/paragraph', { placeholder: 'Enter description…' } ],
];

export default function Edit() {
    const blockProps = useBlockProps();
    return (
        <div { ...blockProps }>
            <InnerBlocks
                allowedBlocks={ ALLOWED_BLOCKS }
                template={ TEMPLATE }
                templateLock={ false }
            />
        </div>
    );
}
```

`templateLock` values:
- `false` — authors can add/remove/reorder blocks freely
- `"insert"` — authors can edit existing blocks but not add or remove
- `"all"` — authors can only edit content, not structure
- `"contentOnly"` — authors can only edit text/media content

In `save.js`:
```js
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
export default function save() {
    return <div { ...useBlockProps.save() }><InnerBlocks.Content /></div>;
}
```

---

## Block Variations

Register pre-configured instances of your block (e.g., different layout presets):

```js
import { registerBlockVariation } from '@wordpress/blocks';

registerBlockVariation( 'my-theme/card', {
    name: 'horizontal-card',
    title: __( 'Horizontal Card', 'my-theme' ),
    description: __( 'Card with image on the left', 'my-theme' ),
    attributes: { isReversed: false, layout: 'horizontal' },
    isDefault: false,
    scope: [ 'inserter', 'transform' ],
} );
```

Register in `edit.js` or a separate `variations.js` (add to `editorScript` array in `block.json`).

---

## Block Transforms

Allow conversion between your block and core blocks:

```js
import { createBlock } from '@wordpress/blocks';

transforms: {
    from: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) =>
                createBlock( 'my-theme/callout', { content } ),
        },
    ],
    to: [
        {
            type: 'block',
            blocks: [ 'core/paragraph' ],
            transform: ( { content } ) =>
                createBlock( 'core/paragraph', { content } ),
        },
    ],
},
```

Register in the `registerBlockType` call in `edit.js` or `index.js`.

---

## Deprecations

When `save.js` output changes, add a deprecation entry so WordPress can migrate existing saved content:

```js
import { useBlockProps } from '@wordpress/block-editor';

const deprecated = [
    {
        attributes: {
            // OLD attribute shape
            text: { type: 'string', default: '' },
        },
        save( { attributes } ) {
            // OLD save output
            return (
                <div { ...useBlockProps.save() }>
                    <p>{ attributes.text }</p>
                </div>
            );
        },
        migrate( attributes ) {
            // Transform old attributes to new shape
            return { heading: attributes.text };
        },
    },
];

export default deprecated;
```

Pass `deprecated` to `registerBlockType`:
```js
import deprecated from './deprecated';
registerBlockType( metadata, { edit: Edit, save, deprecated } );
```

**Never change `save.js` without adding a deprecation entry.** Doing so will cause block validation errors for all existing instances.

---

## Testing Custom Blocks

### Manual Verification Checklist

```
✅ Block appears in the inserter under the correct category
✅ Block can be inserted and removed without errors
✅ All attributes editable in the Editor (sidebar controls + toolbar)
✅ save.js / render.php output is correct on the frontend
✅ Block validation passes (no "Block contains unexpected content" error)
✅ No JS errors in browser console (editor and frontend)
✅ Block renders correctly in wide and full alignment
✅ Keyboard navigation works (Tab, Enter, Arrow keys) inside the editor
✅ render.php escapes all output — WP_DEBUG shows no PHP notices
✅ PHPCS WordPress-Extra passes on render.php
```

### Automated Testing

For blocks with complex `save.js`:

```js
// tests/save.test.js
import { serialize } from '@wordpress/blocks';
import { registerBlockType, unregisterBlockType } from '@wordpress/blocks';
import metadata from '../block.json';
import save from '../save';

describe( 'save output', () => {
    beforeAll( () => registerBlockType( metadata, { save } ) );
    afterAll( () => unregisterBlockType( metadata.name ) );

    it( 'matches snapshot', () => {
        const block = { name: metadata.name, attributes: { heading: 'Test' }, innerBlocks: [] };
        expect( serialize( block ) ).toMatchSnapshot();
    } );
} );
```

Run with `npx jest`.

---

## Checklist

Before marking a custom block complete:

- [ ] `block.json` has `$schema`, `apiVersion: 3`, `name`, `title`, `textdomain`
- [ ] `block.json` uses `file:` references for all script/style assets
- [ ] `edit.js` spreads `useBlockProps()` on the wrapper
- [ ] `save.js` spreads `useBlockProps.save()` on the wrapper (static blocks)
- [ ] `render.php` uses `get_block_wrapper_attributes()` (dynamic blocks)
- [ ] All PHP output is escaped (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`)
- [ ] All CSS uses `var(--wp--preset--*)` — no hardcoded values
- [ ] All CSS uses logical properties (no `margin-left`, `padding-right`, etc.)
- [ ] All user-facing strings in `edit.js` use `__()` with the correct textdomain
- [ ] All user-facing strings in `render.php` use `esc_html__()` / `esc_html_e()`
- [ ] `block.json` does not include unused attributes or supports
- [ ] Deprecation entry added if `save.js` was changed from a previous version
- [ ] Block registered via `register_block_type( path_to_block_json_dir )` — not manual PHP registration
- [ ] Block removed from `inc/block-registration.php` loop if block is removed from theme
