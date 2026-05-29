# /wp-debug

**Purpose:** Run a guided diagnostic workflow to identify and fix the root cause of a WordPress block theme problem. This command maps symptoms to specific root causes, provides step-by-step diagnosis, and offers to apply fixes directly to theme files.

## When to Use

Trigger this command when:
- A block theme is producing an error message in the editor or on the front end
- Styles, colors, typography, or spacing are not applying correctly
- A pattern or template is missing from the Site Editor or inserter
- A file change had no visible effect
- The editor and front end look different
- Shortcodes, widget HTML, or ACF field values are not rendering in blocks
- PHP warnings or notices appear on the front end

## When This Command Does NOT Apply

| Situation | Use Instead |
|-----------|------------|
| Converting static HTML/CSS to a block theme | `/convert-to-wp-theme` |
| Plugin conflict causing a white screen or admin error | `/wp-plugin-theme` |
| Hosting, server config, or database connection errors | Out of scope — contact hosting provider |
| WP-CLI or SSH access denied | Out of scope — contact server admin |
| Performance / Core Web Vitals issues | Out of scope — use `references/asset-optimization.md` |

---

## Workflow

### Step 1: Gather the Symptom

Ask the user:

> "Describe what you're seeing — paste the exact error message if there is one, or describe the behavior (e.g., 'blank page after I edited a block', 'my color palette shows gray instead of my brand colors', 'the hero pattern isn't showing in the inserter')."

If the user already included a symptom in their message with `/wp-debug`, skip asking and proceed directly to Step 2.

Accept any of these symptom forms:
- Pasted error message (verbatim text from browser or editor)
- Screenshot description ("I see a yellow warning banner in the editor")
- Behavioral description ("nothing changed after I updated the .html file")
- PHP log excerpt

---

### Step 2: Map to Root-Cause Category

Use the decision tree below to classify the symptom. Output the matched category name before proceeding.

#### Decision Tree

```
Is there an error message in the block editor?
  YES → Does it say "This block contains unexpected or invalid content" or "Block recovery"?
          YES → Category 1: Block Validation Error
          NO  → Does it say "PHP Fatal error" or reference a missing file?
                  YES → Category 6: Assets Not Loading / Cache Issue
                  NO  → Category 5: Invalid Block-Support PHP Warning
  NO  →
    Is the problem visual (styles, colors, spacing, typography)?
      YES → Is WP_DEBUG generating PHP warnings related to block rendering?
              YES → Category 5: Invalid Block-Support PHP Warning
              NO  → Category 2: theme.json Silent Failure
    NO  →
      Is a pattern missing from the inserter or Site Editor?
        YES → Category 3: Pattern Not Showing
        NO  →
          Did you edit a .html template file but see no change on site?
            YES → Category 4: DB Template Overrides File
            NO  →
              Does it look right on front end but wrong in editor (or vice versa)?
                YES → Category 7: Editor Parity Gap
                NO  → Are shortcodes/widget HTML/ACF values not rendering as blocks?
                        YES → Category 8: Classic-to-Block Conversion Artifact
                        NO  → Run full diagnostic (all categories in order)
```

---

### Step 3: Diagnose and Fix

Work through the matched category below. Output each section with its heading.

---

#### Category 1: Block Validation Error

**Symptoms:**
- "This block contains unexpected or invalid content"
- "Block recovery" prompt appears in editor
- Blank page after editing a block and saving
- Editor shows a red/yellow banner with "Attempt Block Recovery"

**Root Cause**

WordPress stores block content as HTML comments (`<!-- wp:block-name {...} -->`). The block editor validates this serialized markup against the registered block schema each time it loads. If the saved HTML does not match what the block's `save()` function would produce — due to a block update, a direct database edit, a plugin conflict writing to `post_content`, or copying markup across sites with different block versions — the editor considers the block "invalid" and refuses to render it.

**Diagnostic Steps**

1. Open the post or template in the browser console (F12 → Console) and look for: `Block validation: Block type "core/..." is not registered`.
2. Check if the block version mismatch is the cause:
   ```bash
   # Check your WordPress version
   wp core version

   # List all registered block types (output is long — grep for the failing block)
   wp eval 'foreach ( WP_Block_Type_Registry::get_instance()->get_all_registered() as $name => $block ) { echo $name . PHP_EOL; }'
   ```
3. Check `wp-content/debug.log` for serialization errors:
   ```bash
   grep -i "block" wp-content/debug.log | tail -30
   ```
4. Identify which post/template contains the invalid block:
   ```bash
   # Find posts containing a specific block that may be invalid
   wp post list --post_type=post,page,wp_template,wp_template_part \
     --format=table --fields=ID,post_title,post_type
   ```
5. View the raw `post_content` for the suspect post:
   ```bash
   wp post get <POST_ID> --field=post_content
   ```

**Fix**

Option A — Use Block Recovery (safest for individual posts):
1. Open the affected post in the block editor.
2. Click "Attempt Block Recovery" in the error banner.
3. If recovery renders correctly, save the post. This re-serializes the block to the current schema.

Option B — Convert to Classic block (when recovery fails):
1. In the error banner, click "Convert to Classic Block".
2. Copy the HTML content out of the Classic block.
3. Re-create the block from scratch using the correct block.

Option C — Clear the invalid block comment via WP-CLI (for templates):
```bash
# Back up first
wp db export backup-$(date +%Y%m%d-%H%M%S).sql

# Get the current content
wp post get <POST_ID> --field=post_content > /tmp/post-content.html

# Edit /tmp/post-content.html to remove or fix the bad block comment
# Then update the post
wp post update <POST_ID> --post_content="$(cat /tmp/post-content.html)"
```

Option D — Delete the database template so the file version takes over (for `wp_template` post type only):
```bash
# List all customized templates stored in DB
wp post list --post_type=wp_template --format=table

# Delete the DB override so the theme file is used
wp post delete <POST_ID> --force
```

**Prevention**
- Never paste block HTML across different WordPress installations without verifying the block registry is identical.
- Do not edit `post_content` directly in the database.
- After a major WordPress update, open templates in the Site Editor and save them to re-serialize to the new schema.
- Keep block.json `apiVersion` consistent if building custom blocks.

---

#### Category 2: theme.json Silent Failure

**Symptoms:**
- Styles not applying on the front end or in the editor
- Color palette missing, showing wrong colors, or reverting to defaults
- Typography settings (font family, font size) not taking effect
- Spacing or layout settings ignored
- `var(--wp--preset--color--primary)` not resolving in browser DevTools

**Root Cause**

WordPress parses `theme.json` at theme activation and caches the output in the database as transients under the `_wp_theme_*` option group. If `theme.json` contains a JSON syntax error, an unrecognized key, or a malformed value, WordPress silently discards the entire affected section rather than throwing a visible error. Additionally, the cached theme data may be stale if the file was updated while caching was active.

**Diagnostic Steps**

1. Validate the JSON syntax:
   ```bash
   # From your theme root
   php -r "json_decode(file_get_contents('theme.json')); echo json_last_error() === JSON_ERROR_NONE ? 'Valid JSON' : 'ERROR: ' . json_last_error_msg();"
   ```
2. Validate against the theme.json schema (requires Node.js):
   ```bash
   npx ajv-cli validate -s https://schemas.wp.org/trunk/theme.json -d theme.json
   ```
3. Check the WordPress version supports the keys you are using:
   ```bash
   wp core version
   # theme.json version 3 requires WP 6.6+
   # theme.json version 2 requires WP 6.0+
   ```
4. Flush theme caches and check again:
   ```bash
   wp cache flush
   wp transient delete --all
   ```
5. In browser DevTools → Elements, inspect the `<body>` element. WordPress injects `--wp--preset--color--*` CSS custom properties as a `<style>` block in `<head>`. If your color slugs are missing, the theme.json color section was discarded.
6. Enable `WP_DEBUG` and check for `theme.json` parse warnings:
   ```bash
   # In wp-config.php (temporarily)
   define( 'WP_DEBUG', true );
   define( 'WP_DEBUG_LOG', true );
   define( 'WP_DEBUG_DISPLAY', false );
   ```
   Then load any page and check `wp-content/debug.log`.

**Fix**

1. Fix JSON syntax errors identified in Step 1. Common mistakes:
   - Trailing comma after the last item in an array or object
   - Missing comma between items
   - Single quotes instead of double quotes
   - Unescaped special characters in string values
2. After fixing, flush the cache:
   ```bash
   wp cache flush
   wp transient delete --all
   # Or: Appearance → Themes → deactivate and reactivate the theme
   ```
3. If the palette is showing WordPress defaults instead of your custom palette, ensure `settings.color.defaultPalette` is set to `false`:
   ```json
   "settings": {
       "color": {
           "defaultPalette": false,
           "palette": [
               { "slug": "primary", "color": "#1a1a2e", "name": "Primary" }
           ]
       }
   }
   ```
4. If a font family is not applying, verify the `fontFace` source paths exist:
   ```bash
   find . -name "*.woff2" | sort
   # Compare against the "src" values in theme.json fontFamilies entries
   ```

**Prevention**
- Keep `theme.json` under version control and validate on every commit (see `scripts/validate-theme-json.mjs`).
- Use the `$schema` declaration so editors provide inline validation:
  ```json
  "$schema": "https://schemas.wp.org/trunk/theme.json"
  ```
- Flush transients after every `theme.json` update during development:
  ```bash
  wp transient delete --all
  ```

---

#### Category 3: Pattern Not Showing

**Symptoms:**
- Pattern does not appear in the block inserter
- Pattern is missing from Appearance → Site Editor → Patterns
- "0 patterns" shown under a category that should have patterns
- Pattern shows in inserter but is empty or renders the wrong content

**Root Cause**

WordPress discovers patterns in one of three ways: auto-discovery of `patterns/*.php` files (WP 6.0+), `register_block_pattern()` calls in PHP, or `_register_theme_block_patterns()` reading pattern files. If the file header is malformed, the pattern slug is duplicated, the category referenced does not exist, or the PHP file has a syntax error, WordPress silently skips the pattern. The inserter only shows patterns that are fully registered without errors.

**Diagnostic Steps**

1. Check the pattern file header for required fields:
   ```bash
   head -10 patterns/your-pattern.php
   ```
   Required header fields:
   ```php
   <?php
   /**
    * Title: Your Pattern Title
    * Slug: your-theme/your-pattern
    * Categories: featured
    */
   ```
   `Title` and `Slug` are mandatory. A missing or misspelled header field silently prevents registration.

2. Check for PHP syntax errors in the pattern file:
   ```bash
   php -l patterns/your-pattern.php
   ```

3. Check for duplicate slugs:
   ```bash
   grep -r "Slug:" patterns/ | sort
   # Look for any duplicate values
   ```

4. Verify the category is registered before the pattern:
   ```bash
   wp eval 'foreach ( WP_Block_Pattern_Categories_Registry::get_instance()->get_all_registered() as $cat ) { echo $cat["name"] . PHP_EOL; }'
   ```

5. List all currently registered patterns:
   ```bash
   wp eval 'foreach ( WP_Block_Patterns_Registry::get_instance()->get_all_registered() as $pattern ) { echo $pattern["slug"] . PHP_EOL; }'
   ```
   Compare this list against your `patterns/` directory.

6. Check `debug.log` for pattern registration errors while loading the site:
   ```bash
   grep -i "pattern\|Block pattern" wp-content/debug.log | tail -20
   ```

**Fix**

1. Correct any malformed file header. The `Slug` must:
   - Be unique across all registered patterns
   - Follow the format `namespace/pattern-name` (use your theme slug as namespace)
   - Contain only lowercase letters, numbers, and hyphens

2. If the category does not exist, register it in `functions.php` before the pattern auto-discovery hook:
   ```php
   add_action( 'init', function(): void {
       register_block_pattern_category(
           'my-theme-sections',
           array( 'label' => __( 'My Theme Sections', 'my-theme' ) )
       );
   } );
   ```

3. If using `register_block_pattern()` directly, verify it is hooked to `init` (not earlier):
   ```php
   add_action( 'init', function(): void {
       register_block_pattern(
           'my-theme/hero',
           array(
               'title'      => __( 'Hero Section', 'my-theme' ),
               'categories' => array( 'my-theme-sections' ),
               'content'    => '<!-- wp:group -->...',
           )
       );
   } );
   ```

4. Flush rewrite rules and pattern cache:
   ```bash
   wp cache flush
   wp rewrite flush
   ```

**Prevention**
- Run `node scripts/check-patterns.mjs` (included in this project) before committing pattern changes.
- Always run `php -l` on new pattern PHP files before pushing to staging.
- Register categories in a dedicated `inc/patterns.php` file included before pattern files load.

---

#### Category 4: DB Template Overrides File

**Symptoms:**
- "I updated the `.html` template file but the site still shows the old version"
- Changes to `templates/` or `parts/` files have no effect after save
- Edits made in the Site Editor persist even after reverting the file
- Site Editor shows a "customized" badge on a template you want to reset

**Root Cause**

The WordPress Site Editor saves user customizations as `wp_template` and `wp_template_part` custom post type records in the database. When a database record exists for a given template slug, WordPress uses it instead of the theme file — the file is effectively shadowed. This is intentional behavior for end-user customization, but it means developer file changes are invisible until the database record is deleted.

**Diagnostic Steps**

1. Check if a database override exists for your template:
   ```bash
   wp post list --post_type=wp_template --format=table \
     --fields=ID,post_name,post_status,post_modified
   ```
   ```bash
   wp post list --post_type=wp_template_part --format=table \
     --fields=ID,post_name,post_status,post_modified
   ```
   Any record whose `post_name` matches your template slug is overriding the file.

2. View the content of the DB record versus the file:
   ```bash
   # DB version
   wp post get <POST_ID> --field=post_content

   # File version
   cat templates/your-template.html
   ```

3. Check the Site Editor UI: Appearance → Editor → Templates. A pencil icon or "Modified" label indicates a DB override is present.

**Fix**

Option A — Reset via Site Editor (no CLI needed):
1. Go to Appearance → Editor → Templates (or Template Parts).
2. Find the affected template.
3. Click the three-dot menu (⋮) → "Reset to default".
4. The DB record is deleted; the file version is restored.

Option B — Reset via WP-CLI:
```bash
# List overrides for the specific template
wp post list --post_type=wp_template --post_name=your-template-slug --format=table

# Delete the DB override (replace <POST_ID> with actual ID)
wp post delete <POST_ID> --force

# Repeat for template parts
wp post list --post_type=wp_template_part --post_name=your-part-slug --format=table
wp post delete <POST_ID> --force
```

Option C — Delete ALL template overrides (use with caution on sites with intentional customizations):
```bash
# Preview what will be deleted
wp post list --post_type=wp_template --format=ids

# Delete all (DESTRUCTIVE — confirm with user first)
wp post delete $(wp post list --post_type=wp_template --format=ids) --force
wp post delete $(wp post list --post_type=wp_template_part --format=ids) --force
```

**Prevention**
- During development, keep the Site Editor closed while editing template files directly.
- Treat Site Editor changes as "prototyping only" — always propagate finalized changes back to the theme files and then reset the DB record.
- Add a note in the project README: "Do not save templates in Site Editor during development; edit files directly."

---

#### Category 5: Invalid Block-Support PHP Warning

**Symptoms:**
- PHP notices appear on the front end or in `debug.log` during block rendering
- `Notice: Undefined index: ...` or `Notice: Trying to access array offset on value of type null`
- Warnings reference `WP_Block_Supports`, `block-supports`, or a block's render callback
- Editor shows no matching error for the same block
- Warnings appear only on specific post types or when specific blocks are present

**Root Cause**

Block supports (such as `color`, `typography`, `spacing`) work by reading block attributes from the block's JSON configuration and applying them during server-side render. If the `block.json` `supports` declaration does not match the PHP rendering code, or if a block is being rendered outside its expected context (wrong post type, missing required context), PHP will encounter null or missing array keys. WordPress does not surface these as editor errors — only as PHP notices logged to `debug.log`.

**Diagnostic Steps**

1. Enable full PHP error logging:
   ```bash
   # wp-config.php
   define( 'WP_DEBUG', true );
   define( 'WP_DEBUG_LOG', true );
   define( 'WP_DEBUG_DISPLAY', false );
   ```

2. Reproduce the warning by loading the affected page, then:
   ```bash
   tail -50 wp-content/debug.log
   ```

3. Identify the block name from the stack trace. Look for lines containing:
   - `render_callback`
   - `wp-includes/class-wp-block.php`
   - `wp-includes/block-supports/`

4. Check the block's `block.json` supports declaration:
   ```bash
   # For a custom block in your theme
   cat blocks/your-block/block.json | grep -A 20 '"supports"'
   ```

5. Cross-reference the PHP render callback against what attributes it reads:
   ```bash
   grep -n "\$attributes\[" blocks/your-block/render.php
   # Compare keys accessed versus keys declared in block.json attributes
   ```

6. Check if the warning appears only on certain pages:
   ```bash
   # Identify the post type for pages showing the warning
   wp post list --post_type=any --format=table --fields=ID,post_type,post_title
   ```

**Fix**

1. In the PHP render callback, always check for key existence before accessing:
   ```php
   // Wrong — triggers notice if attribute is missing
   $color = $attributes['textColor'];

   // Correct — safe access with fallback
   $color = $attributes['textColor'] ?? '';

   // Correct — for nested attributes
   $font_size = $attributes['style']['typography']['fontSize'] ?? '';
   ```

2. If the block support is declared in `block.json` but you are not using it in the render callback, remove the support declaration to prevent WordPress from injecting unexpected wrappers:
   ```json
   {
       "supports": {
           "color": false,
           "typography": false
       }
   }
   ```

3. If the warning is from a core block, it may be a WordPress core bug. Check:
   ```bash
   wp core version
   # Compare to WordPress Trac for known issues with that block + version
   ```

4. For context-dependent blocks (e.g., blocks that require `postId` context):
   ```php
   // Guard against missing context
   $post_id = $block->context['postId'] ?? 0;
   if ( ! $post_id ) {
       return '';
   }
   ```

**Prevention**
- Always declare all attributes your render callback reads, with explicit `default` values in `block.json`:
  ```json
  "attributes": {
      "textColor": { "type": "string", "default": "" }
  }
  ```
- Run PHPCS with the WordPress-Extra ruleset to catch unsafe array accesses:
  ```bash
  ./vendor/bin/phpcs --standard=WordPress-Extra blocks/your-block/render.php
  ```

---

#### Category 6: Assets Not Loading / Cache Issue

**Symptoms:**
- Styles missing after theme activation or switching
- JavaScript errors: `Uncaught TypeError: Cannot read properties of undefined` or 404 errors for `.js` files
- Browser Network tab shows 404 on `assets/css/style.css` or `assets/js/main.js`
- Styles appear in development but are missing on staging/production
- `get_template_directory_uri()` returns the wrong path

**Root Cause**

Asset 404s in block themes most often have three causes: (1) the file was not committed or deployed to the server, (2) the enqueue handle uses a hardcoded path instead of `get_template_directory_uri()`, meaning the asset URL breaks when the site moves or the theme is renamed, or (3) a caching plugin (WP Rocket, LiteSpeed Cache, W3 Total Cache) has cached a version of the page from before the asset existed. A less common cause is using `get_stylesheet_directory_uri()` in a parent theme, which resolves to the child theme path if a child theme is active.

**Diagnostic Steps**

1. Confirm the file exists on the server:
   ```bash
   ls -la wp-content/themes/your-theme/assets/css/
   ls -la wp-content/themes/your-theme/assets/js/
   ```

2. Check what WordPress thinks the theme directory URI is:
   ```bash
   wp eval "echo get_template_directory_uri();"
   wp eval "echo get_stylesheet_directory_uri();"
   ```

3. Check the enqueue registration in `functions.php`:
   ```bash
   grep -n "wp_enqueue_style\|wp_enqueue_script" wp-content/themes/your-theme/functions.php
   ```
   Look for hardcoded paths like `/wp-content/themes/my-theme/` — these break on domain change.

4. Check the browser Network tab (F12 → Network → filter by CSS/JS) for 404 responses. Note the full requested URL.

5. Clear all caches:
   ```bash
   wp cache flush
   wp transient delete --all
   # If WP Rocket is active:
   wp rocket clean --confirm
   # If LiteSpeed Cache is active:
   wp litespeed-purge all
   ```

6. Check if the asset has a cache-busting version parameter:
   ```bash
   grep -n "filemtime\|wp_enqueue" wp-content/themes/your-theme/functions.php
   ```
   Using `filemtime()` ensures the browser fetches the new file after deployment.

**Fix**

1. If the file is missing from the server, deploy it:
   ```bash
   # Verify the build output exists locally first
   ls dist/ || npm run build

   # Then sync to server (example with rsync)
   rsync -av dist/ user@server:/path/to/wp-content/themes/your-theme/assets/
   ```

2. Fix hardcoded paths in `functions.php`:
   ```php
   // Wrong
   wp_enqueue_style( 'my-theme', '/wp-content/themes/my-theme/assets/css/style.css' );

   // Correct
   wp_enqueue_style(
       'my-theme-style',
       get_template_directory_uri() . '/assets/css/style.css',
       array(),
       filemtime( get_template_directory() . '/assets/css/style.css' )
   );
   ```

3. Clear all caches after deploying assets:
   ```bash
   wp cache flush
   wp transient delete --all
   ```

4. If using a CDN, purge the CDN cache for the affected asset URLs via the CDN provider dashboard.

**Prevention**
- Always use `get_template_directory_uri()` and `get_template_directory()` in enqueue calls — never hardcode paths.
- Use `filemtime()` as the version parameter so caches bust automatically on file change.
- Include an asset deployment step in your CI/CD pipeline (see `references/ci-cd.md`).
- Test asset loading immediately after every deployment to staging.

---

#### Category 7: Editor Parity Gap

**Symptoms:**
- "It looks correct on the front end but wrong in the editor"
- "It looks correct in the editor but wrong on the front end"
- Block alignment is off in one context
- Custom block styles apply in editor but not front end, or vice versa
- Spacing or color tokens resolve incorrectly in one context

**Root Cause**

The block editor renders blocks inside an `<iframe>` with its own stylesheet cascade. Styles loaded only via `wp_enqueue_styles` on `wp_enqueue_scripts` do not reach the editor. Conversely, styles registered with `add_editor_style()` or `wp_enqueue_block_style()` reach both contexts. When a theme's `editor.css` is missing, incomplete, or targets selectors that do not match the editor DOM structure, front-end and editor appearances diverge. CSS custom properties defined in `theme.json` are injected in both contexts, but any custom CSS that references site-level layout (e.g., header/footer positioning) will have no equivalent in the editor and vice versa.

**Diagnostic Steps**

1. Confirm `editor.css` is registered:
   ```bash
   grep -n "add_editor_style\|editor\.css" wp-content/themes/your-theme/functions.php
   ```
   Correct registration:
   ```php
   add_action( 'after_setup_theme', function(): void {
       add_editor_style( 'assets/css/editor.css' );
   } );
   ```

2. Check the `editor.css` file exists:
   ```bash
   ls -la wp-content/themes/your-theme/assets/css/editor.css
   ```

3. Open the block editor, open browser DevTools, and inspect the editor `<iframe>`:
   - In Chrome: DevTools → Elements → find `<iframe name="editor-canvas">` → right-click → "Inspect frame"
   - Check if `--wp--preset--color--*` properties are present in the iframe `<head>`
   - Check if your `editor.css` is loaded inside the iframe

4. Compare selectors: front-end uses `.wp-block-group`, editor may use `.wp-block-group.is-layout-*`. Check whether your CSS selectors are specific enough for both.

5. For block-specific styles, check if `wp_enqueue_block_style()` is being used (preferred — loads in both contexts automatically):
   ```bash
   grep -n "wp_enqueue_block_style" wp-content/themes/your-theme/functions.php
   ```

**Fix**

1. Register `editor.css` if missing:
   ```php
   add_action( 'after_setup_theme', function(): void {
       add_editor_style( 'assets/css/editor.css' );
   } );
   ```

2. In `editor.css`, mirror all visual CSS from `style.css`. Exclude: header/footer positioning, print styles, animation `@keyframes`. Include: typography, colors, spacing, block-level styles.

3. For per-block styles, switch from `wp_enqueue_scripts` to `wp_enqueue_block_style()` so styles load in both editor and front end automatically:
   ```php
   add_action( 'init', function(): void {
       wp_enqueue_block_style(
           'core/group',
           array(
               'handle' => 'my-theme-group-styles',
               'src'    => get_template_directory_uri() . '/assets/css/blocks/group.css',
               'path'   => get_template_directory() . '/assets/css/blocks/group.css',
           )
       );
   } );
   ```

4. For theme.json `customCss` or block `css` properties, note that these apply in both contexts by default — check that values use `var(--wp--preset--*)` rather than raw CSS values.

**Prevention**
- Maintain `editor.css` as a peer of `style.css` and update both in lockstep.
- Use `wp_enqueue_block_style()` for all per-block CSS rather than global enqueue.
- Check editor rendering visually during development, not just the front end.
- Add an editor parity check to the `references/validation-checklist.md` sign-off.

---

#### Category 8: Classic-to-Block Conversion Artifact

**Symptoms:**
- Shortcode output shows as literal text: `[contact-form-7 id="5"]`
- Widget HTML leaks into block output as raw markup
- ACF field value does not appear inside a block binding
- Classic editor content renders inside a `<p>` tag wrapping a block comment
- Old theme's PHP template tags (e.g., `<?php get_sidebar(); ?>`) appear as text

**Root Cause**

Classic WordPress rendered content by calling PHP template functions directly. Block themes render content by parsing serialized HTML block comments. When classic content — shortcodes, PHP template tags, widget HTML — is stored in the database as raw strings and then loaded into a block theme context without conversion, one of three things happens: (1) the shortcode runs fine because `do_shortcode` is still called on `the_content`, (2) the shortcode or PHP tag appears as literal text because the display path changed, or (3) the block comment is stored but the referenced pattern or block registration no longer exists.

**Diagnostic Steps**

1. Check whether the shortcode is still registered:
   ```bash
   wp eval 'global $shortcode_tags; echo implode(PHP_EOL, array_keys($shortcode_tags));' | grep your-shortcode
   ```

2. Check the raw content of the affected post:
   ```bash
   wp post get <POST_ID> --field=post_content
   ```
   Look for `[shortcode_tag]`, `<?php`, raw HTML widget markup, or orphaned block comments.

3. Test if `do_shortcode` is active on `the_content`:
   ```bash
   # This should return "10" (default priority) if shortcodes run on the_content
   wp eval 'echo has_filter("the_content", "do_shortcode");'
   ```

4. For ACF bindings that are not rendering, verify the meta key is registered with `show_in_rest: true`:
   ```bash
   wp eval '
   $meta = get_registered_meta_keys("post");
   foreach ($meta as $key => $args) {
       if (!empty($args["show_in_rest"])) echo $key . PHP_EOL;
   }
   '
   ```

5. For widget HTML leaking, check if the old theme's `functions.php` registered widget areas that are now orphaned:
   ```bash
   wp eval 'global $wp_registered_sidebars; print_r(array_keys($wp_registered_sidebars));'
   ```

**Fix**

For shortcodes rendering as literal text:
```php
// Ensure do_shortcode runs on content areas where your shortcode appears.
// If content bypasses the_content filter (e.g., manual echo), add it:
add_filter( 'the_content', 'do_shortcode', 11 );
```

For ACF field values not appearing in Block Bindings:
```php
// Register the meta key with REST API access enabled
add_action( 'init', function(): void {
    register_post_meta( 'post', 'your_field_key', array(
        'show_in_rest'  => true,
        'single'        => true,
        'type'          => 'string',
        'auth_callback' => function(): bool {
            return current_user_can( 'edit_posts' );
        },
    ) );
} );
```

For widget HTML leaking into block content:
1. Identify the affected template part and remove the PHP `dynamic_sidebar()` call.
2. Replace with the equivalent block markup (see `references/block-conversion-map.md`).
3. Delete the old sidebar registration from `functions.php`.

For orphaned block comments (block references with no registered block):
```bash
# Find posts containing a block reference that no longer exists
wp post list --post_type=any --format=ids | \
  xargs -I{} wp eval "
    \$p = get_post({});
    if (preg_match('/wp:my-old-plugin\/missing-block/', \$p->post_content)) {
        echo 'Post ' . {} . ': ' . \$p->post_title . PHP_EOL;
    }
  "
```

**Prevention**
- Run `node scripts/check-patterns.mjs` and `node scripts/lint-block-markup.mjs` after every migration.
- When deactivating a plugin that provides shortcodes or blocks, replace all usages in content first.
- Use `/wp-migrate` (this skill's migration command) to systematically convert shortcodes to blocks before switching themes.

---

### Step 4: Offer to Apply the Fix

After presenting the diagnosis and fix for the matched category, ask:

> "Want me to apply the fix to your theme files? If yes, share:
> 1. Your theme slug (the folder name under `wp-content/themes/`)
> 2. The affected file(s) or template name
> 3. Any relevant current file content (paste or describe)"

If the user says yes, generate the complete corrected file(s) using the appropriate template from the `templates/` directory and the fix steps above.

---

## Output Format

When diagnosing, use this structure:

```
## Diagnosis: [Category Name]

**Matched symptom:** [quote the user's symptom]

**Root cause:** [1–2 sentence explanation]

### Diagnostic Steps
[numbered steps]

### Fix
[numbered steps with code blocks]

### Prevention
[bullet points]

---
Want me to apply the fix to your theme files?
```

## Example Invocations

```
/wp-debug
I'm getting "This block contains unexpected or invalid content" on my hero template after updating to WordPress 6.7.
```

```
/wp-debug
My brand colors are set in theme.json but the site keeps showing default gray and blue. Color palette looks wrong in the editor too.
```

```
/wp-debug
I edited templates/home.html directly but the homepage still shows the old layout. Site Editor shows the old version too.
```

```
/wp-debug
I switched from a classic theme. My [contact-form-7 id="5"] shortcodes now just show as text on the page.
```

## Read Also

- `references/troubleshooting.md` — comprehensive symptom → cause → fix reference with deep dives
- `references/theme-json-schema.md` — theme.json structure, valid keys by WP version
- `references/validation-checklist.md` — post-deployment verification steps
- `commands/wp-migrate.md` — systematic migration of classic content to blocks
- `commands/wp-plugin-theme.md` — plugin compatibility issues
