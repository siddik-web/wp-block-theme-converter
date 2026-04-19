# Post-Generation Validation Checklist

After Claude generates the theme, run through these checks. Provide this checklist to the user as part of the closing output.

## File Structure Validation

- [ ] `style.css` exists at theme root with valid theme header
- [ ] `theme.json` exists at theme root with `version: 3`
- [ ] `templates/index.html` exists (required fallback)
- [ ] `parts/header.html` and `parts/footer.html` exist
- [ ] All file paths use lowercase + hyphens (no underscores or camelCase in filenames)
- [ ] `screenshot.png` placeholder note is included (or actual file added)

## theme.json Validation

- [ ] Validates against schema at https://validator.poet.so/theme-json
- [ ] `$schema` declaration present
- [ ] `version: 3`
- [ ] `appearanceTools: true` set
- [ ] `useRootPaddingAwareAlignments: true` set
- [ ] All custom colors have semantic slugs (not "white", "black")
- [ ] `defaultPalette: false` set if custom palette provided
- [ ] All `fontFace` `src` paths point to actual files in `assets/fonts/`
- [ ] All `templateParts` referenced in templates exist in `parts/`
- [ ] All `customTemplates` referenced have matching files in `templates/`

## PHP Validation

- [ ] All PHP files start with `<?php defined( 'ABSPATH' ) || exit;`
- [ ] All function names prefixed with theme slug
- [ ] No deprecated WordPress functions used
- [ ] All output escaped (`esc_html`, `esc_attr`, `esc_url`, `wp_kses_post`)
- [ ] All user-facing strings use translation functions with correct text-domain
- [ ] No direct database queries
- [ ] No `eval()`, `exec()`, etc.
- [ ] PHPCS passes with WordPress-Extra ruleset:
  ```bash
  ./vendor/bin/phpcs --standard=phpcs.xml .
  ```

## Block Markup Validation

- [ ] No inline `<style>` tags in templates/parts/patterns
- [ ] No inline `<script>` tags in templates/parts/patterns
- [ ] No `style=""` attributes (use block attributes instead)
- [ ] All asset URLs use `<?php echo esc_url( get_template_directory_uri() ); ?>`
- [ ] All images have `alt` attribute (or `alt=""` for decorative)
- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] Templates open in Site Editor without errors
- [ ] All `<!-- wp:pattern --> ` references have matching pattern files

## CSS Validation

- [ ] No hardcoded colors (use `var(--wp--preset--color--*)`)
- [ ] No hardcoded font sizes (use `var(--wp--preset--font-size--*)`)
- [ ] No hardcoded spacing (use `var(--wp--preset--spacing--*)`)
- [ ] All custom classes prefixed with theme slug
- [ ] No `!important` declarations (or only as last resort)
- [ ] `editor.css` mirrors frontend `style.css` for editor parity
- [ ] Stylelint passes:
  ```bash
  npx stylelint "assets/css/**/*.css"
  ```

## JavaScript Validation

- [ ] All classic scripts enqueued via `wp_enqueue_script()` (not inline)
- [ ] `defer` strategy used for non-critical classic scripts
- [ ] `wp_localize_script()` used for any dynamic config (classic scripts)
- [ ] `prefers-reduced-motion` respected for animations
- [ ] Interactivity API scripts registered via `wp_register_script_module()` (not `wp_enqueue_script()`)
- [ ] Interactivity API patterns include proper ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-label`)
- [ ] No Alpine.js used for interactions that the Interactivity API can handle
- [ ] ESLint passes:
  ```bash
  npx eslint assets/js/
  ```

## Modern Features Validation (WordPress 6.5+)

- [ ] Per-block CSS loaded via `wp_enqueue_block_style()` for blocks with custom styling
- [ ] Font preloading implemented for critical fonts (body font at minimum)
- [ ] CSS uses logical properties (`margin-inline-start`, `padding-inline-end`) not physical ones
- [ ] Section Styles defined in theme.json `styles.blocks.core/group.variations` (if dark/highlight sections exist)
- [ ] Block Bindings used for dynamic data in patterns (custom fields, site options) instead of PHP render callbacks
- [ ] Image lightbox enabled in theme.json `settings.blocks.core/image.lightbox` (if source had lightbox functionality)
- [ ] `dimensions.minHeight` and `position.sticky` enabled in theme.json settings

## i18n Validation

- [ ] `text-domain` argument matches theme slug everywhere
- [ ] No hardcoded user-facing strings in PHP
- [ ] `languages/{{text-domain}}.pot` exists (even if empty)
- [ ] `load_theme_textdomain()` called in setup
- [ ] `_n()` used for plural-aware strings
- [ ] `sprintf()` used for strings with placeholders (no concatenation)

## Accessibility Validation (WCAG 2.1 AA)

- [ ] Skip-link in header part
- [ ] All ARIA landmarks present (`<header>`, `<main>`, `<footer>`, `<nav>`)
- [ ] Color contrast ≥ 4.5:1 for body text (test with WebAIM Contrast Checker)
- [ ] Color contrast ≥ 3:1 for large text and UI components
- [ ] Focus styles visible on all interactive elements
- [ ] No autoplay video/audio with sound
- [ ] axe DevTools shows 0 critical issues

## Performance Validation (Core Web Vitals)

After installing the theme on a real WordPress site:

- [ ] Lighthouse Performance score ≥ 90
- [ ] Lighthouse Accessibility score = 100
- [ ] Lighthouse Best Practices score ≥ 95
- [ ] Lighthouse SEO score = 100
- [ ] LCP < 2.5s
- [ ] CLS < 0.1
- [ ] INP < 200ms
- [ ] All images have explicit dimensions
- [ ] LCP image has `fetchpriority="high"`
- [ ] Below-fold images use `loading="lazy"`
- [ ] Fonts self-hosted (no external Google Fonts requests)

## WordPress Standards Validation

Run **Theme Check** plugin (https://wordpress.org/plugins/theme-check/):

- [ ] No errors
- [ ] No warnings about required functions
- [ ] License declared correctly
- [ ] Text domain matches everywhere

## WordPress.org Submission Validation (if applicable)

- [ ] All theme info in `style.css` header complete
- [ ] `readme.txt` follows WordPress.org format
- [ ] `screenshot.png` is 1200×900 PNG, ≤ 1MB
- [ ] Copyright/attribution section in `readme.txt` lists all third-party assets
- [ ] License is GPL-compatible
- [ ] No premium-only features blocked behind paywalls
- [ ] No tracking scripts or analytics included by default
- [ ] No promotional content in admin
- [ ] Tested on multisite
- [ ] Tested in WP_DEBUG mode (no notices/warnings)

## WooCommerce Validation (if applicable)

- [ ] `add_theme_support( 'woocommerce' )` declared
- [ ] HPOS compatibility declared
- [ ] All WC-specific templates exist (`single-product.html`, etc.)
- [ ] WC blocks render correctly
- [ ] Cart/Checkout templates use minimal header/footer
- [ ] Tested with empty cart, items in cart, completed checkout
- [ ] Tested with WC Blocks Cart and Checkout
- [ ] Graceful fallback if WC is not installed

## Build System Validation (if Vite/webpack used)

- [ ] `npm install` runs without errors
- [ ] `npm run build` produces optimized assets
- [ ] `npm run dev` starts HMR server
- [ ] Build output goes to expected directory
- [ ] No source files committed (verify `.gitignore`)
- [ ] All dependencies pinned in `package.json`

## Manual Testing Checklist

- [ ] Activate theme in fresh WordPress install
- [ ] Open Site Editor — all templates appear
- [ ] Open Patterns — all patterns appear under correct categories
- [ ] Open Styles — all style variations appear (if multi-aesthetic)
- [ ] Test in mobile viewport (responsive design works)
- [ ] Test in dark mode (if applicable)
- [ ] Test with sample content (Theme Unit Test data)
- [ ] Test with WooCommerce sample products (if WC theme)
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Test keyboard navigation
- [ ] Test screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Test on slow 3G connection (Chrome DevTools throttling)

## Recommended Tools

- **Theme Check Plugin** — https://wordpress.org/plugins/theme-check/
- **Query Monitor Plugin** — https://wordpress.org/plugins/query-monitor/
- **PHPCS** — https://github.com/squizlabs/PHP_CodeSniffer
- **WordPress Coding Standards** — https://github.com/WordPress/WordPress-Coding-Standards
- **theme.json Validator** — https://validator.poet.so/theme-json
- **Lighthouse** — Built into Chrome DevTools
- **axe DevTools** — https://www.deque.com/axe/devtools/
- **WAVE** — https://wave.webaim.org/
- **WebAIM Contrast Checker** — https://webaim.org/resources/contrastchecker/
- **WP-CLI** — https://wp-cli.org/

## Common Issues & Fixes

### Issue: theme.json doesn't apply
**Fix:** Clear WordPress cache. Check for syntax errors in JSON. Verify `version: 3`.

### Issue: Patterns don't show in Site Editor
**Fix:** Verify pattern category is registered before patterns reference it. Verify file header docblock is intact.

### Issue: Fonts don't load
**Fix:** Check `fontFace.src` paths are relative to theme root with `file:./` prefix. Verify font files exist.

### Issue: Block styles don't show
**Fix:** Verify `register_block_style()` is called on `init` hook. Verify CSS is enqueued.

### Issue: Editor doesn't match frontend
**Fix:** Add styles to `assets/css/editor.css` AND ensure `add_editor_style()` is called.

### Issue: WooCommerce blocks have no styling
**Fix:** Add `inc/woocommerce.php` to bootstrap. Add WC block overrides to theme.json.

### Issue: PHPCS reports violations
**Fix:** Run `phpcbf` (auto-fixer) first: `./vendor/bin/phpcbf --standard=phpcs.xml .`

### Issue: Interactivity API directives don't work
**Fix:** Verify script is registered with `wp_register_script_module()` (not `wp_enqueue_script()`). Check that the `data-wp-interactive` namespace matches the `store()` call. Ensure `@wordpress/interactivity` is listed as a dependency.

### Issue: Per-block CSS not loading
**Fix:** Verify `wp_enqueue_block_style()` is hooked to `init` (not `wp_enqueue_scripts`). Check that the `path` parameter points to the absolute filesystem path (not URL). Ensure the block name matches exactly (e.g., `core/quote` not `quote`).

### Issue: Font preloading causes double-load
**Fix:** Ensure the `href` in the preload link exactly matches the `src` in theme.json `fontFace`. Use `crossorigin` attribute on the preload tag (required for fonts). Only preload 1-2 critical font files, not all weights/styles.

### Issue: CSS not working in RTL languages
**Fix:** Replace physical CSS properties with logical equivalents. `margin-left` → `margin-inline-start`, `padding-right` → `padding-inline-end`, `text-align: left` → `text-align: start`. See `references/modern-blocks.md` → RTL & Logical Properties.
