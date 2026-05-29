# Example: Northaven Landscaping — Elementor to Block Theme Migration

A complete worked example of migrating a 5-page small business site from Elementor to a native FSE block theme.

---

## Project Brief

**Client:** Northaven Landscaping, a fictional residential and commercial landscaping company  
**Current stack:** Elementor 3.22 (free) + Elementor Pro 3.22, Twenty Twenty-Two child theme  
**Target:** Custom FSE block theme (`northaven-landscape`)  
**Pages:** 5 (Home, About, Services, Blog, Contact)  
**WooCommerce:** No  
**Builder templates:** Elementor Theme Builder header + footer (stored as `elementor_library` posts)

### Why They're Migrating

- Core Web Vitals are failing: LCP 5.8s on mobile (Elementor JS/CSS contributing ~380 KB)
- The Elementor Pro license renewal is $200/year; client wants to eliminate the dependency
- Site editor access requested by client for content updates — Elementor's interface is unfamiliar
- Two Elementor Pro widgets in use: Form (Contact page) and Motion Effects on hero

---

## The Elementor Data: Home Page (Simplified)

The Home page (post ID 12) has the following `_elementor_data` structure. Shown simplified — a real export would be 300–800 lines.

```json
[
  {
    "id": "aaa111",
    "elType": "section",
    "settings": {
      "background_image": {
        "url": "https://northaven-landscaping.com/wp-content/uploads/hero-garden.jpg",
        "id": 88
      },
      "background_overlay_opacity": 50,
      "min_height": "90vh",
      "layout": "full_width"
    },
    "elements": [
      {
        "id": "bbb222",
        "elType": "column",
        "settings": { "_column_size": 60 },
        "elements": [
          {
            "id": "ccc333",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "Your Garden, Transformed.",
              "header_size": "h1",
              "align": "left",
              "typography_font_size": "72",
              "title_color": "#FFFFFF"
            }
          },
          {
            "id": "ddd444",
            "elType": "widget",
            "widgetType": "text-editor",
            "settings": {
              "editor": "<p>Award-winning landscape design for homes and businesses across the Northaven valley. Free consultations available.</p>"
            }
          },
          {
            "id": "eee555",
            "elType": "widget",
            "widgetType": "button",
            "settings": {
              "text": "Book a Free Consultation",
              "link": { "url": "/contact/", "is_external": "" },
              "button_type": "success",
              "size": "lg"
            }
          }
        ]
      }
    ]
  },
  {
    "id": "fff666",
    "elType": "section",
    "settings": {
      "background_color": "#FFFFFF",
      "padding": { "top": "80", "bottom": "80", "unit": "px" }
    },
    "elements": [
      {
        "id": "ggg777",
        "elType": "column",
        "settings": { "_column_size": 100 },
        "elements": [
          {
            "id": "hhh888",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "What We Do",
              "header_size": "h2",
              "align": "center"
            }
          },
          {
            "id": "iii999",
            "elType": "widget",
            "widgetType": "icon-box",
            "settings": {
              "title_text": "Garden Design",
              "description_text": "<p>Full design service from concept to planting plan.</p>",
              "icon": { "value": "fas fa-leaf", "library": "fa-solid" }
            }
          }
        ]
      }
    ]
  },
  {
    "id": "jjj000",
    "elType": "section",
    "settings": { "background_color": "#2D4A1E" },
    "elements": [
      {
        "id": "kkk111",
        "elType": "column",
        "settings": { "_column_size": 100 },
        "elements": [
          {
            "id": "lll222",
            "elType": "widget",
            "widgetType": "heading",
            "settings": {
              "title": "Ready to transform your outdoor space?",
              "header_size": "h2",
              "align": "center",
              "title_color": "#FFFFFF"
            }
          },
          {
            "id": "mmm333",
            "elType": "widget",
            "widgetType": "button",
            "settings": {
              "text": "Get a Free Quote",
              "link": { "url": "/contact/" }
            }
          }
        ]
      }
    ]
  }
]
```

---

## Step-by-Step Migration Output

### Inventory Commands Run

```bash
# Confirm Elementor page list
wp db query "SELECT p.ID, p.post_title FROM wp_posts p
INNER JOIN wp_postmeta pm ON p.ID = pm.post_id
WHERE pm.meta_key = '_elementor_edit_mode' AND pm.meta_value = 'builder'
AND p.post_status = 'publish';"
# Output:
# 10  Home
# 11  About
# 12  Services
# 14  Contact
# (Blog is a standard archive — no builder data)

# Export all Elementor data for reference
mkdir elementor-exports
for id in 10 11 12 14; do
  wp post meta get $id _elementor_data | python3 -m json.tool > elementor-exports/post-${id}.json
done

# Find Elementor Theme Builder templates
wp post list --post_type=elementor_library --format=table --fields=ID,post_title
# Output:
# ID   post_title
# 5    Site Header
# 6    Site Footer
```

### Migration Map

| Source | Post ID | Elementor sections | FSE output | Type | Notes |
|--------|---------|-------------------|-----------|------|-------|
| Home page | 10 | Hero (Cover) + Services grid + CTA | `templates/front-page.html` | Template | Composes 3 patterns |
| About page | 11 | Team section + Mission + Timeline | `templates/page.html` | Template (generic) | Unique layout; rebuilt as page content |
| Services page | 12 | Services grid + individual service cards | `templates/page.html` | Template (generic) | Services grid → pattern reused on Home |
| Contact page | 14 | Contact form + map | `templates/page.html` | Template (generic) | Form widget → Contact Form 7 block |
| Blog archive | — | No builder data | `templates/archive.html` | Template | Standard archive |
| Single post | — | No builder data | `templates/single.html` | Template | Standard single |
| Header (library ID 5) | 5 | Logo + nav + phone CTA | `parts/header.html` | Template Part | Nav → core/navigation |
| Footer (library ID 6) | 6 | 2-col: logo/copy + nav | `parts/footer.html` | Template Part | |
| Hero section (Home) | — | Cover with bg image + H1 + text + button | `patterns/hero-home.php` | Pattern | Motion Effects dropped (manual decision) |
| Services grid section | — | 3 icon boxes in columns | `patterns/services-grid.php` | Pattern | Icon → SVG via core/html |
| CTA section | — | Dark bg + heading + button | `patterns/cta-banner.php` | Pattern | Reused on Services page too |

**What was manually rebuilt (not auto-convertible):**

- Motion Effects on the hero heading (Elementor Pro) — client accepted static hero; animation dropped
- Contact form (Elementor Pro Form widget) — replaced with Contact Form 7 block
- Google Font "Playfair Display" was loaded via Elementor font manager — re-added to `theme.json` as a self-hosted font

---

### FSE Templates Created

**`templates/front-page.html`**

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:pattern {"slug":"northaven-landscape/hero-home"} /-->
    <!-- wp:pattern {"slug":"northaven-landscape/services-grid"} /-->
    <!-- wp:pattern {"slug":"northaven-landscape/cta-banner"} /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

**`templates/page.html`** (generic — used for About, Services, Contact)

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}}} -->
    <div class="wp-block-group">
        <!-- wp:post-title {"level":1} /-->
        <!-- wp:post-content /-->
    </div>
    <!-- /wp:group -->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

---

### Block Patterns Created from Elementor Sections

**`patterns/hero-home.php`**

Maps the Elementor "Section with background image + overlay + heading + text + button" to `core/cover`.

```php
<?php
/**
 * Title: Home Hero
 * Slug: northaven-landscape/hero-home
 * Categories: northaven-landscape
 */
?>
<!-- wp:cover {
    "url": "<?php echo esc_url( get_theme_file_uri( 'assets/images/hero-garden.jpg' ) ); ?>",
    "dimRatio": 50,
    "minHeight": 90,
    "minHeightUnit": "vh",
    "align": "full",
    "style": {
        "spacing": {
            "padding": {
                "top": "var:preset|spacing|70",
                "bottom": "var:preset|spacing|70"
            }
        }
    }
} -->
<div class="wp-block-cover alignfull">
    <span aria-hidden="true" class="wp-block-cover__background has-background-dim has-background-dim-50"></span>
    <img class="wp-block-cover__image-background" src="<?php echo esc_url( get_theme_file_uri( 'assets/images/hero-garden.jpg' ) ); ?>" alt="" data-object-fit="cover"/>
    <div class="wp-block-cover__inner-container">
        <!-- wp:group {"layout":{"type":"constrained","contentSize":"640px"}} -->
        <div class="wp-block-group">
            <!-- wp:heading {"level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4.5rem)","fontWeight":"700","lineHeight":"1.1"},"color":{"text":"#FFFFFF"}}} -->
            <h1 class="wp-block-heading has-white-color has-text-color">Your Garden, Transformed.</h1>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"style":{"color":{"text":"#F0F0F0"},"typography":{"fontSize":"1.125rem"},"spacing":{"margin":{"top":"1.5rem","bottom":"2rem"}}}} -->
            <p class="has-text-color" style="color:#F0F0F0">Award-winning landscape design for homes and businesses across the Northaven valley. Free consultations available.</p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons -->
            <div class="wp-block-buttons">
                <!-- wp:button {"backgroundColor":"primary","style":{"spacing":{"padding":{"top":"1rem","bottom":"1rem","left":"2rem","right":"2rem"}},"border":{"radius":"4px"}}} -->
                <div class="wp-block-button">
                    <a class="wp-block-button__link has-primary-background-color has-background wp-element-button" href="/contact/">Book a Free Consultation</a>
                </div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
</div>
<!-- /wp:cover -->
```

**`patterns/services-grid.php`**

Maps the Elementor icon-box widgets in a three-column section to `core/columns` + `core/group` blocks. The Elementor Font Awesome icon (`fas fa-leaf`) is replaced with an inline SVG in `core/html` — Font Awesome is not bundled by default in block themes.

```php
<?php
/**
 * Title: Services Grid
 * Slug: northaven-landscape/services-grid
 * Categories: northaven-landscape
 */
?>
<!-- wp:group {
    "tagName": "section",
    "style": {
        "spacing": {
            "padding": {
                "top": "var:preset|spacing|70",
                "bottom": "var:preset|spacing|70"
            }
        }
    },
    "layout": {"type": "constrained"}
} -->
<section class="wp-block-group">
    <!-- wp:heading {"level":2,"textAlign":"center","style":{"spacing":{"margin":{"bottom":"var:preset|spacing|50"}}}} -->
    <h2 class="wp-block-heading has-text-align-center">What We Do</h2>
    <!-- /wp:heading -->

    <!-- wp:columns {"isStackedOnMobile":true} -->
    <div class="wp-block-columns">
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"1.5rem","right":"1.5rem"}},"border":{"radius":"8px"}},"backgroundColor":"surface","layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
            <div class="wp-block-group has-surface-background-color has-background">
                <!-- wp:html -->
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 6v6l4 2"/></svg>
                <!-- /wp:html -->
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Garden Design</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Full design service from concept to planting plan.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"1.5rem","right":"1.5rem"}},"border":{"radius":"8px"}},"backgroundColor":"surface","layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
            <div class="wp-block-group has-surface-background-color has-background">
                <!-- wp:html -->
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <!-- /wp:html -->
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Lawn Care</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Weekly and seasonal maintenance programs for any size property.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"style":{"spacing":{"padding":{"top":"2rem","bottom":"2rem","left":"1.5rem","right":"1.5rem"}},"border":{"radius":"8px"}},"backgroundColor":"surface","layout":{"type":"flex","orientation":"vertical","justifyContent":"left"}} -->
            <div class="wp-block-group has-surface-background-color has-background">
                <!-- wp:html -->
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <!-- /wp:html -->
                <!-- wp:heading {"level":3} -->
                <h3 class="wp-block-heading">Irrigation</h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p>Smart irrigation systems installed and maintained for water efficiency.</p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->
    </div>
    <!-- /wp:columns -->
</section>
<!-- /wp:group -->
```

**`patterns/cta-banner.php`**

Maps the dark-background CTA section directly to a `core/group` with `backgroundColor` and centered content.

```php
<?php
/**
 * Title: CTA Banner
 * Slug: northaven-landscape/cta-banner
 * Categories: northaven-landscape
 */
?>
<!-- wp:group {
    "tagName": "section",
    "backgroundColor": "forest",
    "style": {
        "spacing": {
            "padding": {
                "top": "var:preset|spacing|70",
                "bottom": "var:preset|spacing|70"
            }
        }
    },
    "layout": {"type": "constrained"}
} -->
<section class="wp-block-group has-forest-background-color has-background">
    <!-- wp:heading {"level":2,"textAlign":"center","style":{"color":{"text":"#FFFFFF"}}} -->
    <h2 class="wp-block-heading has-text-align-center has-white-color has-text-color">Ready to transform your outdoor space?</h2>
    <!-- /wp:heading -->

    <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
    <div class="wp-block-buttons">
        <!-- wp:button {"backgroundColor":"white","textColor":"forest","style":{"border":{"radius":"4px"}}} -->
        <div class="wp-block-button">
            <a class="wp-block-button__link has-white-background-color has-forest-color has-text-color has-background wp-element-button" href="/contact/">Get a Free Quote</a>
        </div>
        <!-- /wp:button -->
    </div>
    <!-- /wp:buttons -->
</section>
<!-- /wp:group -->
```

---

### theme.json Excerpt

The relevant tokens extracted from Elementor's settings and added to `theme.json`. Elementor's color manager had 3 brand colors; the Elementor typography settings had font size overrides per widget (72px heading, 18px body text). These become fluid type scales.

```json
{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "settings": {
        "appearanceTools": true,
        "layout": {
            "contentSize": "1200px",
            "wideSize": "1440px"
        },
        "color": {
            "defaultPalette": false,
            "defaultGradients": false,
            "palette": [
                { "slug": "primary",    "color": "#3A6B2A", "name": "Northaven Green" },
                { "slug": "forest",     "color": "#2D4A1E", "name": "Forest Dark" },
                { "slug": "accent",     "color": "#8DB34A", "name": "Leaf Accent" },
                { "slug": "background", "color": "#F9F7F4", "name": "Off White" },
                { "slug": "surface",    "color": "#FFFFFF", "name": "Surface" },
                { "slug": "text",       "color": "#1A1A1A", "name": "Text" },
                { "slug": "muted",      "color": "#6B7280", "name": "Muted" }
            ]
        },
        "typography": {
            "fluid": true,
            "fontFamilies": [
                {
                    "slug": "heading",
                    "name": "Heading",
                    "fontFamily": "\"Playfair Display\", Georgia, serif",
                    "fontFace": [
                        {
                            "fontFamily": "Playfair Display",
                            "fontStyle": "normal",
                            "fontWeight": "400 700",
                            "src": ["file:./assets/fonts/playfair-display/playfair-display-variable.woff2"]
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
                            "fontWeight": "400 600",
                            "src": ["file:./assets/fonts/inter/inter-variable.woff2"]
                        }
                    ]
                }
            ],
            "fontSizes": [
                { "slug": "sm",     "size": "clamp(0.875rem, 1vw, 1rem)",       "name": "Small" },
                { "slug": "base",   "size": "clamp(1rem, 1.25vw, 1.125rem)",     "name": "Base" },
                { "slug": "lg",     "size": "clamp(1.25rem, 2vw, 1.5rem)",       "name": "Large" },
                { "slug": "xl",     "size": "clamp(1.5rem, 3vw, 2rem)",          "name": "XL" },
                { "slug": "2xl",    "size": "clamp(2rem, 4vw, 3rem)",            "name": "2XL" },
                { "slug": "hero",   "size": "clamp(2.5rem, 5vw, 4.5rem)",        "name": "Hero" }
            ]
        },
        "spacing": {
            "spacingScale": { "operator": "*", "increment": 1.5, "steps": 7, "mediumStep": 1.5, "unit": "rem" },
            "spacingSizes": [
                { "slug": "30", "size": "0.75rem",  "name": "XS" },
                { "slug": "40", "size": "1rem",     "name": "S" },
                { "slug": "50", "size": "2rem",     "name": "M" },
                { "slug": "60", "size": "3rem",     "name": "L" },
                { "slug": "70", "size": "5rem",     "name": "XL" }
            ]
        }
    },
    "styles": {
        "color": {
            "background": "var(--wp--preset--color--background)",
            "text": "var(--wp--preset--color--text)"
        },
        "typography": {
            "fontFamily": "var(--wp--preset--font-family--body)",
            "fontSize": "var(--wp--preset--font-size--base)",
            "lineHeight": "1.6"
        },
        "elements": {
            "h1": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "fontSize": "var(--wp--preset--font-size--hero)",
                    "fontWeight": "700",
                    "lineHeight": "1.1"
                }
            },
            "h2": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "fontSize": "var(--wp--preset--font-size--2xl)",
                    "fontWeight": "600"
                }
            },
            "h3": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "fontSize": "var(--wp--preset--font-size--xl)"
                }
            },
            "link": {
                "color": { "text": "var(--wp--preset--color--primary)" }
            },
            "button": {
                "color": {
                    "background": "var(--wp--preset--color--primary)",
                    "text": "#FFFFFF"
                },
                "border": { "radius": "4px" },
                "typography": { "fontWeight": "600" },
                ":hover": {
                    "color": {
                        "background": "var(--wp--preset--color--forest)"
                    }
                }
            }
        }
    }
}
```

---

### Handling the Elementor CSS Bleed

After activating the new theme on staging, two Elementor CSS artifacts needed cleanup:

**1. Stale `_elementor_css` entries in postmeta**

Elementor had cached per-page CSS in `_elementor_css` for all 4 builder pages. This data was orphaned but harmless once the plugin was deactivated. Cleaned up:

```bash
wp db query "DELETE FROM wp_postmeta WHERE meta_key = '_elementor_css';"
```

**2. `.elementor-` class names in post_content of the About page**

The About page had a legacy HTML block (added manually before Elementor took over) that contained `<div class="elementor-section">` left over from a copy-paste. Found and fixed:

```bash
# Discovered the issue
wp db query "SELECT ID, post_title FROM wp_posts
WHERE post_content LIKE '%elementor-section%' AND post_status = 'publish';"
# Output: ID 11 — About

# Rebuilt the About page content from scratch in FSE (the div was a layout wrapper
# that contained only a heading and paragraph — two blocks, not worth trying to strip)
wp post update 11 --post_content='<!-- wp:heading {"level":1} --><h1 class="wp-block-heading">About Northaven Landscaping</h1><!-- /wp:heading --><!-- wp:paragraph --><p>Family-owned since 1998, serving the greater Northaven valley.</p><!-- /wp:paragraph -->'
```

**3. Elementor Google Fonts still loading via wp_head**

Elementor had enqueued Playfair Display via its own font manager. With the plugin deactivated, the font loading moved to `theme.json`'s `fontFamilies` declaration (self-hosted woff2 files). Confirmed no duplicate font requests in the Network tab after the switch.

---

### Notes on What Was Manually Rebuilt vs. Auto-Converted

| Element | Outcome | Reason |
|---------|---------|--------|
| Hero section (Home) | Manually rebuilt as `patterns/hero-home.php` | Straightforward — Cover block is a direct equivalent |
| Services grid (Home + Services) | Manually rebuilt as `patterns/services-grid.php` | Icon Box widget has no core equivalent; SVG icons substituted |
| CTA banner (Home + Services) | Manually rebuilt as `patterns/cta-banner.php` | Direct mapping to Group with color |
| Header (library ID 5) | Manually rebuilt as `parts/header.html` | Navigation rebuilt with `core/navigation`; phone number moved to nav |
| Footer (library ID 6) | Manually rebuilt as `parts/footer.html` | 2-column layout with Columns block |
| About page content | Manually rebuilt in page editor | Simple heading + text; no structural complexity |
| Contact form (Elementor Pro Form) | Replaced with Contact Form 7 block | No core block equivalent; CF7 plugin installed |
| Motion Effects on hero heading | Dropped — not rebuilt | Client accepted static hero after seeing performance improvement |
| Google Map on Contact page | Rebuilt as `core/html` with iframe embed | Simpler and lighter than Elementor's maps widget |

**Total build time (estimate):** 4–5 hours for an experienced developer. A comparable Elementor site build might take 2–3 hours, but the FSE output is maintainable long-term without a plugin dependency.

---

## Post-Migration Verification Checklist

### Before DNS Cutover (Staging)

**Functional**
- [ ] Home page hero loads background image; overlay visible; heading and button rendered correctly
- [ ] Services grid shows 3 columns on desktop, stacks on mobile
- [ ] CTA banner background color matches brand dark green (`#2D4A1E`)
- [ ] Contact Form 7 form submits; confirmation message appears; email received at admin address
- [ ] Blog archive lists posts with correct title, date, excerpt, featured image
- [ ] Single blog post renders content, featured image, author, and date
- [ ] Navigation: all 5 menu items link to correct pages; no 404s
- [ ] Mobile nav (hamburger) opens and closes; all links work at 375px
- [ ] Footer: copyright year correct; footer nav links work

**Visual regression** (compare staging screenshots to Elementor reference screenshots)
- [ ] Home — hero section
- [ ] Home — services grid
- [ ] Home — CTA banner
- [ ] About — page layout
- [ ] Services — page layout
- [ ] Contact — form visible and styled
- [ ] Blog archive — card layout
- [ ] Single post — typography and spacing

**Performance**
```bash
npx lighthouse https://staging.northaven-landscaping.com --only-categories=performance --output=json --output-path=lh-home.json
# Target: LCP < 2.5s, TBT < 200ms (was LCP 5.8s with Elementor)
```

**Accessibility**
```bash
npx axe-cli https://staging.northaven-landscaping.com --exit
npx axe-cli https://staging.northaven-landscaping.com/contact/ --exit
```
- [ ] Skip link present and functional
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Color contrast passes WCAG AA (4.5:1 for body text)

**Database cleanup**
```bash
# Confirm no Elementor builder meta remains
wp db query "SELECT COUNT(*) FROM wp_postmeta WHERE meta_key = '_elementor_data';"
# Expected: 0

# Confirm no Elementor shortcodes in content
wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_content LIKE '%elementor%' AND post_status = 'publish';"
# Expected: 0
```

**Plugin cleanup** (after all pages verified)
```bash
wp plugin deactivate elementor elementor-pro
wp plugin delete elementor elementor-pro
wp plugin list  # Confirm Elementor no longer present
```

### After DNS Cutover (Production)

- [ ] SSL certificate valid at production domain
- [ ] `siteurl` and `home` options point to production URL
- [ ] Caches flushed (page cache plugin, object cache, CDN)
- [ ] Google Search Console: no new crawl errors within 48 hours
- [ ] Core Web Vitals: run PageSpeed Insights on Home and Contact pages
- [ ] Analytics: verify tracking fires correctly (GA4 / Matomo pageview on home page)
- [ ] Contact form: send a real test submission from production and confirm delivery
