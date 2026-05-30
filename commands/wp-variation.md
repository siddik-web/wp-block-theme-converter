---
description: Generate a WordPress block theme style variation (styles/*.json) — dark mode, color palette swap, or font swap.
---

# /wp-variation

**Purpose:** Generate a WordPress block theme style variation — a `styles/*.json` file that overrides color, typography, and spacing from the base `theme.json` to create an alternative theme aesthetic.

## When to Use

Trigger this command when:

- The user wants a dark, light, high-contrast, seasonal, or brand-alternate version of their theme
- The user says "color scheme", "variant", "skin", "dark mode", "alternate palette"
- A design system has multiple brand expressions (e.g., marketing vs. product, seasonal themes)

**Do not** use this command for per-page or per-block style changes — style variations apply globally to the entire site.

## Workflow

### Step 1: Gather Variation Details

Ask (or infer from context):

| Question | Default if silent |
|----------|-------------------|
| Variation name (human-readable) | Required — always ask |
| Variation slug (kebab-case file name) | Derived from name |
| What to change: colors, typography, spacing, or all three? | Colors only (most common) |
| Color palette overrides | Required if colors are changing |
| Font overrides | Optional — only if changing fonts |
| Spacing overrides | Optional — only if changing scale |
| Is this a **global variation** (appears in Site Editor) or a **scoped variation** (Section Style on a Group block)? | Global variation |

**Global vs Scoped Variations:**

| | Global Style Variation | Section Style |
|-|----------------------|---------------|
| Applies to | Entire site | A single block instance |
| File location | `styles/{{slug}}.json` | `styles.blocks.core/group.variations.{{slug}}` in theme.json |
| Appears in | Site Editor → Styles → Browse styles | Block toolbar → Styles |
| WordPress version | 6.0+ | 6.6+ |

If the user wants a variation for a single block (e.g., a "dark section" Group block), refer to `references/modern-blocks.md` — Section Styles section instead.

### Step 2: State the Variation Plan

```
VARIATION PLAN: {{Variation Name}}
File: styles/{{slug}}.json
Changes:
  Colors:     {{list color palette changes}}
  Typography: {{list font changes, or "no changes"}}
  Spacing:    {{list spacing changes, or "no changes"}}
  Elements:   {{list element style changes}}
```

### Step 3: Generate the Variation File

Style variations are **partial `theme.json` files** — they override only the keys they define. The rest inherits from the base `theme.json`.

**Minimum valid structure:**

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "{{Variation Name}}",
    "slug": "{{variation-slug}}",
    "settings": {},
    "styles": {}
}
```

**Color-only variation (most common):**

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "{{Variation Name}}",
    "slug": "{{variation-slug}}",
    "settings": {
        "color": {
            "palette": [
                {
                    "slug": "primary",
                    "color": "{{new-primary-color}}",
                    "name": "Primary"
                },
                {
                    "slug": "secondary",
                    "color": "{{new-secondary-color}}",
                    "name": "Secondary"
                },
                {
                    "slug": "foreground",
                    "color": "{{new-foreground-color}}",
                    "name": "Foreground"
                },
                {
                    "slug": "background",
                    "color": "{{new-background-color}}",
                    "name": "Background"
                },
                {
                    "slug": "surface",
                    "color": "{{new-surface-color}}",
                    "name": "Surface"
                }
            ]
        }
    },
    "styles": {
        "color": {
            "background": "var(--wp--preset--color--background)",
            "text": "var(--wp--preset--color--foreground)"
        },
        "elements": {
            "link": {
                "color": {
                    "text": "var(--wp--preset--color--primary)"
                },
                ":hover": {
                    "color": {
                        "text": "var(--wp--preset--color--secondary)"
                    }
                }
            },
            "button": {
                "color": {
                    "background": "var(--wp--preset--color--primary)",
                    "text": "var(--wp--preset--color--background)"
                },
                ":hover": {
                    "color": {
                        "background": "var(--wp--preset--color--secondary)",
                        "text": "var(--wp--preset--color--background)"
                    }
                }
            },
            "h1": { "color": { "text": "var(--wp--preset--color--foreground)" } },
            "h2": { "color": { "text": "var(--wp--preset--color--foreground)" } },
            "h3": { "color": { "text": "var(--wp--preset--color--foreground)" } }
        }
    }
}
```

**Dark mode variation:**

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "Dark",
    "slug": "dark",
    "settings": {
        "color": {
            "palette": [
                { "slug": "background", "color": "#0F172A", "name": "Background" },
                { "slug": "surface",    "color": "#1E293B", "name": "Surface" },
                { "slug": "foreground", "color": "#F1F5F9", "name": "Foreground" },
                { "slug": "muted",      "color": "#94A3B8", "name": "Muted" },
                { "slug": "border",     "color": "#334155", "name": "Border" },
                { "slug": "primary",    "color": "#6366F1", "name": "Primary" },
                { "slug": "secondary",  "color": "#8B5CF6", "name": "Secondary" }
            ]
        }
    },
    "styles": {
        "color": {
            "background": "var(--wp--preset--color--background)",
            "text": "var(--wp--preset--color--foreground)"
        },
        "elements": {
            "link": {
                "color": { "text": "var(--wp--preset--color--primary)" }
            },
            "button": {
                "color": {
                    "background": "var(--wp--preset--color--primary)",
                    "text": "#ffffff"
                }
            }
        },
        "blocks": {
            "core/separator": {
                "color": {
                    "background": "var(--wp--preset--color--border)"
                }
            }
        }
    }
}
```

**Typography variation (font swap):**

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "{{Variation Name}}",
    "slug": "{{variation-slug}}",
    "settings": {
        "typography": {
            "fontFamilies": [
                {
                    "slug": "heading",
                    "name": "Heading",
                    "fontFamily": "{{New Heading Font}}, serif",
                    "fontFace": [
                        {
                            "fontFamily": "{{New Heading Font}}",
                            "src": ["file:./assets/fonts/{{new-heading-font}}-700.woff2"],
                            "fontWeight": "700",
                            "fontStyle": "normal",
                            "fontDisplay": "swap"
                        }
                    ]
                },
                {
                    "slug": "body",
                    "name": "Body",
                    "fontFamily": "{{New Body Font}}, sans-serif",
                    "fontFace": [
                        {
                            "fontFamily": "{{New Body Font}}",
                            "src": ["file:./assets/fonts/{{new-body-font}}-400.woff2"],
                            "fontWeight": "400",
                            "fontStyle": "normal",
                            "fontDisplay": "swap"
                        }
                    ]
                }
            ]
        }
    },
    "styles": {
        "typography": {
            "fontFamily": "var(--wp--preset--font-family--body)"
        },
        "elements": {
            "heading": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)"
                }
            }
        }
    }
}
```

**Combined color + spacing variation (spacious layout):**

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "title": "Spacious",
    "slug": "spacious",
    "settings": {
        "color": {
            "palette": [
                { "slug": "background", "color": "#FAFAFA", "name": "Background" },
                { "slug": "surface",    "color": "#FFFFFF", "name": "Surface" },
                { "slug": "foreground", "color": "#111827", "name": "Foreground" }
            ]
        },
        "spacing": {
            "spacingSizes": [
                { "slug": "10", "size": "0.75rem",  "name": "XS" },
                { "slug": "20", "size": "1.25rem",  "name": "S" },
                { "slug": "30", "size": "2rem",     "name": "M" },
                { "slug": "40", "size": "3rem",     "name": "L" },
                { "slug": "50", "size": "5rem",     "name": "XL" },
                { "slug": "60", "size": "8rem",     "name": "2XL" },
                { "slug": "70", "size": "12rem",    "name": "3XL" }
            ]
        }
    },
    "styles": {}
}
```

### Step 4: Contrast Verification

Always verify color contrast after generating a variation. State the check explicitly:

```
CONTRAST CHECK for "{{Variation Name}}":
  foreground (#{{hex}}) on background (#{{hex}}) → {{ratio}}:1 → ✅ / ❌
  primary (#{{hex}}) with white text → {{ratio}}:1 → ✅ / ❌
  muted (#{{hex}}) on background (#{{hex}}) → {{ratio}}:1 → ✅ / ❌

Minimum required: 4.5:1 for body text, 3:1 for large text (18pt+) and UI components
```

If any ratio fails, adjust the color before outputting the final file.

### Step 5: Output

```
=== FILE: {{theme-slug}}/styles/{{variation-slug}}.json ===
```

After the file:

```
VERIFICATION:
✅ Go to Site Editor → Styles → Browse styles → confirm "{{Variation Name}}" appears
✅ Activate the variation — confirm colors / fonts / spacing update correctly
✅ Check contrast ratios pass (at least foreground/background and primary/white)
✅ Check all text is readable (no light-on-light or dark-on-dark combinations)
✅ Confirm the variation does not break existing patterns or templates

NOTE: Style variations override base theme.json settings for the keys they define.
Palette slugs that exist in the base theme but are not redefined in the variation
will retain their base values. Only define what you want to change.
```

### Step 6: Suggest Auto-Dark Mode CSS (optional)

If the user asks for a dark variation to also activate automatically based on OS preference:

```php
// In inc/enqueue.php — add prefers-color-scheme media query support
function {{theme_slug_underscored}}_auto_dark_mode(): void {
    // Only if the 'dark' style variation exists
    $dark_variation = get_template_directory() . '/styles/dark.json';
    if ( ! file_exists( $dark_variation ) ) {
        return;
    }

    $dark_data = json_decode( file_get_contents( $dark_variation ), true ); // phpcs:ignore
    $palette   = $dark_data['settings']['color']['palette'] ?? array();

    if ( empty( $palette ) ) {
        return;
    }

    // Build CSS custom property overrides for dark mode
    $css = '@media (prefers-color-scheme: dark) { :root {';
    foreach ( $palette as $color ) {
        $css .= sprintf(
            '--wp--preset--color--%s: %s;',
            esc_attr( $color['slug'] ),
            esc_attr( $color['color'] )
        );
    }
    $css .= '} }';

    wp_add_inline_style( '{{theme-slug}}-style', $css );
}
add_action( 'wp_enqueue_scripts', '{{theme_slug_underscored}}_auto_dark_mode' );
```

**Caveats:** This approach applies dark colors at the CSS level, not via WordPress's style variation system. It bypasses the Site Editor toggle — users cannot select which mode they want. Only use when auto-dark is the explicit requirement.

## Example Invocations

```
/wp-variation
Create a dark variation for my "lumina" theme. The dark background should be
#0F172A, foreground #F1F5F9, primary stays the same (#6366F1), muted becomes
#94A3B8.
```

```
/wp-variation
I want a "forest" color palette variation — deep greens instead of the default
blue/slate palette. Theme slug is "cascade".
```

```
/wp-variation
Generate a "print" variation that removes background colors, sets everything
to black/white, and uses a serif body font for better print readability.
```

## Read Also

- `references/theme-json-schema.md` — full theme.json v3 settings and styles reference
- `references/accessibility.md` — contrast ratio requirements for the new palette
- `references/modern-blocks.md` — Section Styles (per-block variations, WP 6.6+)
