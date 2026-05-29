# should-not-trigger — /convert-to-wp-theme

These queries should NOT trigger the `/convert-to-wp-theme` workflow. For each case, paste the query into Claude with the skill installed and verify that Claude responds normally without switching into WP block theme mode.

---

## Query 1

Build me a React component for a hero section with a headline, subtext, and a CTA button. Use Tailwind CSS.

**Expected behavior:** Claude should generate a standard React component with Tailwind classes. No WordPress theme files, no block patterns, no theme.json.

**Why this should not trigger:** The request is explicitly for React, not WordPress. "Hero section" and "CTA button" are common UI terms not specific to WordPress.

**Red flags indicating incorrect trigger:** Claude mentions WordPress blocks, outputs theme.json, generates a `.php` pattern file, or switches to FSE terminology.

---

## Query 2

I have an HTML file I need to convert to a PDF. Can you help me set that up using Puppeteer?

**Expected behavior:** Claude should explain how to use Puppeteer (or an alternative like `html-pdf`, `wkhtmltopdf`) to convert HTML to PDF. No WordPress-related output.

**Why this should not trigger:** "Convert HTML" alone is not sufficient — the destination is a PDF, not a WordPress theme. The word "convert" combined with "HTML" should not trigger the skill without the WordPress context.

**Red flags indicating incorrect trigger:** Claude outputs WordPress code, mentions FSE, or asks about WordPress version compatibility.

---

## Query 3

Create a WordPress plugin that adds a custom post type for "Portfolio Projects" with fields for title, thumbnail, and description. Show me the plugin file.

**Expected behavior:** Claude should generate a WordPress plugin file (a `.php` file with the `Plugin Name:` header), using `register_post_type()` and optionally `register_meta()` or an ACF-based approach. The output is a plugin, not a theme.

**Why this should not trigger:** The request is for a WordPress plugin, not a block theme. While both are WordPress development tasks, the skill is specifically for block theme conversion. Plugins and themes are entirely different artifacts.

**Red flags indicating incorrect trigger:** Claude outputs `style.css` with a theme header, generates `theme.json`, or starts building FSE templates instead of a plugin.
