# theme.json Schema v3 Reference

Complete reference for generating valid `theme.json` files for WordPress 6.5+.

## Required Top-Level Structure

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": { },
  "styles": { },
  "templateParts": [ ],
  "customTemplates": [ ]
}
```

## Settings Section

### Layout Settings

```json
"settings": {
  "appearanceTools": true,
  "useRootPaddingAwareAlignments": true,
  "layout": {
    "contentSize": "1200px",
    "wideSize": "1400px"
  }
}
```

`appearanceTools: true` enables: border, link color, spacing, typography controls in the editor for blocks that don't enable them by default.

`useRootPaddingAwareAlignments: true` makes full-width blocks ignore the root padding (so backgrounds extend edge-to-edge while content stays constrained).

### Color Settings

```json
"color": {
  "background": true,
  "text": true,
  "link": true,
  "custom": true,
  "customDuotone": true,
  "customGradient": true,
  "defaultPalette": false,
  "defaultGradients": false,
  "defaultDuotone": false,
  "palette": [
    { "slug": "primary",    "color": "#0F172A", "name": "Primary" },
    { "slug": "secondary",  "color": "#475569", "name": "Secondary" },
    { "slug": "accent",     "color": "#3B82F6", "name": "Accent" },
    { "slug": "background", "color": "#FFFFFF", "name": "Background" },
    { "slug": "surface",    "color": "#F8FAFC", "name": "Surface" },
    { "slug": "text",       "color": "#0F172A", "name": "Text" }
  ],
  "gradients": [
    {
      "slug": "primary-to-accent",
      "name": "Primary to Accent",
      "gradient": "linear-gradient(135deg, var(--wp--preset--color--primary) 0%, var(--wp--preset--color--accent) 100%)"
    }
  ],
  "duotone": [
    {
      "slug": "brand-duotone",
      "name": "Brand Duotone",
      "colors": ["#0F172A", "#3B82F6"]
    }
  ]
}
```

**Best practices:**
- Set `defaultPalette: false` to remove WordPress's defaults (cleaner editor)
- Use semantic slugs (`primary`, `accent`) NOT visual (`black`, `blue`)
- Always include: `primary`, `secondary`, `accent`, `background`, `text`
- Generated CSS variables: `--wp--preset--color--{slug}`

### Typography Settings

```json
"typography": {
  "fluid": true,
  "lineHeight": true,
  "letterSpacing": true,
  "fontWeight": true,
  "textTransform": true,
  "textDecoration": true,
  "dropCap": false,
  "customFontSize": true,
  "fontFamilies": [
    {
      "slug": "heading",
      "name": "Heading",
      "fontFamily": "\"Fraunces\", Georgia, serif",
      "fontFace": [
        {
          "fontFamily": "Fraunces",
          "fontStyle": "normal",
          "fontWeight": "400",
          "src": ["file:./assets/fonts/fraunces/fraunces-regular.woff2"]
        },
        {
          "fontFamily": "Fraunces",
          "fontStyle": "normal",
          "fontWeight": "700",
          "src": ["file:./assets/fonts/fraunces/fraunces-bold.woff2"]
        }
      ]
    },
    {
      "slug": "body",
      "name": "Body",
      "fontFamily": "\"Inter\", system-ui, sans-serif",
      "fontFace": [
        {
          "fontFamily": "Inter",
          "fontStyle": "normal",
          "fontWeight": "400",
          "src": ["file:./assets/fonts/inter/inter-regular.woff2"]
        }
      ]
    }
  ],
  "fontSizes": [
    { "slug": "small",   "size": "0.875rem", "name": "Small",  "fluid": { "min": "0.875rem", "max": "1rem" } },
    { "slug": "medium",  "size": "1rem",     "name": "Medium", "fluid": { "min": "1rem", "max": "1.125rem" } },
    { "slug": "large",   "size": "1.5rem",   "name": "Large",  "fluid": { "min": "1.25rem", "max": "1.5rem" } },
    { "slug": "x-large", "size": "2.25rem",  "name": "Extra Large", "fluid": { "min": "1.75rem", "max": "2.25rem" } },
    { "slug": "xx-large","size": "3.5rem",   "name": "2X Large", "fluid": { "min": "2.5rem", "max": "3.5rem" } },
    { "slug": "huge",    "size": "5rem",     "name": "Huge",   "fluid": { "min": "3rem", "max": "5rem" } }
  ]
}
```

**Self-hosted fonts:** The `file:./` prefix tells WordPress to bundle the font and self-host it. Always use this for GDPR compliance.

**Generated CSS variables:**
- `--wp--preset--font-family--{slug}`
- `--wp--preset--font-size--{slug}`

### Spacing Settings

```json
"spacing": {
  "padding": true,
  "margin": true,
  "blockGap": true,
  "units": ["px", "em", "rem", "vh", "vw", "%"],
  "customSpacingSize": true,
  "spacingScale": {
    "operator": "*",
    "increment": 1.5,
    "steps": 7,
    "mediumStep": 1.5,
    "unit": "rem"
  },
  "spacingSizes": [
    { "slug": "20", "size": "0.5rem", "name": "2X Small" },
    { "slug": "30", "size": "1rem",   "name": "Extra Small" },
    { "slug": "40", "size": "1.5rem", "name": "Small" },
    { "slug": "50", "size": "2.5rem", "name": "Medium" },
    { "slug": "60", "size": "4rem",   "name": "Large" },
    { "slug": "70", "size": "6rem",   "name": "Extra Large" },
    { "slug": "80", "size": "9rem",   "name": "2X Large" }
  ]
}
```

**Note:** Use EITHER `spacingScale` (auto-generated) OR `spacingSizes` (manual). If you provide both, `spacingSizes` takes precedence.

**Generated CSS variables:** `--wp--preset--spacing--{slug}`

### Border Settings

```json
"border": {
  "color": true,
  "radius": true,
  "style": true,
  "width": true
}
```

### Shadow Settings

```json
"shadow": {
  "presets": [
    { "slug": "natural", "name": "Natural", "shadow": "0 2px 4px rgba(0,0,0,0.05)" },
    { "slug": "deep",    "name": "Deep",    "shadow": "0 8px 24px rgba(0,0,0,0.12)" },
    { "slug": "sharp",   "name": "Sharp",   "shadow": "0 4px 0 rgba(0,0,0,0.9)" },
    { "slug": "outlined","name": "Outlined", "shadow": "0 0 0 2px var(--wp--preset--color--primary)" },
    { "slug": "crisp",   "name": "Crisp",   "shadow": "0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)" }
  ],
  "defaultPresets": false
}
```

### Block-Specific Settings

Override defaults for individual blocks:

```json
"blocks": {
  "core/button": {
    "border": { "radius": true },
    "color": { "text": true, "background": true },
    "spacing": { "padding": true }
  },
  "core/heading": {
    "color": { "text": true, "background": true },
    "typography": { "fontSize": true, "lineHeight": true, "fontWeight": true }
  },
  "core/image": {
    "border": { "radius": true }
  }
}
```

## Styles Section

### Root Styles (Apply to entire site)

```json
"styles": {
  "color": {
    "background": "var(--wp--preset--color--background)",
    "text": "var(--wp--preset--color--text)"
  },
  "typography": {
    "fontFamily": "var(--wp--preset--font-family--body)",
    "fontSize": "var(--wp--preset--font-size--medium)",
    "lineHeight": "1.6"
  },
  "spacing": {
    "padding": {
      "top": "0",
      "right": "var(--wp--preset--spacing--40)",
      "bottom": "0",
      "left": "var(--wp--preset--spacing--40)"
    },
    "blockGap": "var(--wp--preset--spacing--30)"
  }
}
```

### Element Styles

Style HTML elements globally:

```json
"styles": {
  "elements": {
    "h1": {
      "typography": {
        "fontFamily": "var(--wp--preset--font-family--heading)",
        "fontSize": "var(--wp--preset--font-size--xx-large)",
        "fontWeight": "700",
        "lineHeight": "1.1",
        "letterSpacing": "-0.02em"
      },
      "spacing": {
        "margin": { "top": "0", "bottom": "var(--wp--preset--spacing--40)" }
      }
    },
    "h2": {
      "typography": {
        "fontFamily": "var(--wp--preset--font-family--heading)",
        "fontSize": "var(--wp--preset--font-size--x-large)",
        "fontWeight": "700",
        "lineHeight": "1.2"
      }
    },
    "h3": { "typography": { "fontSize": "var(--wp--preset--font-size--large)", "fontWeight": "600", "lineHeight": "1.3" } },
    "h4": { "typography": { "fontSize": "var(--wp--preset--font-size--medium)", "fontWeight": "600" } },
    "h5": { "typography": { "fontSize": "var(--wp--preset--font-size--small)", "fontWeight": "600" } },
    "h6": { "typography": { "fontSize": "var(--wp--preset--font-size--small)", "fontWeight": "600", "textTransform": "uppercase", "letterSpacing": "0.05em" } },
    "link": {
      "color": { "text": "var(--wp--preset--color--accent)" },
      "typography": { "textDecoration": "underline" },
      ":hover": {
        "color": { "text": "var(--wp--preset--color--primary)" },
        "typography": { "textDecoration": "none" }
      },
      ":focus": {
        "color": { "text": "var(--wp--preset--color--primary)" }
      }
    },
    "button": {
      "color": {
        "text": "var(--wp--preset--color--background)",
        "background": "var(--wp--preset--color--primary)"
      },
      "typography": {
        "fontWeight": "600",
        "textTransform": "uppercase",
        "letterSpacing": "0.05em"
      },
      "border": { "radius": "0" },
      "spacing": {
        "padding": {
          "top": "var(--wp--preset--spacing--30)",
          "right": "var(--wp--preset--spacing--50)",
          "bottom": "var(--wp--preset--spacing--30)",
          "left": "var(--wp--preset--spacing--50)"
        }
      },
      ":hover": {
        "color": {
          "text": "var(--wp--preset--color--primary)",
          "background": "var(--wp--preset--color--accent)"
        }
      },
      ":focus": {
        "outline": {
          "color": "var(--wp--preset--color--accent)",
          "width": "2px",
          "style": "solid",
          "offset": "2px"
        }
      },
      ":active": {
        "color": {
          "text": "var(--wp--preset--color--background)",
          "background": "var(--wp--preset--color--text)"
        }
      }
    }
  }
}
```

### Block-Specific Styles

```json
"styles": {
  "blocks": {
    "core/button": {
      "border": { "radius": "0" },
      "spacing": { "padding": { "top": "1rem", "bottom": "1rem", "left": "2rem", "right": "2rem" } }
    },
    "core/quote": {
      "border": {
        "left": {
          "color": "var(--wp--preset--color--accent)",
          "style": "solid",
          "width": "4px"
        }
      },
      "spacing": { "padding": { "left": "var(--wp--preset--spacing--40)" } },
      "typography": { "fontStyle": "italic", "fontSize": "var(--wp--preset--font-size--large)" }
    },
    "core/separator": {
      "border": { "color": "var(--wp--preset--color--border)", "style": "solid", "width": "1px" }
    }
  }
}
```

## Template Parts

```json
"templateParts": [
  { "name": "header", "title": "Header", "area": "header" },
  { "name": "footer", "title": "Footer", "area": "footer" },
  { "name": "sidebar", "title": "Sidebar", "area": "uncategorized" }
]
```

`area` must be: `"header"`, `"footer"`, or `"uncategorized"`.

## Custom Templates

Register custom page templates that users can select per-page:

```json
"customTemplates": [
  {
    "name": "page-landing",
    "title": "Landing Page",
    "postTypes": ["page"]
  },
  {
    "name": "page-no-header",
    "title": "Page Without Header",
    "postTypes": ["page", "post"]
  }
]
```

The `name` MUST match a file in `templates/` (e.g., `templates/page-landing.html`).

## Style Variations

Place additional theme.json variants in `/styles/`:

**`styles/dark.json`:**
```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "title": "Dark Mode",
  "settings": {
    "color": {
      "palette": [
        { "slug": "primary",    "color": "#FFFFFF", "name": "Primary" },
        { "slug": "background", "color": "#0A0A0A", "name": "Background" },
        { "slug": "text",       "color": "#FAFAF7", "name": "Text" }
      ]
    }
  },
  "styles": {
    "color": {
      "background": "var(--wp--preset--color--background)",
      "text": "var(--wp--preset--color--text)"
    }
  }
}
```

Style variations are partial — they override only what they declare; the base theme.json provides the rest.

## Additional Settings (WordPress 6.5+)

### Dimensions Settings

```json
"settings": {
    "dimensions": {
        "minHeight": true,
        "aspectRatio": true
    }
}
```

Enables the min-height and aspect ratio controls in the editor for supported blocks (e.g., `core/group`, `core/cover`).

### Position Settings

```json
"settings": {
    "position": {
        "sticky": true
    }
}
```

Enables sticky positioning in the editor. Use for sticky headers or sidebars:

```html
<!-- wp:group {"style":{"position":{"type":"sticky","top":"0px"}},"tagName":"header"} -->
<header class="wp-block-group" style="position:sticky;top:0px">
    <!-- header content -->
</header>
<!-- /wp:group -->
```

### Lightbox Settings (6.5+)

```json
"settings": {
    "blocks": {
        "core/image": {
            "lightbox": {
                "enabled": true,
                "allowEditing": true
            }
        }
    }
}
```

Enables the built-in lightbox for images. Uses the Interactivity API under the hood — no JS needed from the theme.

### Background Settings (6.5+)

```json
"settings": {
    "background": {
        "backgroundImage": true,
        "backgroundSize": true
    }
}
```

Enables background image controls for `core/group` and other supported blocks.

### Custom CSS in Styles (6.6+)

You can add raw custom CSS via theme.json for specific blocks:

```json
"styles": {
    "blocks": {
        "core/navigation": {
            "css": "& .wp-block-navigation__responsive-container-open { border: none; background: transparent; }"
        }
    },
    "css": "body { -webkit-font-smoothing: antialiased; }"
}
```

The `&` refers to the block's root element. Top-level `css` applies to `body`.

**Use sparingly.** Prefer theme.json style properties when available. Custom CSS is a last resort for properties not yet supported in the schema (e.g., `font-smoothing`, complex selectors).

### Section Styles / Block Style Variations in theme.json (6.6+)

Define block style variations with full cascading styles directly in theme.json:

```json
"styles": {
    "blocks": {
        "core/group": {
            "variations": {
                "section-dark": {
                    "color": {
                        "background": "var(--wp--preset--color--primary)",
                        "text": "var(--wp--preset--color--background)"
                    },
                    "elements": {
                        "heading": {
                            "color": { "text": "var(--wp--preset--color--background)" }
                        },
                        "link": {
                            "color": { "text": "var(--wp--preset--color--accent)" }
                        },
                        "button": {
                            "color": {
                                "text": "var(--wp--preset--color--primary)",
                                "background": "var(--wp--preset--color--background)"
                            }
                        }
                    }
                }
            }
        }
    }
}
```

See `references/modern-blocks.md` → Section Styles for full details and registration.

## Validation

Validate every theme.json before deployment:
- https://validator.poet.so/theme-json
- WP-CLI: `wp theme-json validate` (if installed)

Common validation errors:
1. Missing `$schema` declaration
2. Wrong `version` (must be `3`)
3. Color slug contains invalid characters (use only lowercase, hyphens, numbers)
4. `fontFace.src` paths don't exist
5. Spacing slug not numeric
