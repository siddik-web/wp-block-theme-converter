# should-trigger — /convert-to-wp-theme

These queries should trigger the `/convert-to-wp-theme` workflow. For each case, paste the query into Claude with the skill installed and verify the response matches the expected behavior.

---

## Query 1

I have a static landing page built in HTML and CSS. Here's the HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Acme SaaS</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <nav>...</nav>
  </header>
  <section class="hero">
    <h1>Ship faster.</h1>
    <p>The dev tool that gets out of your way.</p>
    <a href="#pricing" class="btn-primary">Start free trial</a>
  </section>
  <footer>...</footer>
</body>
</html>
```

Convert this to a WordPress block theme.

**Expected behavior:** Claude should invoke the `/convert-to-wp-theme` workflow — state assumptions, produce a conversion plan mapping the HTML structure to FSE templates and patterns, confirm success criteria, then generate the theme files (theme.json, templates, patterns, functions.php).

**Should NOT do:** Generate a classic PHP theme, embed inline `style=""` attributes in block markup, hardcode hex colors in CSS without theme.json tokens, or proceed without stating assumptions.

---

## Query 2

Please convert my website to a WordPress FSE theme. It uses a CSS grid layout with three columns on the homepage and a sticky header. I want WooCommerce support too. Here's the source:

```html
<!-- ... (long HTML) ... -->
```

**Expected behavior:** Claude should recognize the WooCommerce requirement, invoke the skill workflow, produce a plan that includes WooCommerce block templates (archive-product, single-product, cart, checkout), and generate theme files. It should explicitly state HPOS compatibility and the `templates/woocommerce/` directory structure.

**Should NOT do:** Ignore the WooCommerce requirement, create a classic `woocommerce.php` override instead of block templates, or skip the conversion plan step.

---

## Query 3

/convert-to-wp-theme

Here's my portfolio site HTML. I want it to be a Gutenberg block theme for WordPress 6.5+. Theme name: "Portia". Author: Jane Doe.

```html
<body>
  <nav class="main-nav">...</nav>
  <section id="work">
    <div class="project-card">...</div>
    <div class="project-card">...</div>
  </section>
  <section id="about">...</section>
  <section id="contact">...</section>
</body>
```

**Expected behavior:** The explicit `/convert-to-wp-theme` command triggers immediate invocation of the command workflow. Claude should use the provided theme name/author, map `#work` project cards to a block pattern (likely `core/query` or a custom pattern), and generate all required FSE theme files.

**Should NOT do:** Ask what "FSE" means, ignore the provided theme name/author, or scaffold WooCommerce support that wasn't requested.

---

## Query 4

I want to migrate my HTML/CSS/JS marketing site to WordPress. The site has a hero, a features section, a pricing table, testimonials, and a footer. I don't care about the command — just make it a block theme.

**Expected behavior:** The natural-language trigger ("migrate ... to WordPress", "block theme") fires the skill. Claude should ask for the HTML source if not provided, or (if the HTML was included) proceed with the conversion plan. It should map each section (hero, features, pricing, testimonials, footer) to corresponding block patterns and propose template parts for the header and footer.

**Should NOT do:** Build a page builder theme, ask the user to install Elementor, or skip the plan step and jump straight to code.

---

## Query 5

Here's a CSS file with design tokens for my brand:

```css
:root {
  --color-primary: #1a56db;
  --color-secondary: #7e3af2;
  --color-text: #111827;
  --font-body: 'Inter', sans-serif;
  --font-heading: 'Merriweather', serif;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
}
```

Turn this into a WordPress block theme with the above tokens defined in theme.json. Also scaffold an empty homepage template.

**Expected behavior:** Claude should invoke the skill, map the CSS custom properties to their theme.json equivalents (`settings.color.palette`, `settings.typography.fontFamilies`, `settings.spacing.spacingScale`), generate a complete and valid theme.json v3, and scaffold a minimal homepage template. It should confirm no other features are being added beyond what was asked.

**Should NOT do:** Output partial theme.json, skip the spacing tokens, hardcode the colors in CSS instead of theme.json, or add unrequested features (dark mode, WooCommerce, etc.).
