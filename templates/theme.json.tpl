{
    "$schema": "https://schemas.wp.org/trunk/theme.json",
    "version": 3,
    "settings": {
        "appearanceTools": true,
        "useRootPaddingAwareAlignments": true,
        "layout": {
            "contentSize": "{{CONTENT_SIZE}}",
            "wideSize": "{{WIDE_SIZE}}"
        },
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
                { "slug": "primary", "color": "{{PRIMARY_COLOR}}", "name": "Primary" },
                { "slug": "secondary", "color": "{{SECONDARY_COLOR}}", "name": "Secondary" },
                { "slug": "accent", "color": "{{ACCENT_COLOR}}", "name": "Accent" },
                { "slug": "background", "color": "{{BG_COLOR}}", "name": "Background" },
                { "slug": "surface", "color": "{{SURFACE_COLOR}}", "name": "Surface" },
                { "slug": "text", "color": "{{TEXT_COLOR}}", "name": "Text" },
                { "slug": "muted", "color": "{{TEXT_MUTED}}", "name": "Muted" },
                { "slug": "border", "color": "{{BORDER_COLOR}}", "name": "Border" }
            ]
        },
        "typography": {
            "fluid": true,
            "lineHeight": true,
            "letterSpacing": true,
            "fontWeight": true,
            "textTransform": true,
            "textDecoration": true,
            "customFontSize": true,
            "fontFamilies": [
                {
                    "slug": "heading",
                    "name": "Heading",
                    "fontFamily": "{{HEADING_FONT_STACK}}",
                    "fontFace": []
                },
                {
                    "slug": "body",
                    "name": "Body",
                    "fontFamily": "{{BODY_FONT_STACK}}",
                    "fontFace": []
                },
                {
                    "slug": "mono",
                    "name": "Monospace",
                    "fontFamily": "{{MONO_FONT_STACK}}",
                    "fontFace": []
                }
            ],
            "fontSizes": [
                { "slug": "small", "size": "0.875rem", "name": "Small", "fluid": { "min": "0.875rem", "max": "1rem" } },
                { "slug": "medium", "size": "1rem", "name": "Medium", "fluid": { "min": "1rem", "max": "1.125rem" } },
                { "slug": "large", "size": "1.5rem", "name": "Large", "fluid": { "min": "1.25rem", "max": "1.5rem" } },
                { "slug": "x-large", "size": "2.25rem", "name": "Extra Large", "fluid": { "min": "1.75rem", "max": "2.25rem" } },
                { "slug": "xx-large", "size": "3.5rem", "name": "2X Large", "fluid": { "min": "2.5rem", "max": "3.5rem" } },
                { "slug": "huge", "size": "5rem", "name": "Huge", "fluid": { "min": "3rem", "max": "5rem" } }
            ]
        },
        "spacing": {
            "padding": true,
            "margin": true,
            "blockGap": true,
            "units": ["px", "em", "rem", "vh", "vw", "%"],
            "customSpacingSize": true,
            "spacingSizes": [
                { "slug": "20", "size": "0.5rem", "name": "2X Small" },
                { "slug": "30", "size": "1rem", "name": "Extra Small" },
                { "slug": "40", "size": "1.5rem", "name": "Small" },
                { "slug": "50", "size": "2.5rem", "name": "Medium" },
                { "slug": "60", "size": "4rem", "name": "Large" },
                { "slug": "70", "size": "6rem", "name": "Extra Large" },
                { "slug": "80", "size": "9rem", "name": "2X Large" }
            ]
        },
        "border": {
            "color": true,
            "radius": true,
            "style": true,
            "width": true
        },
        "dimensions": {
            "minHeight": true,
            "aspectRatio": true
        },
        "position": {
            "sticky": true
        },
        "background": {
            "backgroundImage": true,
            "backgroundSize": true
        },
        "blocks": {
            "core/image": {
                "lightbox": {
                    "enabled": true,
                    "allowEditing": true
                }
            }
        },
        "shadow": {
            "presets": [
                { "slug": "natural", "name": "Natural", "shadow": "0 2px 4px rgba(0,0,0,0.05)" },
                { "slug": "deep", "name": "Deep", "shadow": "0 8px 24px rgba(0,0,0,0.12)" },
                { "slug": "sharp", "name": "Sharp", "shadow": "0 4px 0 rgba(0,0,0,0.9)" }
            ],
            "defaultPresets": false
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
            "h1": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "fontSize": "var(--wp--preset--font-size--xx-large)",
                    "fontWeight": "700",
                    "lineHeight": "1.1"
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
            "h3": {
                "typography": {
                    "fontFamily": "var(--wp--preset--font-family--heading)",
                    "fontSize": "var(--wp--preset--font-size--large)",
                    "fontWeight": "600",
                    "lineHeight": "1.3"
                }
            },
            "h4": { "typography": { "fontSize": "var(--wp--preset--font-size--medium)", "fontWeight": "600" } },
            "h5": { "typography": { "fontSize": "var(--wp--preset--font-size--small)", "fontWeight": "600" } },
            "h6": { "typography": { "fontSize": "var(--wp--preset--font-size--small)", "fontWeight": "600", "textTransform": "uppercase", "letterSpacing": "0.05em" } },
            "link": {
                "color": { "text": "var(--wp--preset--color--accent)" },
                ":hover": { "color": { "text": "var(--wp--preset--color--primary)" } },
                ":focus": { "color": { "text": "var(--wp--preset--color--primary)" } }
            },
            "button": {
                "color": {
                    "text": "var(--wp--preset--color--background)",
                    "background": "var(--wp--preset--color--primary)"
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
                    "color": {
                        "text": "var(--wp--preset--color--background)",
                        "background": "var(--wp--preset--color--primary)"
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
    },
    "templateParts": [
        { "name": "header", "title": "Header", "area": "header" },
        { "name": "footer", "title": "Footer", "area": "footer" }
    ],
    "customTemplates": []
}
