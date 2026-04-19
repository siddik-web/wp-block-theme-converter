# Quality Rules — Non-Negotiable

These rules apply to EVERY file in the generated theme. Violations result in failed WordPress.org reviews, accessibility issues, or production bugs.

## ❌ NEVER

### In Block Markup (Templates / Parts / Patterns)

- **NEVER** use inline `style=""` attributes
  - ❌ `<div style="background: red;">`
  - ✅ Use block attributes: `<!-- wp:group {"backgroundColor":"primary"} -->`

- **NEVER** include `<style>` tags
  - ❌ `<style>.hero { color: red; }</style>`
  - ✅ Put CSS in `assets/css/style.css` AND `assets/css/editor.css`

- **NEVER** include `<script>` tags
  - ❌ `<script>document.querySelector(...)</script>`
  - ✅ Enqueue via `wp_enqueue_script()` in `inc/enqueue.php`

- **NEVER** hardcode asset paths
  - ❌ `<img src="/wp-content/themes/my-theme/assets/img.jpg">`
  - ✅ `<img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/img.jpg">`

- **NEVER** hardcode user-facing strings
  - ❌ `<h1>Welcome to our site</h1>`
  - ✅ `<h1><?php esc_html_e( 'Welcome to our site', 'theme-slug' ); ?></h1>`

### In CSS (assets/css/*.css)

- **NEVER** hardcode colors
  - ❌ `color: #0F172A;`
  - ✅ `color: var(--wp--preset--color--primary);`

- **NEVER** hardcode font sizes (when a preset exists)
  - ❌ `font-size: 1.5rem;`
  - ✅ `font-size: var(--wp--preset--font-size--large);`

- **NEVER** hardcode spacing
  - ❌ `padding: 2rem;`
  - ✅ `padding: var(--wp--preset--spacing--50);`

- **NEVER** use IDs for styling
  - ❌ `#hero { ... }`
  - ✅ `.wp-block-group.is-style-hero { ... }`

- **NEVER** use `!important` (except as a last resort to override WordPress core styles)

- **NEVER** use physical directional properties when logical alternatives exist (for RTL support)
  - ❌ `margin-left: 1rem;`
  - ✅ `margin-inline-start: 1rem;`
  - ❌ `text-align: left;`
  - ✅ `text-align: start;`

### In PHP

- **NEVER** echo unescaped output
  - ❌ `<?php echo $user_input; ?>`
  - ✅ `<?php echo esc_html( $user_input ); ?>`
  - ✅ `<?php echo esc_attr( $attribute_value ); ?>`
  - ✅ `<?php echo esc_url( $url ); ?>`
  - ✅ `<?php echo wp_kses_post( $rich_text ); ?>`

- **NEVER** double-escape translation functions
  - ❌ `<?php echo esc_html( __( 'text', 'domain' ) ); ?>`
  - ✅ `<?php esc_html_e( 'text', 'domain' ); ?>`
  - ✅ `<?php echo esc_html__( 'text', 'domain' ); ?>`

- **NEVER** use deprecated WordPress functions
  - Check against: https://developer.wordpress.org/reference/since/

- **NEVER** make direct database queries
  - ❌ `$wpdb->query("SELECT * FROM wp_posts WHERE ...")`
  - ✅ `WP_Query` or core functions like `get_posts()`

- **NEVER** use `eval()`, `exec()`, `system()`, `passthru()`, `popen()`

- **NEVER** use `file_get_contents()` on user input

- **NEVER** trust `$_GET`, `$_POST`, `$_REQUEST`, or `$_COOKIE` data
  - Always sanitize with `sanitize_text_field()`, `absint()`, `wp_verify_nonce()`, etc.

- **NEVER** put real CSS in `style.css`
  - The root `style.css` file is ONLY for the theme header (Theme Name, Author, etc.)
  - Real CSS goes in `assets/css/style.css`

### In JavaScript

- **NEVER** include inline JS in patterns or templates (CSP-unsafe)
- **NEVER** assume libraries exist without checking (`if ( typeof jQuery !== 'undefined' )`)
- **NEVER** ignore `prefers-reduced-motion` for animations
- **NEVER** block the main thread with synchronous operations
- **NEVER** use Alpine.js when the Interactivity API can handle the same interaction — Alpine adds unnecessary bundle weight when WordPress provides native reactivity
- **NEVER** write inline expressions in Interactivity API directives — all logic must be in the `store()` definition

### In theme.json

- **NEVER** mix `version: 2` and `version: 3` syntax
- **NEVER** use color names like "white", "black" as slugs — use semantic names
- **NEVER** forget the `$schema` declaration
- **NEVER** include trailing commas (invalid JSON)

---

## ✅ ALWAYS

### In Block Markup

- **ALWAYS** use semantic HTML via `tagName`
  - `<!-- wp:group {"tagName":"section"} -->` for `<section>`
  - `<!-- wp:group {"tagName":"main"} -->` for `<main>`

- **ALWAYS** include alt text on images
  - `alt="<?php esc_attr_e( 'Description', 'text-domain' ); ?>"`
  - For decorative images, use `alt=""`

- **ALWAYS** use template parts for header/footer
  - `<!-- wp:template-part {"slug":"header","tagName":"header"} /-->`

- **ALWAYS** wrap content in `<!-- wp:group {"layout":{"type":"constrained"}} -->` to respect content/wide widths

### In CSS

- **ALWAYS** mirror frontend styles in `assets/css/editor.css` so the editor matches the frontend

- **ALWAYS** prefix custom classes with theme slug
  - `.{{theme-slug}}-card`
  - `.{{theme-slug}}-hero`

- **ALWAYS** use CSS custom properties from theme.json
  - `var(--wp--preset--color--primary)`
  - `var(--wp--preset--spacing--40)`

- **ALWAYS** include focus styles
  - `:focus-visible { outline: 2px solid var(--wp--preset--color--accent); outline-offset: 2px; }`

### In PHP

- **ALWAYS** check for ABSPATH at the top of every PHP file
  - `<?php defined( 'ABSPATH' ) || exit;`

- **ALWAYS** prefix function names with theme slug
  - `function {{theme_slug_underscored}}_enqueue_scripts() { ... }`

- **ALWAYS** version assets with `filemtime()`
  - `wp_enqueue_style( 'handle', $src, [], filemtime( $path ), 'all' );`

- **ALWAYS** wrap WooCommerce-specific code in feature checks
  - `if ( class_exists( 'WooCommerce' ) ) { ... }`

- **ALWAYS** load text domain in `after_setup_theme`
  - `load_theme_textdomain( 'text-domain', get_template_directory() . '/languages' );`

- **ALWAYS** use Yoda conditions
  - `if ( null === $value ) { }` not `if ( $value === null ) { }`

- **ALWAYS** follow WordPress Coding Standards
  - Yoda conditions, spaces inside parens, proper alignment, etc.

### In JavaScript

- **ALWAYS** use `defer` strategy for non-critical classic scripts
- **ALWAYS** check `prefers-reduced-motion` before animations
- **ALWAYS** use `wp_localize_script()` to pass dynamic values (for classic scripts)
- **ALWAYS** use `@wordpress/i18n` package for JS strings
  - `import { __ } from '@wordpress/i18n';`
  - `__( 'Loading...', 'text-domain' )`
- **ALWAYS** use Interactivity API (`@wordpress/interactivity`) for simple interactive patterns (modals, tabs, toggles, dropdowns)
- **ALWAYS** register Interactivity API scripts via `wp_register_script_module()` (not `wp_enqueue_script()`)
- **ALWAYS** include proper ARIA attributes in Interactivity API patterns (`aria-expanded`, `aria-hidden`, `aria-label`, `role`)
- **ALWAYS** use `wp_enqueue_block_style()` to load per-block CSS conditionally (WordPress 6.3+)

### In theme.json

- **ALWAYS** include `$schema` declaration
- **ALWAYS** use `version: 3`
- **ALWAYS** set `appearanceTools: true`
- **ALWAYS** set `useRootPaddingAwareAlignments: true`
- **ALWAYS** define `layout.contentSize` and `layout.wideSize`
- **ALWAYS** set `defaultPalette: false` if you provide a custom palette (otherwise editor shows BOTH yours and WP's)
- **ALWAYS** include `:hover`, `:focus`, and `:active` for `elements.button` and `:hover` and `:focus` for `elements.link`

### In Patterns

- **ALWAYS** include the full PHP header docblock
- **ALWAYS** register pattern categories before patterns reference them
- **ALWAYS** use `<?php esc_html_e()` for all visible text
- **ALWAYS** use `<?php echo esc_url( get_template_directory_uri() )` for asset URLs

---

## Accessibility Rules (WCAG 2.1 AA)

- **ALWAYS** include skip-link in header part
- **ALWAYS** ensure heading hierarchy is logical (no skipped levels)
- **ALWAYS** ensure color contrast ≥ 4.5:1 for body text
- **ALWAYS** ensure color contrast ≥ 3:1 for large text (18pt+ or 14pt+ bold)
- **ALWAYS** provide visible focus indicators on all interactive elements
- **ALWAYS** associate form labels with inputs
- **ALWAYS** use `aria-label` for icon-only buttons
- **NEVER** auto-play video or audio with sound
- **NEVER** use color alone to convey meaning
- **NEVER** use font sizes below 12px for body text

## Performance Rules (Core Web Vitals)

Target metrics:
- **LCP** (Largest Contentful Paint) < 2.5s
- **CLS** (Cumulative Layout Shift) < 0.1
- **INP** (Interaction to Next Paint) < 200ms

Required practices:
- Self-host fonts via `assets/fonts/`
- Use `loading="eager"` and `fetchpriority="high"` on the LCP image
- Use `loading="lazy"` on below-fold images (WP core default since 5.5)
- Defer all non-critical JS via `'strategy' => 'defer'`
- Inline critical above-fold CSS via `wp_add_inline_style()`
- Set explicit dimensions on all images (prevents CLS)
- Preload key fonts: `<link rel="preload" href="..." as="font" type="font/woff2" crossorigin>`

## i18n Rules

- **ALWAYS** wrap user-facing strings in translation functions
- **ALWAYS** use the same text-domain everywhere (matches theme slug)
- **ALWAYS** use `_n()` for plural-aware strings
- **ALWAYS** use `_x()` when context disambiguates meaning
- **NEVER** concatenate translated strings (use `sprintf()` with placeholders)
  - ❌ `__( 'Posted on ' ) . $date`
  - ✅ `sprintf( __( 'Posted on %s', 'domain' ), $date )`

## Security Rules

- **ALWAYS** sanitize input
  - `sanitize_text_field()` for plain text
  - `sanitize_email()` for emails
  - `sanitize_url()` for URLs
  - `absint()` for positive integers
  - `wp_kses_post()` for HTML that allows post-content tags
- **ALWAYS** escape output (covered above)
- **ALWAYS** use nonces for forms and AJAX
  - `wp_create_nonce( 'action_name' )`
  - `wp_verify_nonce( $_POST['nonce'], 'action_name' )`
- **ALWAYS** check user capabilities
  - `current_user_can( 'manage_options' )` before admin actions
- **NEVER** trust user input
- **NEVER** include database credentials or API keys in theme files
