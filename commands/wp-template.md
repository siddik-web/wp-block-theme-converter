# /wp-template

**Purpose:** Convert a single HTML page into a WordPress FSE template (`.html` file in the theme's `templates/` directory).

## Trigger

User types `/wp-template` followed by an HTML page or URL.

## Workflow

### Step 1: Identify Template Type

From the HTML structure and content, determine which WordPress template to generate:

| HTML Page Pattern | Template File | Notes |
|-------------------|---------------|-------|
| Homepage / landing | `front-page.html` | Static front page |
| Blog index / news listing | `home.html` | Latest posts |
| Single blog post / article | `single.html` | Uses `core/post-content` |
| About / Contact / static page | `page.html` OR `page-{slug}.html` | Custom = registered in theme.json |
| Category / tag / author archive | `archive.html` | Uses Query Loop |
| Search results | `search.html` | |
| 404 page | `404.html` | |
| Generic fallback | `index.html` | Required — every theme needs this |
| WooCommerce single product | `single-product.html` | Requires WC |
| WooCommerce product archive | `archive-product.html` | Requires WC |

If unsure, ask: *"Is this the homepage, a blog post layout, a static page, or something else?"*

### Step 2: Identify Shared Regions

Look for `<header>`, `<footer>`, sidebars. These should be extracted into template parts and referenced via:

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->
<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
<!-- wp:template-part {"slug":"sidebar","tagName":"aside"} /-->
```

If template parts don't exist yet, generate them too and note that they go in `parts/` not `templates/`.

### Step 3: Convert Body to Block Markup

Apply the conversion map from `references/block-conversion-map.md`. Key rules:

1. Wrap main content area in `<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->`
2. For `single.html` and `page.html`, use `<!-- wp:post-content /-->` for the editable content area
3. For `home.html` / `archive.html`, use `<!-- wp:query -->` (Query Loop) instead of hardcoded post markup
4. For repeating sections, use `<!-- wp:pattern {"slug":"theme-slug/pattern-name"} /-->`
5. Convert color classes to block attributes: `class="text-primary"` → `{"textColor":"primary"}`
6. Convert font sizes similarly: `class="text-xl"` → `{"fontSize":"large"}`
7. NEVER include `<style>` or `<script>` tags
8. NEVER include `style=""` attributes — use block attributes

### Step 4: Template Structure

A complete template follows this skeleton (from `templates/template-skeleton.html.tpl`):

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">

    <!-- Page content here -->

</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

### Step 5: Custom Template Registration (if needed)

If generating `page-{slug}.html` (custom page template), it MUST be registered in `theme.json`:

```json
"customTemplates": [
  {
    "name": "page-about",
    "title": "About Page",
    "postTypes": ["page"]
  }
]
```

Provide this snippet for the user to add to their theme.json.

### Step 6: Output

Provide:

1. **The template file:**

   ```
   === FILE: {{theme-slug}}/templates/{{template-name}}.html ===
   ```

2. **Any new template parts** (if extracted):

   ```
   === FILE: {{theme-slug}}/parts/header.html ===
   === FILE: {{theme-slug}}/parts/footer.html ===
   ```

3. **theme.json additions** (if custom template or new parts):

   ```json
   "templateParts": [...],
   "customTemplates": [...]
   ```

4. **Patterns generated** — list any sections that became patterns and offer to generate them with `/wp-pattern`

5. **Site Editor instructions:**
   > In WordPress Admin → Appearance → Editor → Templates → you should now see "{{Template Name}}". Open and customize as needed.

## Example Invocation

```
User: /wp-template

[Pastes the HTML for a "Pricing" page]
```

→ Claude identifies it as a custom page template (`page-pricing.html`), extracts the header/footer references, converts the pricing tiers section into a pattern reference, and provides the complete template plus theme.json registration snippet.
