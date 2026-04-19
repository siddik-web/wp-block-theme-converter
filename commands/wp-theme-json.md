# /wp-theme-json

**Purpose:** Generate a complete, valid `theme.json` (schema v3) from a design system, CSS custom properties, or design token specification.

## Trigger

User types `/wp-theme-json` followed by:
- CSS custom properties (`:root { --color-primary: #000; ... }`)
- A design tokens spec (JSON, YAML, or plain description)
- A natural language description ("dark theme with gold accents and serif headings")

## Workflow

### Step 1: Extract Design Tokens

From the input, identify:

| Token Category | What to Extract |
|----------------|----------------|
| **Colors** | Primary, secondary, accent, background, surface, text, muted, border, success, warning, error |
| **Gradients** | Any linear/radial gradients used |
| **Font Families** | Heading, body, mono — note if self-hosted |
| **Font Sizes** | All discrete sizes — convert to fluid type if a clear scale exists |
| **Spacing** | Padding/margin scale (e.g., 4, 8, 16, 24, 32, 48, 64, 96) |
| **Border Radius** | sm, md, lg, pill, etc. |
| **Shadows** | sm, md, lg presets |
| **Layout** | Container width, wide width |

If anything is missing, use defaults from `references/defaults.md`.

### Step 2: Build theme.json Structure

Read `references/theme-json-schema.md` for the full schema. The output MUST include:

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "appearanceTools": true,
    "useRootPaddingAwareAlignments": true,
    "layout": {
      "contentSize": "...",
      "wideSize": "..."
    },
    "color": {
      "palette": [...],
      "gradients": [...],
      "duotone": [...],
      "defaultPalette": false,
      "defaultGradients": false,
      "customDuotone": true,
      "link": true
    },
    "typography": {
      "fluid": true,
      "fontFamilies": [...],
      "fontSizes": [...],
      "lineHeight": true,
      "letterSpacing": true,
      "fontWeight": true,
      "textTransform": true,
      "textDecoration": true
    },
    "spacing": {
      "spacingScale": { "operator": "*", "increment": 1.5, "steps": 7, "mediumStep": 1.5, "unit": "rem" },
      "spacingSizes": [...],
      "padding": true,
      "margin": true,
      "blockGap": true,
      "units": ["px", "em", "rem", "vh", "vw", "%"]
    },
    "border": {
      "color": true,
      "radius": true,
      "style": true,
      "width": true
    },
    "shadow": {
      "presets": [...],
      "defaultPresets": false
    },
    "blocks": {
      "core/button": { ... },
      "core/heading": { ... }
    }
  },
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
    },
    "elements": {
      "h1": { ... },
      "h2": { ... },
      "h3": { ... },
      "h4": { ... },
      "h5": { ... },
      "h6": { ... },
      "link": {
        "color": { "text": "var(--wp--preset--color--accent)" },
        ":hover": { "color": { "text": "var(--wp--preset--color--primary)" } },
        ":focus": { "color": { "text": "var(--wp--preset--color--primary)" } }
      },
      "button": {
        "color": { ... },
        ":hover": { ... },
        ":focus": { ... },
        ":active": { ... }
      }
    },
    "blocks": {
      "core/button": { ... },
      "core/heading": { ... },
      "core/quote": { ... }
    }
  },
  "templateParts": [
    { "name": "header", "title": "Header", "area": "header" },
    { "name": "footer", "title": "Footer", "area": "footer" }
  ],
  "customTemplates": []
}
```

### Step 3: Apply Best Practices

- **Fluid typography:** For each font size, include `"fluid": { "min": "...", "max": "..." }` for responsive sizing
- **Color slugs:** Use semantic names (`primary`, `accent`, `background`) NOT visual names (`black`, `gold`)
- **Set `defaultPalette: false`** to remove WordPress's default colors (cleaner editor)
- **Set `defaultGradients: false`** for the same reason
- **Spacing slugs:** Use numeric scale (`20`, `30`, `40`, `50`, `60`, `70`, `80`) matching WordPress conventions
- **Self-hosted fonts:** Always include the `fontFace` array with `src` paths pointing to `assets/fonts/`

### Step 4: Output

Provide:

1. **The complete `theme.json`** in a single code block:
   ```
   === FILE: {{theme-slug}}/theme.json ===
   ```

2. **Token reference table** so the user knows what CSS variables are now available:
   ```markdown
   ## CSS Variables Generated

   | Token | CSS Variable | Use In Patterns |
   |-------|--------------|----------------|
   | Primary color | `--wp--preset--color--primary` | `style="color: var(--wp--preset--color--primary)"` |
   | Heading font | `--wp--preset--font-family--heading` | (auto-applied to h1-h6) |
   | Spacing 40 | `--wp--preset--spacing--40` | `style="padding: var(--wp--preset--spacing--40)"` |
   ```

3. **Validation note:**
   > Validate this file at https://validator.poet.so/theme-json before deploying.

### Step 5: Style Variations (Optional)

If the user wants multiple themes (light/dark, multiple aesthetics), offer to generate style variations:

```markdown
Want me to generate style variations? Each variation lives in `/styles/` and overrides the base theme.json. Common patterns:
- `styles/dark.json` — dark mode variant
- `styles/{aesthetic-name}.json` — alternate brand looks

Just say which variations you want and I'll produce them.
```

## Example Invocation

```
User: /wp-theme-json

:root {
  --color-bg: #FAFAF7;
  --color-text: #0A0A0A;
  --color-accent: #D4AF37;
  --font-display: 'Fraunces', serif;
  --font-body: 'Inter Tight', sans-serif;
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 2rem;
  --space-lg: 4rem;
}
```

→ Claude produces a complete, valid theme.json with these tokens mapped to WordPress preset structure.
