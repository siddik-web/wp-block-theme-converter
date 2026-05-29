# Block Theme Troubleshooting Reference

Comprehensive symptom → cause → fix reference for WordPress block theme development. Use this alongside `/wp-debug` for guided diagnosis, or read directly when you know what you are looking for.

---

## Table of Contents

1. [Quick Reference Table](#quick-reference-table)
2. [Deep Dives](#deep-dives)
   - [Block Validation Errors](#block-validation-errors)
   - [theme.json Silent Failures](#themejson-silent-failures)
   - [Patterns Not Showing](#patterns-not-showing)
   - [DB Template Overrides File](#db-template-overrides-file)
   - [Invalid Block-Support PHP Warnings](#invalid-block-support-php-warnings)
   - [Assets Not Loading / Cache Issues](#assets-not-loading--cache-issues)
   - [Editor Parity Gap](#editor-parity-gap)
   - [Classic-to-Block Conversion Artifacts](#classic-to-block-conversion-artifacts)
   - [PHP Fatal Error on Theme Activation](#php-fatal-error-on-theme-activation)
   - [Required Stylesheet Missing](#required-stylesheet-missing)
   - [Patterns Registering but Showing Wrong Content](#patterns-registering-but-showing-wrong-content)
   - [RTL Layout Broken](#rtl-layout-broken)
   - [Block Styles Not Applying](#block-styles-not-applying)
3. [The "Nothing Works" Flowchart](#the-nothing-works-flowchart)
4. [WP-CLI Quick Commands](#wp-cli-quick-commands)
5. [Environment Checklist](#environment-checklist)

---

## Quick Reference Table

| Symptom | Root Cause | Fix (one-liner) |
|---------|-----------|----------------|
| "This block contains unexpected or invalid content" | Block serialization mismatch — saved HTML no longer matches the block schema | Click "Attempt Block Recovery" in the editor, or delete the `wp_template` DB record via WP-CLI |
| Blank page after editing a block | Block validation error causing a render crash | Open post, use Block Recovery prompt, or switch to Classic block and rebuild |
| Color palette missing or showing defaults | `theme.json` JSON syntax error or stale transient cache | Fix JSON, run `wp cache flush && wp transient delete --all` |
| Styles not applying (colors, fonts, spacing) | `theme.json` silent failure or `defaultPalette` not set to `false` | Validate JSON, set `settings.color.defaultPalette: false`, flush caches |
| Typography settings ignored | `fontFace` `src` paths don't match deployed files, or wrong WP version | Verify font files exist, check WP version supports theme.json v3 |
| Pattern not in inserter | Malformed file header — missing `Title:` or `Slug:` field | Fix file header; `Slug` must be `namespace/name` format |
| Pattern category has 0 patterns | Category registered after patterns, or pattern references unregistered category | Register category on `init` before pattern files load |
| "I edited the .html file but nothing changed" | Database `wp_template` record shadows the theme file | Site Editor → three-dot menu → "Reset to default", or `wp post delete <ID> --force` |
| Site Editor edits persist after reverting file | `wp_template` DB override still present | Delete the DB record: `wp post list --post_type=wp_template` then `wp post delete <ID> --force` |
| PHP notices on front end, no editor error | Block render callback accesses undefined attribute key | Add `?? ''` null-coalescing fallback to all `$attributes['key']` accesses |
| 404 on CSS/JS assets after deploy | Asset not deployed, or hardcoded path in `wp_enqueue_*` call | Deploy asset files; replace hardcoded paths with `get_template_directory_uri()` |
| Styles missing after caching plugin enabled | CDN or page cache serving stale asset URLs | Purge cache; use `filemtime()` version parameter in enqueue calls |
| Looks right on front end, wrong in editor | `editor.css` missing or not registered with `add_editor_style()` | Register `editor.css` in `after_setup_theme`; mirror visual styles from `style.css` |
| Looks right in editor, wrong on front end | CSS registered only via `add_editor_style()` and not `wp_enqueue_scripts` | Use `wp_enqueue_block_style()` to load styles in both contexts automatically |
| Shortcodes show as literal text `[tag]` | Theme switched without verifying shortcode plugin is active, or `do_shortcode` filter removed | Confirm plugin is active; add `add_filter('the_content','do_shortcode',11)` if bypassed |
| ACF field value not appearing in block | Meta key not registered with `show_in_rest: true`, or Block Bindings source not registered | Register meta with `register_post_meta()` and `show_in_rest: true` |
| Widget HTML visible as raw markup | Old `dynamic_sidebar()` call still in a template part | Replace with block markup equivalent; remove sidebar registration from `functions.php` |
| PHP Fatal error on theme activation | Missing PHP file, syntax error, or calling undefined function at include time | Check `debug.log`; run `php -l` on all PHP files; verify `require_once` paths |
| "Required stylesheet is missing" error | `style.css` missing or `Theme Name:` header absent or malformed | Ensure `style.css` exists at theme root with valid header |
| Pattern shows but displays wrong content | Slug collision with another theme or plugin pattern | Change pattern slug in file header to a unique namespace |
| RTL layout broken | Missing `rtl.css` or using physical CSS properties (`margin-left`) instead of logical ones | Add `rtl.css`; replace physical with logical properties (`margin-inline-start`) |
| Block styles (`.is-style-*`) not applying | `register_block_style()` called too late, or CSS class missing from stylesheet | Register block styles on `init`; add matching `.wp-block-*--style-name` CSS |

---

## Deep Dives

---

### Block Validation Errors

#### How WordPress Processes Block Content

WordPress stores post and template content as serialized HTML block comments:

```html
<!-- wp:paragraph {"dropCap":true} -->
<p class="has-drop-cap">Your text here.</p>
<!-- /wp:paragraph -->
```

Every time the block editor opens a post, it parses these comments and reconstructs the block tree. Then it re-serializes the block tree using the block type's `save()` function and compares the result to the stored HTML. If they differ — even by a single attribute or an extra space in specific positions — the block is marked "invalid."

This comparison is intentionally strict to prevent silent data corruption from stale or incompatible block versions.

#### Step-by-Step Diagnosis

1. Open the post/template in the block editor. Note the exact error text.
2. Open browser DevTools → Console. Look for:
   ```
   Block validation: Block type "core/..." is not registered.
   Block validation: Expected attribute ... but received ...
   ```
3. Identify if this happened after a WordPress core update or plugin update:
   ```bash
   # Check WP version
   wp core version

   # Check recent update history
   wp core check-update
   ```
4. Identify which post/template is affected:
   ```bash
   wp post list --post_type=post,page,wp_template,wp_template_part \
     --format=table --fields=ID,post_type,post_name,post_modified
   ```
5. Check the raw content for broken block comments:
   ```bash
   wp post get <POST_ID> --field=post_content | grep -n "wp:"
   ```

#### Step-by-Step Fix

**Fix A — Block Recovery (for individual posts):**
1. Open the post in the block editor.
2. Click "Attempt Block Recovery" in the error banner.
3. Verify the block renders correctly.
4. Save. WordPress re-serializes to the current schema.

**Fix B — Delete DB template override (for `wp_template` only):**
```bash
# Find the record
wp post list --post_type=wp_template --format=table --fields=ID,post_name

# Delete it — WordPress will fall back to the theme file
wp post delete <POST_ID> --force
```

**Fix C — Programmatic re-save for bulk block validation errors:**
```php
<?php
// Run via: wp eval-file fix-block-validation.php
// Re-saves all posts to trigger block re-serialization.
// Only do this if you are confident the current block schema is correct.

$posts = get_posts( array(
    'post_type'      => 'post',
    'posts_per_page' => -1,
    'post_status'    => array( 'publish', 'draft' ),
) );

foreach ( $posts as $post ) {
    if ( ! has_blocks( $post->post_content ) ) {
        continue;
    }
    $result = wp_update_post( array(
        'ID'           => $post->ID,
        'post_content' => $post->post_content,
    ) );
    if ( is_wp_error( $result ) ) {
        WP_CLI::warning( "Failed to update post {$post->ID}: " . $result->get_error_message() );
    } else {
        WP_CLI::success( "Re-saved post {$post->ID}: {$post->post_title}" );
    }
}
```

#### Known Variations and Edge Cases

- **Copy-paste across sites:** Copying block HTML from a site running a different WordPress version or with different plugins active is the most common cause. Each site may have different block API versions registered.
- **Custom block API version change:** If you change `apiVersion` in `block.json` from 2 to 3, existing saved content may fail validation. Re-save all posts using that block after the version change.
- **`<!-- wp:block -->` (reusable blocks):** A reusable block that is itself invalid causes all posts embedding it to fail. Fix the reusable block first, then check if referencing posts recover automatically.
- **Multisite:** Block namespaces must be consistent across the network. A block registered only on certain subsites will cause validation errors on others.

---

### theme.json Silent Failures

#### How WordPress Processes theme.json

WordPress loads `theme.json` via `WP_Theme_JSON_Resolver`. The file is parsed, merged with WordPress's own `default` and `blocks` data, and the result is cached as transients:

- `_wp_theme_json_global_styles` — merged theme + user-customized styles
- `_wp_theme_json_theme` — the raw theme.json data

When the file contains a JSON syntax error, PHP's `json_decode()` returns `null` and WordPress silently falls back to defaults. When a key is unrecognized (e.g., a feature added in WP 6.6 used on WP 6.4), that key is silently ignored. No error is logged to `debug.log` by default — this is a known developer pain point.

#### Step-by-Step Diagnosis

1. Validate JSON syntax:
   ```bash
   php -r "
   \$json = file_get_contents('theme.json');
   json_decode(\$json);
   echo json_last_error() === JSON_ERROR_NONE
       ? 'Valid JSON' . PHP_EOL
       : 'Error: ' . json_last_error_msg() . PHP_EOL;
   "
   ```

2. Validate against the official schema (requires Node.js):
   ```bash
   # Install ajv-cli if not already installed
   npm install -g ajv-cli ajv-formats

   npx ajv validate \
     --spec=draft2019 \
     -s https://schemas.wp.org/trunk/theme.json \
     -d theme.json
   ```

3. Flush transient cache and reload:
   ```bash
   wp cache flush
   wp transient delete --all
   ```
   Hard reload the page in the browser (Ctrl+Shift+R / Cmd+Shift+R).

4. Check which CSS custom properties WordPress is generating. In browser DevTools → Elements, look in `<head>` for:
   ```css
   :root {
       --wp--preset--color--primary: #...;
   }
   ```
   If your slugs are missing, the palette section failed to parse.

5. Verify the theme.json `version` is supported by the installed WordPress:
   ```bash
   wp core version
   # theme.json version 3 → requires WordPress 6.6+
   # theme.json version 2 → requires WordPress 6.0+
   # theme.json version 1 → deprecated since WordPress 6.0
   ```

#### Step-by-Step Fix

1. **Fix JSON syntax.** Most common mistakes:
   - Trailing comma after the last array/object item (not valid JSON, only valid in JS)
   - Single quotes instead of double quotes around keys or string values
   - Missing comma between adjacent properties
   - Unescaped backslash in font `src` paths (use `\\/` or forward slashes)

2. **Correct structure for color palette:**
   ```json
   {
       "$schema": "https://schemas.wp.org/trunk/theme.json",
       "version": 3,
       "settings": {
           "color": {
               "defaultPalette": false,
               "defaultGradients": false,
               "palette": [
                   { "slug": "primary",    "color": "#1a1a2e", "name": "Primary" },
                   { "slug": "secondary",  "color": "#e94560", "name": "Secondary" },
                   { "slug": "background", "color": "#ffffff", "name": "Background" },
                   { "slug": "foreground", "color": "#0f0f0f", "name": "Foreground" }
               ]
           }
       }
   }
   ```

3. **Correct structure for typography with local fonts:**
   ```json
   "settings": {
       "typography": {
           "fontFamilies": [
               {
                   "fontFamily": "'Inter', sans-serif",
                   "slug": "body",
                   "name": "Body",
                   "fontFace": [
                       {
                           "fontFamily": "Inter",
                           "fontWeight": "400",
                           "fontStyle": "normal",
                           "fontStretch": "normal",
                           "src": [ "file:./assets/fonts/inter-regular.woff2" ]
                       }
                   ]
               }
           ]
       }
   }
   ```
   The `src` path must use `file:./` prefix and point to a file that actually exists relative to the theme root.

4. Flush caches after every `theme.json` edit during development:
   ```bash
   wp transient delete --all && wp cache flush
   ```

#### Known Variations and Edge Cases

- **User customizations override theme.json:** The "Additional CSS" added in Appearance → Customize, or Global Styles overrides set in the Site Editor, are stored separately and can overwrite theme.json values. To test theme.json in isolation, temporarily reset Global Styles: Appearance → Editor → Styles → three-dot menu → "Reset to defaults".
- **Child theme merging:** If a child theme has its own `theme.json`, it merges with the parent's. A JSON error in the child theme `theme.json` silently breaks only the child theme settings, making diagnosis confusing.
- **Block-level overrides:** `theme.json` can define per-block settings under `"blocks": { "core/button": { ... } }`. These are subject to the same silent-fail behavior.

---

### Patterns Not Showing

#### How WordPress Processes Pattern Files

Since WordPress 6.0, themes can place PHP files in a `patterns/` directory. WordPress automatically discovers them via `_register_theme_block_patterns()`, which runs on `init` at priority 9. The file must contain a PHP comment block (the "file header") at the top. WordPress reads specific fields from this header using `get_file_data()`.

Required fields: `Title`, `Slug`
Optional fields: `Description`, `Categories`, `Keywords`, `Viewport Width`, `Block Types`, `Post Types`, `Inserter`

If any required field is missing, or if the `Slug` is already registered by another pattern, the pattern is silently skipped.

#### Step-by-Step Diagnosis

1. Check the exact file header format:
   ```php
   <?php
   /**
    * Title: Hero Section
    * Slug: my-theme/hero
    * Categories: my-theme-sections
    * Description: Full-width hero with headline and CTA
    * Keywords: hero, banner, header
    * Viewport Width: 1280
    */
   ```
   Common mistakes: the comment block uses `//` instead of `/** */`, the field name has a typo (`Slugg` instead of `Slug`), or the file starts with a BOM character.

2. Check for PHP syntax errors:
   ```bash
   php -l patterns/hero.php
   ```

3. Verify there are no duplicate slugs:
   ```bash
   grep -r "^\s*\* Slug:" patterns/ | awk -F': ' '{print $2}' | sort | uniq -d
   ```
   Any output indicates duplicate slugs — each must be unique.

4. List all patterns currently registered in WordPress:
   ```bash
   wp eval '
   $patterns = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
   foreach ( $patterns as $p ) {
       echo $p["slug"] . "\t" . $p["title"] . PHP_EOL;
   }
   ' | grep "my-theme"
   ```

5. Verify the referenced categories are registered:
   ```bash
   wp eval '
   $cats = WP_Block_Pattern_Categories_Registry::get_instance()->get_all_registered();
   foreach ( $cats as $c ) {
       echo $c["name"] . PHP_EOL;
   }
   '
   ```
   If `my-theme-sections` is missing from the output, the category registration is failing or running too late.

#### Step-by-Step Fix

1. Fix the file header if malformed. The header comment must be the very first thing in the file after `<?php`.

2. If a referenced category does not exist, register it explicitly:
   ```php
   // In functions.php or inc/patterns.php
   add_action( 'init', function(): void {
       register_block_pattern_category(
           'my-theme-sections',
           array( 'label' => __( 'My Theme Sections', 'my-theme' ) )
       );
   }, 5 ); // Priority 5 — before WordPress's priority 9 pattern auto-discovery
   ```

3. If you have a slug collision with a plugin pattern, choose a different namespace:
   ```
   // Instead of: my-theme/hero
   // Use: my-theme-v2/hero or rename: my-theme/main-hero
   ```

4. To temporarily hide a pattern from the inserter while debugging, set `Inserter: no` in the header:
   ```php
   /**
    * Title: WIP Pattern
    * Slug: my-theme/wip-pattern
    * Inserter: no
    */
   ```

#### Known Variations and Edge Cases

- **Multisite pattern conflicts:** On a multisite install, patterns registered on the main site may conflict with sub-site patterns sharing the same slug.
- **Pattern parts using `<!-- wp:pattern -->`:** A pattern that embeds another pattern via `<!-- wp:pattern {"slug":"my-theme/missing-pattern"} /-->` renders as an empty block if the referenced pattern is not registered. No error is shown.
- **Synced patterns (reusable blocks):** These are stored in the database as `wp_block` post type records, not as theme files. They are not affected by the file header discovery mechanism.
- **`Block Types` header field:** Listing a block type in this field (e.g., `Block Types: core/post-content`) causes the pattern to appear as a transform option for that block. Listing a non-existent block type causes silent failure on some WP versions.

---

### DB Template Overrides File

#### How WordPress Resolves Templates

WordPress uses a layered template resolution system for block themes. When rendering a request, it checks in this order:

1. **User customizations** — `wp_template` / `wp_template_part` records in the database (created by Site Editor edits)
2. **Theme files** — `templates/*.html` and `parts/*.html` in the active theme directory
3. **Parent theme files** — if a child theme is active
4. **WordPress fallbacks** — `templates/index.html` is the final fallback

When a user edits a template in the Site Editor and saves, WordPress creates a `wp_template` CPT record. From that point on, the file is shadowed — developer edits to the `.html` file have no effect until the DB record is deleted.

#### Step-by-Step Diagnosis

1. List all database template overrides:
   ```bash
   wp post list \
     --post_type=wp_template \
     --format=table \
     --fields=ID,post_name,post_status,post_modified \
     --orderby=post_modified \
     --order=DESC
   ```

2. List all template part overrides:
   ```bash
   wp post list \
     --post_type=wp_template_part \
     --format=table \
     --fields=ID,post_name,post_status,post_modified
   ```

3. Compare the DB content to the file content:
   ```bash
   # DB version
   wp post get <POST_ID> --field=post_content

   # File version (replace with actual template name)
   cat wp-content/themes/my-theme/templates/front-page.html
   ```

4. In the Site Editor UI: Appearance → Editor → Templates. Look for a "Modified" indicator or a pencil icon — these mark templates with DB overrides.

#### Step-by-Step Fix

**Via Site Editor (no CLI, safer for editors):**
1. Appearance → Editor → Templates (or Template Parts).
2. Click the template name.
3. Open the three-dot menu (⋮) in the top-right.
4. Click "Reset to default".
5. Confirm the reset. The DB record is deleted.

**Via WP-CLI (faster for developers):**
```bash
# Reset a specific template
wp post delete $(wp post list --post_type=wp_template --post_name=front-page --format=ids) --force

# Reset a specific template part
wp post delete $(wp post list --post_type=wp_template_part --post_name=header --format=ids) --force

# Reset ALL template overrides (DESTRUCTIVE — use only if no intentional customizations exist)
wp post delete $(wp post list --post_type=wp_template --format=ids) --force
wp post delete $(wp post list --post_type=wp_template_part --format=ids) --force
```

**Export Site Editor customizations to files (preserve intended edits):**
If the Site Editor has legitimate customizations you want to keep, export them to your theme files before deleting:
```bash
# Export templates to theme directory
wp post list --post_type=wp_template --format=json | \
  php -r '
    $posts = json_decode(file_get_contents("php://stdin"), true);
    foreach ($posts as $p) {
        file_put_contents("templates/{$p["post_name"]}.html", $p["post_content"]);
        echo "Wrote templates/{$p["post_name"]}.html\n";
    }
  '
```
After exporting, delete the DB records so the file versions are used.

#### Known Variations and Edge Cases

- **`wp_template` `post_status`:** Database templates can have `publish` or `auto-draft` status. Auto-draft means a template was started but not saved. These still shadow the file — delete them the same way.
- **Theme switching:** When switching themes, WordPress deletes `wp_template` records whose `theme` meta does not match the active theme. However, if you rename a theme slug, existing records are orphaned and remain in the database as `auto-draft` records attached to the old slug.
- **Child themes:** A child theme's `wp_template` records only shadow child theme files, not parent theme files. If you switch from a parent to a child theme, parent theme DB records are no longer active.

---

### Invalid Block-Support PHP Warnings

#### How WordPress Processes Block Supports

Block supports (declared in `block.json` under `"supports"`) are processed by `WP_Block_Supports`. During server-side rendering, WordPress calls the block's `render_callback` (or `render.php` file) and passes `$attributes` — an array built from the block's parsed comment attributes. WordPress also applies "layout", "color", "spacing" etc. by wrapping the render output or injecting classes/styles.

If the render callback reads an attribute that was not saved in the comment (because the block was saved without that attribute set), the key is absent from `$attributes`. PHP 8+ throws a `TypeError` or `Warning` on direct array access; PHP 7 returns null or triggers a notice.

#### Step-by-Step Diagnosis

1. Enable debug logging temporarily:
   ```php
   // wp-config.php
   define( 'WP_DEBUG',         true  );
   define( 'WP_DEBUG_LOG',     true  );
   define( 'WP_DEBUG_DISPLAY', false );
   ```

2. Load the affected page and read the log:
   ```bash
   tail -100 wp-content/debug.log | grep -i "notice\|warning\|error"
   ```

3. Find the render file for the failing block:
   ```bash
   # For theme blocks
   find wp-content/themes/my-theme/blocks -name "render.php" | xargs grep -l "Undefined"

   # Check block.json attributes vs render.php accesses
   diff \
     <(cat blocks/my-block/block.json | php -r '$j=json_decode(file_get_contents("php://stdin"),true); echo implode(PHP_EOL, array_keys($j["attributes"] ?? []));') \
     <(grep -oP '\$attributes\[\x27\K[^\x27]+' blocks/my-block/render.php | sort -u)
   ```

4. Check if the issue is from a core block or plugin block (if so, it may be a known upstream bug):
   ```bash
   grep "render_callback\|render_block" wp-content/debug.log | head -10
   ```

#### Step-by-Step Fix

1. Add null-coalescing defaults to all attribute accesses in render callbacks:
   ```php
   // Wrong — causes notice if attribute not saved
   $text_color = $attributes['textColor'];
   $font_size  = $attributes['style']['typography']['fontSize'];

   // Correct — safe with fallbacks
   $text_color = $attributes['textColor'] ?? '';
   $font_size  = $attributes['style']['typography']['fontSize'] ?? '';
   ```

2. Declare explicit defaults in `block.json` to ensure the attribute is always present:
   ```json
   {
       "apiVersion": 3,
       "name": "my-theme/card",
       "attributes": {
           "textColor": {
               "type": "string",
               "default": ""
           },
           "heading": {
               "type": "string",
               "default": ""
           }
       }
   }
   ```

3. For context-dependent blocks, guard against missing context:
   ```php
   <?php
   // render.php for a block that requires post context
   $post_id = $block->context['postId'] ?? 0;
   if ( ! $post_id ) {
       return '';
   }
   $post = get_post( $post_id );
   if ( ! $post ) {
       return '';
   }
   ```

4. If the warning comes from `WP_Block_Supports` itself (core code), the fix is to remove the relevant support from `block.json` if you are not actually using it:
   ```json
   {
       "supports": {
           "color": {
               "text": false,
               "background": false
           }
       }
   }
   ```

#### Known Variations and Edge Cases

- **`render_block` filter vs `render_callback`:** A `render_block` filter applied to a specific block name can also trigger notices if it assumes attributes that may be absent. The filter receives the same `$block_instance` — apply the same null-coalescing pattern.
- **PHP version differences:** PHP 8.1+ converts many "Notice: Undefined index" errors to fatal `TypeError` exceptions in strict mode. Code that worked on PHP 7.4 may produce fatal errors on PHP 8.1.
- **Block context inheritance:** Blocks inside a Query Loop inherit `postId` and `postType` context. Outside a Query Loop, these context values are not provided. Always check context availability before using it.

---

### Assets Not Loading / Cache Issues

#### How WordPress Enqueues Theme Assets

WordPress resolves asset URLs at runtime using `get_template_directory_uri()` (absolute URL to theme directory) and `get_template_directory()` (absolute filesystem path). These functions account for WordPress installation path, multisite subdirectory installs, and HTTPS/HTTP.

Asset loading fails when: (1) files do not exist at the path, (2) URLs are hardcoded and break when the site moves or is renamed, (3) cache layers (browser, CDN, page cache, object cache) serve stale responses.

#### Step-by-Step Diagnosis

1. Verify files exist on the server:
   ```bash
   ls -la wp-content/themes/my-theme/assets/css/
   ls -la wp-content/themes/my-theme/assets/js/

   # Check file sizes — zero-byte files indicate failed build
   find wp-content/themes/my-theme/assets -name "*.css" -o -name "*.js" | \
     xargs ls -la | awk '$5 == 0 {print "EMPTY:", $9}'
   ```

2. Check what paths WordPress resolves to:
   ```bash
   wp eval "echo get_template_directory_uri() . PHP_EOL;"
   wp eval "echo get_stylesheet_directory_uri() . PHP_EOL;"
   wp eval "echo get_template_directory() . PHP_EOL;"
   ```

3. Find all `wp_enqueue_*` calls in the theme:
   ```bash
   grep -rn "wp_enqueue_style\|wp_enqueue_script" wp-content/themes/my-theme/functions.php
   grep -rn "wp_enqueue_style\|wp_enqueue_script" wp-content/themes/my-theme/inc/
   ```
   Flag any that contain hardcoded strings like `/wp-content/themes/`.

4. Open browser DevTools → Network tab, filter by "CSS" and "JS". Look for red 404 entries. Copy the full requested URL and compare to what `get_template_directory_uri()` returns.

5. Clear all cache layers:
   ```bash
   wp cache flush
   wp transient delete --all

   # WP Rocket
   wp rocket clean --confirm 2>/dev/null || true

   # LiteSpeed Cache
   wp litespeed-purge all 2>/dev/null || true

   # W3 Total Cache
   wp w3-total-cache flush all 2>/dev/null || true
   ```

#### Step-by-Step Fix

1. Replace hardcoded paths with dynamic functions:
   ```php
   // Wrong
   wp_enqueue_style(
       'my-theme-style',
       '/wp-content/themes/my-theme/assets/css/style.css',
       array(),
       '1.0.0'
   );

   // Correct
   wp_enqueue_style(
       'my-theme-style',
       get_template_directory_uri() . '/assets/css/style.css',
       array(),
       filemtime( get_template_directory() . '/assets/css/style.css' )
   );
   ```

2. Use `filemtime()` for automatic cache busting on every file change:
   ```php
   $asset_path = get_template_directory() . '/assets/css/style.css';
   wp_enqueue_style(
       'my-theme-style',
       get_template_directory_uri() . '/assets/css/style.css',
       array(),
       file_exists( $asset_path ) ? filemtime( $asset_path ) : '1.0.0'
   );
   ```

3. If the file is missing from the server, re-deploy it:
   ```bash
   # Build locally first
   npm run build

   # Verify the output exists
   ls -la dist/

   # Copy to server (adjust path for your deploy method)
   rsync -av --checksum dist/ user@server:/srv/www/wp-content/themes/my-theme/assets/
   ```

#### Known Variations and Edge Cases

- **Child theme assets:** Use `get_stylesheet_directory()` and `get_stylesheet_directory_uri()` for child theme assets, `get_template_directory*` for parent theme assets. Using the wrong function causes a 404 when both themes are active.
- **Object cache with persistent backends (Redis/Memcached):** `wp cache flush` clears the in-memory object cache but not the persistent store. Flush Redis/Memcached directly: `wp redis flush-db` (WP Redis) or `wp memcached flush` (Memcached Object Cache).
- **CDN asset serving:** If assets are served from a CDN, the CDN URL prefix may be rewritten by the CDN plugin (WP Rocket, Cloudflare, etc.). Purge the CDN cache from the plugin settings panel after asset updates.

---

### Editor Parity Gap

#### How the Block Editor Loads Styles

The block editor renders blocks inside a sandboxed `<iframe>` (introduced in WordPress 6.0 as "Iframed Editor"). This iframe has its own `<head>` that includes:

1. WordPress block library CSS
2. Styles registered via `add_editor_style()` (called in the theme's `after_setup_theme` hook)
3. Per-block styles registered via `wp_enqueue_block_style()`
4. Inline CSS generated from `theme.json` (CSS custom properties)
5. Global Styles from the Site Editor

Styles enqueued only on `wp_enqueue_scripts` (front end) do **not** reach the editor iframe. This is the most common source of editor parity gaps.

#### Step-by-Step Diagnosis

1. Verify `editor.css` registration:
   ```bash
   grep -n "add_editor_style" wp-content/themes/my-theme/functions.php
   ```
   Must be inside an `after_setup_theme` callback:
   ```php
   add_action( 'after_setup_theme', function(): void {
       add_editor_style( 'assets/css/editor.css' );
   } );
   ```

2. Verify the file exists:
   ```bash
   ls -la wp-content/themes/my-theme/assets/css/editor.css
   ```

3. In browser DevTools inside the editor (inspect the iframe):
   - Chrome: DevTools → Elements → find the editor `<iframe>` → right-click → "Reveal in Elements panel" → inside that iframe, check `<head>` for your `editor.css`
   - Firefox: DevTools → Inspector → look for "Switch to" iframe option in the frame selector

4. Compare the CSS selectors between `style.css` and `editor.css`. The editor DOM structure may use additional wrapper classes. For example, `core/group` renders as:
   - Front end: `.wp-block-group`
   - Editor: `.wp-block-group.wp-block-group__inner-container` (older WP) or `.wp-block-group` (WP 6.6+)

5. Check if the gap is caused by a theme.json `customCss` property that only applies to the front end context (rare — these should apply to both, but verify).

#### Step-by-Step Fix

1. Register `editor.css`:
   ```php
   add_action( 'after_setup_theme', function(): void {
       add_editor_style( array(
           'assets/css/editor.css',
           // Add Google Fonts or other external stylesheets here if needed
       ) );
   } );
   ```

2. Structure `editor.css` to mirror `style.css` visual rules. Omit:
   - `header`, `footer`, `nav` positioning styles (no site chrome in the editor)
   - `@media print` styles
   - `@keyframes` animations (fine to include, but not needed)
   - JavaScript-dependent class toggling

   Include:
   - Typography (font families, sizes, weights, line heights)
   - Color values and background colors
   - Spacing and layout for block containers
   - Component/block styles

3. For per-block styles, prefer `wp_enqueue_block_style()` over separate front-end and editor enqueue calls — it handles both automatically:
   ```php
   add_action( 'init', function(): void {
       wp_enqueue_block_style(
           'core/button',
           array(
               'handle' => 'my-theme-button',
               'src'    => get_template_directory_uri() . '/assets/css/blocks/button.css',
               'path'   => get_template_directory() . '/assets/css/blocks/button.css',
           )
       );
   } );
   ```

#### Known Variations and Edge Cases

- **Widget block editor (Appearance → Widgets):** This editor does NOT use the iframed editor. Styles registered via `add_editor_style()` do reach it, but the DOM structure differs from the full-page block editor.
- **Editor canvas width:** The iframed editor defaults to a width that may not match your front-end container. Use the editor canvas width control or `theme.json` `"layout": { "contentSize": "800px" }` to set a matching width.
- **Dark mode editors:** Some users enable editor dark mode via user preferences. CSS custom properties set in `theme.json` still apply, but any hardcoded colors in `editor.css` will clash. Use CSS custom properties throughout.

---

### Classic-to-Block Conversion Artifacts

#### How Classic and Block Rendering Differ

Classic themes rendered templates by calling PHP functions directly: `get_header()`, `get_sidebar()`, `the_content()`, `dynamic_sidebar()`. The `the_content()` function applies the `the_content` filter chain, which includes `do_shortcode`, `wpautop`, `wptexturize`, and others.

Block themes render templates by parsing serialized HTML block comments. The `the_content` filter still runs on block content, but the rendering path is different — a shortcode that happens to be stored as text inside a `<!-- wp:paragraph -->` block will still run via `do_shortcode`. However, shortcodes stored as the literal `post_content` value outside any block comment (classic content) may not render in all contexts.

#### Step-by-Step Diagnosis

1. Check if the shortcode is registered:
   ```bash
   wp eval '
   global $shortcode_tags;
   echo implode( PHP_EOL, array_keys( $shortcode_tags ) );
   ' | grep -i "your-shortcode-tag"
   ```

2. Verify `do_shortcode` is in the `the_content` filter chain:
   ```bash
   wp eval 'echo has_filter( "the_content", "do_shortcode" ) ? "YES\n" : "NO\n";'
   ```
   Expected output: `10` (the default priority). `false` or `NO` means it was removed.

3. For ACF bindings, verify the meta key is REST-enabled:
   ```bash
   wp eval '
   $keys = get_registered_meta_keys( "post" );
   foreach ( $keys as $key => $args ) {
       if ( ! empty( $args["show_in_rest"] ) ) {
           echo $key . PHP_EOL;
       }
   }
   '
   ```

4. Check if the ACF binding source is registered:
   ```bash
   wp eval '
   $sources = WP_Block_Bindings_Registry::get_instance()->get_all_registered();
   foreach ( $sources as $name => $source ) {
       echo $name . PHP_EOL;
   }
   '
   ```

5. Look for raw PHP in stored content (a sign of copy-paste from a classic theme template):
   ```bash
   wp post list --post_type=any --format=ids | \
     xargs -I{} wp eval "
       \$p = get_post({});
       if ( preg_match( '/<\?php/', \$p->post_content ) ) {
           echo 'Post {} contains PHP: ' . \$p->post_title . PHP_EOL;
       }
     "
   ```

#### Step-by-Step Fix

For shortcodes appearing as literal text when the plugin is active:
```php
// Ensure do_shortcode runs. Add to functions.php if it was accidentally removed:
add_filter( 'the_content', 'do_shortcode', 11 );
```

For ACF Block Bindings — full setup:
```php
<?php
// inc/block-bindings.php
add_action( 'init', function(): void {
    if ( ! function_exists( 'register_block_bindings_source' ) ) {
        return; // Requires WordPress 6.5+
    }

    register_block_bindings_source(
        'my-theme/acf',
        array(
            'label'              => __( 'ACF Fields', 'my-theme' ),
            'get_value_callback' => 'my_theme_get_acf_binding_value',
            'uses_context'       => array( 'postId', 'postType' ),
        )
    );
} );

function my_theme_get_acf_binding_value( array $source_args, WP_Block $block_instance ): ?string {
    $key     = $source_args['key'] ?? '';
    $post_id = $block_instance->context['postId'] ?? get_the_ID();

    if ( ! $key || ! $post_id ) {
        return null;
    }

    $value = function_exists( 'get_field' )
        ? get_field( $key, $post_id )
        : get_post_meta( $post_id, $key, true );

    return $value ? esc_html( (string) $value ) : null;
}
```

For native `core/post-meta` bindings (no custom source needed, WP 6.5+):
```php
// Register the meta key with REST API access so the bindings API can read it
add_action( 'init', function(): void {
    register_post_meta( 'post', 'hero_headline', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'default'       => '',
        'auth_callback' => function(): bool {
            return current_user_can( 'edit_posts' );
        },
    ) );
} );
```

Then use it in a block pattern:
```html
<!-- wp:paragraph {
    "metadata": {
        "bindings": {
            "content": {
                "source": "core/post-meta",
                "args": { "key": "hero_headline" }
            }
        }
    }
} -->
<p>Fallback text shown in editor</p>
<!-- /wp:paragraph -->
```

#### Known Variations and Edge Cases

- **Shortcodes with attributes:** Simple `[tag]` shortcodes usually render fine. Shortcodes with attributes like `[gallery id="5"]` require the shortcode-providing plugin to remain active. Block Bindings cannot replace shortcodes that produce complex HTML — build a custom block instead.
- **ACF Block Bindings version floor:** Native ACF block bindings require ACF PRO 6.3+ OR the custom `register_block_bindings_source()` approach above. The custom approach works with ACF free.
- **Block Bindings in Query Loop:** `core/post-meta` bindings work inside Query Loop blocks automatically, reading the `postId` from loop context. Outside a Query Loop, set the context explicitly or use a dynamic block instead.

---

### PHP Fatal Error on Theme Activation

#### Step-by-Step Diagnosis

```bash
# Check the most recent fatal in debug.log
grep -i "fatal\|Parse error\|Call to undefined" wp-content/debug.log | tail -20

# Lint all PHP files in the theme for syntax errors
find wp-content/themes/my-theme -name "*.php" | xargs -I{} php -l {} | grep -v "No syntax errors"

# Verify all require_once paths exist
grep -rn "require_once\|require\|include_once\|include" wp-content/themes/my-theme/functions.php | \
  grep -v "^.*#" | \
  awk -F"'" '{print $2}' | \
  xargs -I{} test -f {} || echo "Missing file: {}"
```

#### Step-by-Step Fix

1. Fix the syntax error reported in `debug.log`. The log includes the file path and line number.
2. Verify that `require_once` paths use `get_template_directory()`:
   ```php
   // Wrong — breaks if WP is not installed at root
   require_once __DIR__ . '/inc/setup.php';

   // Correct
   require_once get_template_directory() . '/inc/setup.php';
   ```
3. Guard function calls against missing plugins or WP version constraints:
   ```php
   if ( function_exists( 'some_plugin_function' ) ) {
       some_plugin_function();
   }
   ```

---

### Required Stylesheet Missing

#### Step-by-Step Diagnosis

```bash
# Verify style.css exists and is not empty
ls -la wp-content/themes/my-theme/style.css
head -15 wp-content/themes/my-theme/style.css
```

The header must contain at minimum:
```css
/*
 * Theme Name: My Theme
 */
```

The error "The theme is missing the style.css stylesheet" appears when:
- `style.css` does not exist at the theme root
- The `Theme Name:` line is missing or misspelled
- The file is named `styles.css` or `Style.css` (case-sensitive on Linux servers)

#### Fix

Create or restore `style.css` with a valid header:
```css
/*
 * Theme Name:  My Theme
 * Theme URI:   https://example.com
 * Description: A custom WordPress block theme.
 * Author:      Your Name
 * Version:     1.0.0
 * Requires at least: 6.4
 * Requires PHP: 8.1
 * License:     GPL-2.0-or-later
 * Text Domain: my-theme
 */
```

---

### Patterns Registering but Showing Wrong Content

#### Diagnosis and Fix

This is almost always a slug collision — a plugin or another theme registers a pattern with the same `Slug`, and whichever loads last wins.

```bash
# Find all registered patterns and their source
wp eval '
$patterns = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
foreach ( $patterns as $p ) {
    echo $p["slug"] . "\t" . ( $p["source"] ?? "unknown" ) . PHP_EOL;
}
' | grep "my-theme/"
```

If you see your slug listed with `source: plugin` or `source: theme` pointing to a different theme, rename your slug to add a more specific namespace:

```
// Old (collision risk): my-theme/hero
// New (specific):       my-company-my-theme/hero
```

---

### RTL Layout Broken

#### Step-by-Step Diagnosis

```bash
# Check if rtl.css exists
ls wp-content/themes/my-theme/assets/css/rtl.css 2>/dev/null || echo "rtl.css missing"

# Scan for physical CSS properties (must be replaced with logical properties)
grep -rn "margin-left\|margin-right\|padding-left\|padding-right\|border-left\|border-right\|left:\|right:\|text-align: left\|text-align: right\|float: left\|float: right" \
  wp-content/themes/my-theme/assets/css/
```

#### Fix

1. Replace physical CSS properties with logical equivalents:

   | Physical | Logical |
   |---------|---------|
   | `margin-left` | `margin-inline-start` |
   | `margin-right` | `margin-inline-end` |
   | `padding-left` | `padding-inline-start` |
   | `padding-right` | `padding-inline-end` |
   | `border-left` | `border-inline-start` |
   | `text-align: left` | `text-align: start` |
   | `float: left` | Use flexbox or grid instead |

2. Add `rtl.css` for legacy overrides that cannot use logical properties:
   ```bash
   touch wp-content/themes/my-theme/assets/css/rtl.css
   ```
   WordPress automatically loads `rtl.css` when `is_rtl()` returns true — no enqueue needed. The file should contain only overrides, not a full copy of `style.css`.

3. Register RTL support in `functions.php`:
   ```php
   add_action( 'after_setup_theme', function(): void {
       load_theme_textdomain( 'my-theme', get_template_directory() . '/languages' );
   } );
   ```

---

### Block Styles Not Applying

#### Diagnosis and Fix

Block styles (registered via `register_block_style()`) add a `.is-style-{slug}` class to a block when selected. If the CSS rule for that class is missing or the registration is too late, the style has no visual effect.

```bash
# Verify the block style is registered
wp eval '
$styles = WP_Block_Styles_Registry::get_instance()->get_registered_styles_for_block("core/button");
foreach ( $styles as $s ) {
    echo $s["name"] . "\t" . $s["label"] . PHP_EOL;
}
'
```

Register block styles on `init` with inline CSS or a stylesheet handle:
```php
add_action( 'init', function(): void {
    register_block_style(
        'core/button',
        array(
            'name'         => 'outline',
            'label'        => __( 'Outline', 'my-theme' ),
            'inline_css'   => '
                .wp-block-button.is-style-outline .wp-block-button__link {
                    background: transparent;
                    border: 2px solid var(--wp--preset--color--primary);
                    color: var(--wp--preset--color--primary);
                }
            ',
        )
    );
} );
```

Alternatively, use a stylesheet handle (recommended for larger CSS):
```php
add_action( 'init', function(): void {
    register_block_style(
        'core/button',
        array(
            'name'         => 'outline',
            'label'        => __( 'Outline', 'my-theme' ),
            'style_handle' => 'my-theme-button-styles', // Must be already registered
        )
    );
} );
```

The CSS selector must use the pattern: `.wp-block-{block-namespace}-{block-name}.is-style-{slug}` for third-party blocks, or `.wp-block-{name}.is-style-{slug}` for core blocks.

---

## The "Nothing Works" Flowchart

Use this when you cannot identify which category your problem falls into.

```
START: Something is broken on your block theme.
│
├── Is there a PHP Fatal Error or white screen?
│   YES → Check wp-content/debug.log for the file and line number.
│         Run: php -l on all PHP files in the theme.
│         Fix the syntax error or missing require_once target.
│         └── RESOLVED? Done. NO → continue.
│
├── Is WP_DEBUG enabled? (Check wp-config.php)
│   NO  → Enable it: define('WP_DEBUG', true); define('WP_DEBUG_LOG', true);
│          Reload the page and check wp-content/debug.log.
│   YES → Read debug.log: tail -100 wp-content/debug.log
│         └── Found an error? → Match it to a Deep Dive section above.
│
├── Check the browser console (F12 → Console).
│   Errors present?
│   YES → "Block validation" error → Category 1: Block Validation Error.
│          404 on .css or .js → Category 6: Assets Not Loading.
│          Other JS error → Note the file and line; search themes/ for the script.
│   NO  → Continue.
│
├── Does the theme activate without errors?
│   Test: wp theme activate my-theme (check for error output)
│   NO  → Missing style.css header → see "Required Stylesheet Missing".
│          PHP error on activate → check debug.log, fix require_once paths.
│   YES → Continue.
│
├── Does any styling apply at all?
│   NO  → theme.json not parsing → Category 2: theme.json Silent Failure.
│          Run: php -r "json_decode(file_get_contents('theme.json')); echo json_last_error_msg();"
│          Run: wp cache flush && wp transient delete --all
│   YES → Continue.
│
├── Is the issue visual only (wrong colors, fonts, spacing)?
│   In editor only → Category 7: Editor Parity Gap. Check editor.css registration.
│   On front end only → Category 7: Editor Parity Gap (reversed).
│   Both → Category 2: theme.json Silent Failure.
│
├── Is a template or pattern missing?
│   Pattern missing → Category 3: Pattern Not Showing.
│     Run: php -l patterns/your-pattern.php
│     Run: wp eval 'foreach(WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $p){echo $p["slug"].PHP_EOL;}'
│   Template change not visible → Category 4: DB Template Overrides File.
│     Run: wp post list --post_type=wp_template --format=table
│
├── Are you seeing PHP notices (not fatal errors)?
│   YES → Category 5: Invalid Block-Support PHP Warnings.
│          Add ?? '' to all $attributes['key'] accesses in render callbacks.
│
├── Did this work before and break after a recent change?
│   After WP update → Block validation errors (Category 1) or block support changes.
│   After plugin install/update → Plugin conflict; use /wp-plugin-theme.
│   After theme file edit → DB template override (Category 4).
│   After deploying to new server → Asset path issue (Category 6).
│
└── Still stuck?
    Run the full environment checklist below.
    Post: WP version, PHP version, active plugin list, debug.log excerpt,
    and the exact symptom to get targeted help.
```

---

## WP-CLI Quick Commands

A cheat sheet of the most useful WP-CLI commands for block theme debugging.

### General Diagnostics

```bash
# WordPress version and environment info
wp core version
wp --info

# List active theme and its parent
wp theme list --status=active

# List all active plugins
wp plugin list --status=active --format=table

# Check for PHP errors (requires WP_DEBUG_LOG=true)
tail -50 wp-content/debug.log

# Run built-in WordPress health check
wp site health-check
```

### Cache and Transients

```bash
# Flush object cache
wp cache flush

# Delete all transients
wp transient delete --all

# Delete a specific transient
wp transient delete my-transient-name

# List all transients (use with caution on large sites)
wp transient list --format=table
```

### Templates and Template Parts

```bash
# List all DB template overrides
wp post list --post_type=wp_template --format=table --fields=ID,post_name,post_status,post_modified

# List all DB template part overrides
wp post list --post_type=wp_template_part --format=table --fields=ID,post_name,post_status,post_modified

# View content of a specific template override
wp post get <ID> --field=post_content

# Delete a template override (restores file-based template)
wp post delete <ID> --force

# Delete ALL template overrides (use only if no intentional customizations)
wp post delete $(wp post list --post_type=wp_template --format=ids) --force
```

### Patterns

```bash
# List all registered patterns
wp eval '
$patterns = WP_Block_Patterns_Registry::get_instance()->get_all_registered();
foreach ($patterns as $p) {
    echo $p["slug"] . "\t" . $p["title"] . PHP_EOL;
}
'

# List all registered pattern categories
wp eval '
$cats = WP_Block_Pattern_Categories_Registry::get_instance()->get_all_registered();
foreach ($cats as $c) {
    echo $c["name"] . "\t" . $c["label"] . PHP_EOL;
}
'

# Check for PHP errors in all pattern files
find . -path "*/patterns/*.php" | xargs -I{} php -l {}
```

### theme.json

```bash
# Validate JSON syntax
php -r "json_decode(file_get_contents('theme.json')); echo json_last_error() === JSON_ERROR_NONE ? 'Valid' : json_last_error_msg();"

# List CSS custom properties currently generated by WordPress
wp eval '
$theme_json = WP_Theme_JSON_Resolver::get_merged_data();
$css        = $theme_json->get_stylesheet();
preg_match_all("/--wp--preset--[a-z0-9-]+--[a-z0-9-]+/", $css, $matches);
foreach (array_unique($matches[0]) as $prop) {
    echo $prop . PHP_EOL;
}
' | sort
```

### Block Styles and Supports

```bash
# List all registered block styles for a specific block
wp eval '
$styles = WP_Block_Styles_Registry::get_instance()->get_registered_styles_for_block("core/button");
foreach ($styles as $s) {
    echo $s["name"] . "\t" . $s["label"] . PHP_EOL;
}
'

# List all registered block types
wp eval '
foreach (WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $block) {
    echo $name . PHP_EOL;
}
' | sort

# Check if a specific block is registered
wp eval 'var_dump(WP_Block_Type_Registry::get_instance()->is_registered("core/paragraph"));'
```

### Content and Posts

```bash
# Find posts using classic editor format (no block comments)
wp post list --post_type=post,page --format=json | \
  php -r '
    $posts = json_decode(file_get_contents("php://stdin"), true);
    $classic = array_filter($posts, fn($p) => strpos($p["post_content"], "<!-- wp:") === false);
    foreach ($classic as $p) {
        echo "[{$p["ID"]}] {$p["post_title"]}\n";
    }
  '

# Search post content for a specific string
wp post list --post_type=any --format=ids | \
  xargs -I{} wp eval "
    \$p = get_post({});
    if (strpos(\$p->post_content, 'YOUR_SEARCH_STRING') !== false) {
        echo 'Post {}: ' . \$p->post_title . PHP_EOL;
    }
  "

# Create a database backup before destructive operations
wp db export backup-$(date +%Y%m%d-%H%M%S).sql
```

### Rewrite Rules and Permalinks

```bash
# Flush rewrite rules (fixes some template routing issues)
wp rewrite flush

# Verify rewrite rules are working
wp rewrite list --format=table
```

---

## Environment Checklist

Before reporting a bug or asking for help, verify the following. This information is needed to give accurate advice.

### WordPress Version

```bash
wp core version
```

Minimum requirements for block theme features:
- Block themes (FSE): WordPress 5.9+
- `theme.json` v2: WordPress 6.0+
- `patterns/` directory auto-discovery: WordPress 6.0+
- Block Bindings API (`register_block_bindings_source`): WordPress 6.5+
- `theme.json` v3: WordPress 6.6+
- `Requires Plugins` in `style.css` header: WordPress 6.5+

### PHP Version

```bash
php --version
wp --info | grep "PHP version"
```

Recommended minimum: **PHP 8.1**. PHP 7.4 is EOL and unsupported by WordPress core since WordPress 6.3. PHP 8.2 is the current recommended version.

PHP version differences that affect debugging:
- PHP 8.0+: `Undefined index` notices became `TypeError` in strict mode; `match` expressions available
- PHP 8.1+: Enums available; intersection types available; deprecated: `utf8_encode()`/`utf8_decode()`
- PHP 8.2+: Deprecated: dynamic properties (affects some older plugins)

### Active Plugins List

```bash
wp plugin list --status=active --format=table --fields=name,version,status
```

Note specifically:
- Caching plugins (WP Rocket, LiteSpeed Cache, W3 Total Cache, WP Super Cache)
- Page builder plugins (Elementor, Divi, Beaver Builder) — these can conflict with FSE
- Custom field plugins (ACF, CMB2, Meta Box) — relevant for binding issues
- Any plugin whose deactivation you should test first

### Child Theme vs Parent Theme

```bash
wp theme list --status=active --format=table
wp eval 'echo get_stylesheet() . PHP_EOL; echo get_template() . PHP_EOL;'
```

If `get_stylesheet()` !== `get_template()`, a child theme is active. Note:
- `get_template_directory()` → parent theme path
- `get_stylesheet_directory()` → child (or active) theme path
- `theme.json` in a child theme merges with the parent — a child theme `theme.json` error only affects child theme settings

### WP_DEBUG Status

```bash
wp eval '
echo "WP_DEBUG:         " . (defined("WP_DEBUG") && WP_DEBUG ? "ON" : "OFF") . PHP_EOL;
echo "WP_DEBUG_LOG:     " . (defined("WP_DEBUG_LOG") && WP_DEBUG_LOG ? "ON" : "OFF") . PHP_EOL;
echo "WP_DEBUG_DISPLAY: " . (defined("WP_DEBUG_DISPLAY") && WP_DEBUG_DISPLAY ? "ON" : "OFF") . PHP_EOL;
echo "SCRIPT_DEBUG:     " . (defined("SCRIPT_DEBUG") && SCRIPT_DEBUG ? "ON" : "OFF") . PHP_EOL;
'
```

Recommended development configuration in `wp-config.php`:
```php
define( 'WP_DEBUG',         true  );
define( 'WP_DEBUG_LOG',     true  );
define( 'WP_DEBUG_DISPLAY', false ); // Prevents errors leaking to front end
define( 'SCRIPT_DEBUG',     true  ); // Loads unminified scripts
```

**Always disable `WP_DEBUG` on production** — never set `WP_DEBUG_DISPLAY` to `true` on a live site.

### Quick Environment Summary Command

Run this to capture all environment info in one pass:

```bash
wp eval '
echo "=== Environment Summary ===" . PHP_EOL;
echo "WordPress:  " . get_bloginfo("version") . PHP_EOL;
echo "PHP:        " . PHP_VERSION . PHP_EOL;
echo "Theme:      " . get_stylesheet() . " (template: " . get_template() . ")" . PHP_EOL;
echo "WP_DEBUG:   " . (defined("WP_DEBUG") && WP_DEBUG ? "ON" : "OFF") . PHP_EOL;
echo PHP_EOL;
echo "Active plugins:" . PHP_EOL;
foreach (get_option("active_plugins", []) as $plugin) {
    echo "  - " . $plugin . PHP_EOL;
}
echo PHP_EOL;
echo "DB template overrides:" . PHP_EOL;
$templates = get_posts(["post_type" => ["wp_template","wp_template_part"], "posts_per_page" => -1]);
if (empty($templates)) {
    echo "  (none)" . PHP_EOL;
} else {
    foreach ($templates as $t) {
        echo "  - [{$t->post_type}] {$t->post_name}" . PHP_EOL;
    }
}
'
```

---

## Read Also

- `commands/wp-debug.md` — interactive guided diagnostic workflow (use `/wp-debug` in chat)
- `references/theme-json-schema.md` — complete theme.json key reference by WP version
- `references/validation-checklist.md` — post-deployment sign-off checklist
- `references/quality-rules.md` — non-negotiable code rules that prevent many of these issues
- `commands/wp-migrate.md` — systematic migration of classic content to blocks
- `commands/wp-plugin-theme.md` — plugin compatibility debugging
- `scripts/validate-theme-json.mjs` — automated theme.json validation script
- `scripts/check-patterns.mjs` — automated pattern file header validation script
- `scripts/lint-block-markup.mjs` — automated block HTML linting script
