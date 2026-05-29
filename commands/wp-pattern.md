---
description: Convert a single HTML section or snippet into a registered WordPress block pattern PHP file.
---

# /wp-pattern

**Purpose:** Convert a single HTML section/snippet into a registered WordPress block pattern PHP file.

## Trigger

User types `/wp-pattern` followed by HTML markup, OR pastes HTML and asks for a pattern.

## Workflow

### Step 1: Identify Pattern Metadata

From the HTML, infer:

- **Pattern name** — descriptive (e.g., "Hero with CTA", "Three-Column Features")
- **Pattern slug** — kebab-case (e.g., "hero-with-cta")
- **Category** — choose from: featured, hero, header, footer, gallery, posts, products, services, testimonials, contact, pricing, faq, team, cta
- **Keywords** — 3-5 search keywords
- **Theme slug** — ask if not in conversation context (default: "my-theme")
- **Text domain** — same as theme slug
- **Block Types** — controls where the pattern appears in the inserter. Pick from:

| Pattern context | Block Types value |
|-----------------|-------------------|
| General page content (hero, CTA, features, etc.) | `core/post-content` |
| Inside a Query Loop (post card, archive item) | `core/query` |
| WooCommerce product grid item | `woocommerce/product-template` |
| WooCommerce single product | `woocommerce/product-details` |
| Header / navigation patterns | `core/template-part/header` |
| Footer patterns | `core/template-part/footer` |
| No specific insertion context (general-purpose) | Omit the line entirely |

### Step 2: Convert HTML to Block Markup

Apply the conversion map from `references/block-conversion-map.md`. Key rules:

1. Wrap top-level in `<!-- wp:group {"layout":{"type":"constrained"}} -->` unless the section needs full-width
2. Convert each HTML element to its block equivalent (see map)
3. Replace hardcoded colors with `var(--wp--preset--color--{slug})` references
4. Replace hardcoded font sizes with preset references
5. Convert all user-facing strings to `<?php esc_html_e( 'string', 'text-domain' ); ?>`
6. Convert all asset paths to `<?php echo esc_url( get_template_directory_uri() ); ?>/assets/...`
7. NEVER include inline `<style>` or `<script>` tags
8. NEVER include inline `style=""` attributes — use block attributes instead

### Step 3: Build the Pattern File

Use this exact structure (template at `templates/pattern-header.php.tpl`):

```php
<?php
/**
 * Title: {{Pattern Name}}
 * Slug: {{theme-slug}}/{{pattern-slug}}
 * Categories: {{category}}, featured
 * Keywords: {{keyword1}}, {{keyword2}}, {{keyword3}}
 * Viewport Width: 1400
 * Block Types: {{BLOCK_TYPE}}
 * Description: {{One-line description of the pattern}}
 */
?>
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
    <!-- converted block markup here -->
</div>
<!-- /wp:group -->
```

### Step 4: Output

Provide:

1. **The pattern file** in a single code block, labeled with its file path:

   ```
   === FILE: {{theme-slug}}/patterns/{{pattern-slug}}.php ===
   ```

2. **Registration snippet** (if pattern category is custom) for `inc/block-patterns.php`:

   ```php
   register_block_pattern_category(
       '{{theme-slug}}-{{category}}',
       array( 'label' => __( '{{Category Label}}', '{{text-domain}}' ) )
   );
   ```

3. **CSS additions** (if any custom classes were used) for `assets/css/style.css`:

   ```css
   .wp-block-group.is-style-{{custom-style}} {
       /* styles */
   }
   ```

   AND mirror them in `assets/css/editor.css`.

4. **Usage note** — explain how the user can insert the pattern in Site Editor:
   > In Site Editor, click + → Patterns → search "{{Pattern Name}}" → click to insert.

### Step 5: Style Variation Detection

If the HTML uses a clearly distinctive style (glassmorphism, brutalist, neon, etc.), suggest registering it as a block style variation:

```markdown
This pattern has a distinctive **{{style-name}}** look. Consider registering it as a block style variation so users can apply the same look to other Group blocks:

Add to `inc/block-styles.php`:
\`\`\`php
register_block_style(
    'core/group',
    array(
        'name'  => '{{style-name}}',
        'label' => __( '{{Style Label}}', '{{text-domain}}' ),
    )
);
\`\`\`
```

## Example Invocation

```
User: /wp-pattern

<section class="hero">
  <h1>Welcome to Acme</h1>
  <p>The best widgets in town.</p>
  <a href="/shop" class="btn-primary">Shop Now</a>
</section>
```

→ Claude produces a complete `hero.php` pattern file with proper block markup, theme.json color references, and i18n strings.
