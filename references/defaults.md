# Default Values Reference

When the user doesn't specify a value, use these defaults. Always note assumed defaults in the "Decisions Made" section of the output.

## Theme Identity Defaults

| Field | Default | Notes |
|-------|---------|-------|
| Theme Slug | Derive from Theme Name (lowercase, hyphenated, max 30 chars) | e.g., "Acme Co" → "acme-co" |
| Text Domain | Same as theme slug | Required to match WordPress.org submission rules |
| Version | `1.0.0` | Semver |
| Author Name | "Theme Author" | Ask if user is publishing |
| Author URI | (empty) | Optional |
| Theme URI | (empty) | Optional |
| Description | Generate from project type | "A modern WordPress block theme for {{project-type}}." |

## Compatibility Defaults

| Field | Default | Rationale |
|-------|---------|-----------|
| Requires WP | `6.6` | First WP version with Section Styles + mature Interactivity API |
| Tested Up To | `6.8` | Latest stable as of early 2025 — UPDATE this to match the current WP release at generation time |
| Requires PHP | `7.4` | WordPress minimum + matches most shared hosts |
| License | `GPL-2.0-or-later` | Required for WordPress.org |
| License URI | `https://www.gnu.org/licenses/gpl-2.0.html` | Standard |

**IMPORTANT:** Always check the current WordPress stable release before setting "Tested Up To". If unsure, use web search to confirm the latest version. Do not hardcode a version that may be outdated.

## Tags Defaults (by project type)

| Project Type | Suggested Tags |
|--------------|----------------|
| Blog | `blog, news, two-columns, full-site-editing, block-styles, wide-blocks, custom-colors, custom-logo, editor-style, featured-images, threaded-comments, translation-ready` |
| Portfolio | `portfolio, photography, full-site-editing, block-styles, wide-blocks, custom-colors, custom-logo, featured-images, translation-ready` |
| Business / SaaS | `business, full-site-editing, block-styles, wide-blocks, block-patterns, custom-colors, custom-logo, custom-menu, editor-style, translation-ready` |
| eCommerce | `e-commerce, full-site-editing, block-styles, wide-blocks, block-patterns, custom-colors, custom-logo, editor-style, featured-images, threaded-comments, translation-ready` |
| News / Magazine | `news, magazine, blog, three-columns, full-site-editing, block-styles, wide-blocks, block-patterns, custom-colors, custom-logo, custom-menu, editor-style, featured-images, threaded-comments, translation-ready` |

## Build System Defaults

| Field | Default | Reasoning |
|-------|---------|-----------|
| Build System | `Vite 6 with HMR` | Fast, modern, matches user's preferred stack |
| Node Version | `20+` | Current LTS |
| CSS Preprocessor | `PostCSS` (with autoprefixer + nesting plugins) | Native, no Sass dependency |
| Linting PHP | `PHPCS WordPress-Extra ruleset` | Standard for WP submission |
| Linting JS | `@wordpress/eslint-plugin` | Standard for WP |
| Linting CSS | `Stylelint @wordpress/stylelint-config` | Standard for WP |

## Interactive Components Defaults

| Component | Default Strategy | Rationale |
|-----------|-----------------|-----------|
| Accordion / FAQ | `core/details` block (native) | No JS needed, WP 6.3+ |
| Modal / Dialog | Interactivity API | WordPress-native, replaces Alpine/vanilla |
| Tabs | Interactivity API | WordPress-native |
| Dropdown menus | Interactivity API | WordPress-native |
| Image lightbox | `core/image` built-in lightbox | Native WP 6.5+ |
| Carousel / Slider | Swiper.js via `wp_enqueue_script()` | Needs gesture support |
| Complex animation | GSAP via `wp_enqueue_script()` | Specialized library |
| Mobile menu toggle | Interactivity API | Simple state toggle |

**IMPORTANT:** Default to the Interactivity API for all simple interactive patterns. Only fall back to `wp_enqueue_script()` for libraries that need gesture support or complex animation. See `references/modern-blocks.md` for the full decision matrix.

## Layout Defaults

| Field | Default |
|-------|---------|
| Container Width (`contentSize`) | `1200px` |
| Wide Width (`wideSize`) | `1400px` |
| Root Padding | `var(--wp--preset--spacing--40)` (responsive) |
| Block Gap | `var(--wp--preset--spacing--30)` |

## Color Palette Defaults (Generic)

If no design tokens provided:

```json
[
  { "slug": "primary",    "color": "#0F172A", "name": "Primary" },
  { "slug": "secondary",  "color": "#475569", "name": "Secondary" },
  { "slug": "accent",     "color": "#3B82F6", "name": "Accent" },
  { "slug": "background", "color": "#FFFFFF", "name": "Background" },
  { "slug": "surface",    "color": "#F8FAFC", "name": "Surface" },
  { "slug": "text",       "color": "#0F172A", "name": "Text" },
  { "slug": "muted",      "color": "#64748B", "name": "Muted" },
  { "slug": "border",     "color": "#E2E8F0", "name": "Border" }
]
```

## Typography Defaults

If no fonts specified:
- **Heading:** `"Plus Jakarta Sans", system-ui, sans-serif`
- **Body:** `"Inter", system-ui, sans-serif`
- **Mono:** `"JetBrains Mono", ui-monospace, monospace`

NOTE: NEVER default to plain "Inter" or "Roboto" alone — pair with system-ui fallback. For production themes, recommend self-hosting via `assets/fonts/` for GDPR compliance.

## Font Size Scale (Fluid)

```json
[
  { "slug": "small",   "size": "0.875rem", "name": "Small",   "fluid": { "min": "0.875rem", "max": "1rem" } },
  { "slug": "medium",  "size": "1rem",     "name": "Medium",  "fluid": { "min": "1rem", "max": "1.125rem" } },
  { "slug": "large",   "size": "1.5rem",   "name": "Large",   "fluid": { "min": "1.25rem", "max": "1.5rem" } },
  { "slug": "x-large", "size": "2.25rem",  "name": "Extra Large", "fluid": { "min": "1.75rem", "max": "2.25rem" } },
  { "slug": "xx-large", "size": "3.5rem",  "name": "2X Large", "fluid": { "min": "2.5rem", "max": "3.5rem" } },
  { "slug": "huge",    "size": "5rem",     "name": "Huge",    "fluid": { "min": "3rem", "max": "5rem" } }
]
```

## Spacing Scale

```json
[
  { "slug": "20", "size": "0.5rem",  "name": "2X Small" },
  { "slug": "30", "size": "1rem",    "name": "Extra Small" },
  { "slug": "40", "size": "1.5rem",  "name": "Small" },
  { "slug": "50", "size": "2.5rem",  "name": "Medium" },
  { "slug": "60", "size": "4rem",    "name": "Large" },
  { "slug": "70", "size": "6rem",    "name": "Extra Large" },
  { "slug": "80", "size": "9rem",    "name": "2X Large" }
]
```

## Border Radius Defaults

```json
{
  "radiusStyle": [
    { "slug": "none",  "size": "0",      "name": "None" },
    { "slug": "small", "size": "0.25rem", "name": "Small" },
    { "slug": "base",  "size": "0.5rem",  "name": "Base" },
    { "slug": "large", "size": "1rem",    "name": "Large" },
    { "slug": "pill",  "size": "999px",   "name": "Pill" }
  ]
}
```

## Shadow Presets Defaults

```json
[
  { "slug": "natural", "name": "Natural", "shadow": "0 2px 4px rgba(0,0,0,0.05)" },
  { "slug": "deep",    "name": "Deep",    "shadow": "0 8px 24px rgba(0,0,0,0.12)" },
  { "slug": "sharp",   "name": "Sharp",   "shadow": "0 4px 0 rgba(0,0,0,0.9)" }
]
```

## When NOT to Use Defaults

Always extract from source if available:
- CSS custom properties in `:root` — extract these as priority
- Repeated color values in stylesheets — palette these
- `font-family` declarations — use as font families
- `@import` font URLs — note for self-hosting
