# Accessibility Deep-Dive Reference

Practical WCAG 2.1 AA implementation patterns for WordPress block themes. The validation checklist in `references/validation-checklist.md` tells you WHAT to check — this file tells you HOW to implement each requirement correctly.

Read this file during Phase 8 (Accessibility & Performance) or when any accessibility-specific question arises.

---

## Table of Contents

1. [WCAG 2.1 AA — Core Requirements Summary](#wcag-21-aa--core-requirements-summary)
2. [Skip Links](#skip-links)
3. [Semantic HTML in Block Themes](#semantic-html-in-block-themes)
4. [Color Contrast](#color-contrast)
5. [Focus Management](#focus-management)
6. [Keyboard Navigation Patterns](#keyboard-navigation-patterns)
7. [ARIA Patterns](#aria-patterns)
8. [Images and Alt Text](#images-and-alt-text)
9. [Forms Accessibility](#forms-accessibility)
10. [Motion and Animation](#motion-and-animation)
11. [Dark Mode and High Contrast](#dark-mode-and-high-contrast)
12. [Screen Reader Testing](#screen-reader-testing)
13. [Automated Accessibility Testing](#automated-accessibility-testing)
14. [Accessibility Checklist](#accessibility-checklist)

---

## WCAG 2.1 AA — Core Requirements Summary

| Principle | Key AA requirements |
|-----------|-------------------|
| **Perceivable** | 4.5:1 text contrast, 3:1 UI/graphic contrast, text resize to 200%, captions for video, alt text for images |
| **Operable** | All functionality keyboard-accessible, no keyboard traps (except modals), skip links, no seizure-inducing content, 2.5× touch target size (mobile) |
| **Understandable** | Page language set, labels for inputs, error identification and suggestion, consistent navigation |
| **Robust** | Valid HTML, ARIA used correctly, name/role/value for all UI components |

WordPress block themes start with strong semantic HTML via `tagName` attributes. The main gaps are: skip links, interactive component ARIA, motion, and color contrast.

---

## Skip Links

Skip links allow keyboard and screen reader users to bypass repeated navigation.

### Implementation

Every theme must have a skip link as the first focusable element in `parts/header.html`.

**In `parts/header.html` (at the very top, before everything else):**

```html
<!-- wp:html -->
<a class="skip-link screen-reader-text" href="#main-content">
    <?php esc_html_e( 'Skip to content', 'my-theme' ); ?>
</a>
<!-- /wp:html -->

<!-- wp:group {"tagName":"header","className":"site-header",...} -->
...
<!-- /wp:group -->
```

**In the main content template** (`templates/index.html` and all page templates), the target:

```html
<!-- wp:group {"tagName":"main","anchor":"main-content","layout":{"type":"constrained"}} -->
<main class="wp-block-group" id="main-content" tabindex="-1">
    <!-- content -->
</main>
<!-- /wp:group -->
```

`tabindex="-1"` on `<main>` allows focus to be programmatically moved to it (required for the skip link to work correctly with all browsers).

**CSS — visible on focus, hidden otherwise:**

```css
.skip-link {
    position: absolute;
    inset-inline-start: -9999px;
    inset-block-start: 0;
    z-index: 999;
    padding-block: var(--wp--preset--spacing--30);
    padding-inline: var(--wp--preset--spacing--50);
    background-color: var(--wp--preset--color--primary);
    color: var(--wp--preset--color--background);
    font-weight: 700;
    text-decoration: none;
}

.skip-link:focus {
    inset-inline-start: var(--wp--preset--spacing--40);
}
```

**Mirror in `assets/css/editor.css`:**

```css
/* Skip link not visible in editor — pattern intentionally omitted */
```

### Multiple Skip Links (for complex pages)

For pages with a sidebar or a long secondary navigation:

```html
<a class="skip-link screen-reader-text" href="#main-content">
    <?php esc_html_e( 'Skip to content', 'my-theme' ); ?>
</a>
<a class="skip-link screen-reader-text" href="#site-navigation">
    <?php esc_html_e( 'Skip to navigation', 'my-theme' ); ?>
</a>
```

---

## Semantic HTML in Block Themes

### tagName Attribute

Block themes control HTML element semantics via `tagName` in block attributes — never add wrapper `<div>` elements to change semantics.

```html
<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">...</main>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","layout":{"type":"constrained"}} -->
<article class="wp-block-group">...</article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"section","ariaLabel":"Featured posts","layout":{"type":"constrained"}} -->
<section class="wp-block-group" aria-label="Featured posts">...</section>
<!-- /wp:group -->

<!-- wp:group {"tagName":"aside","layout":{"type":"constrained"}} -->
<aside class="wp-block-group">...</aside>
<!-- /wp:group -->

<!-- wp:group {"tagName":"nav","ariaLabel":"Breadcrumb"} -->
<nav class="wp-block-group" aria-label="Breadcrumb">...</nav>
<!-- /wp:group -->
```

### Landmark Roles

Every page must have exactly:

- 1 `<header>` landmark (`role="banner"` implied)
- 1 `<main>` landmark (`role="main"` implied)
- 1 `<footer>` landmark (`role="contentinfo"` implied)
- Multiple `<nav>` elements are allowed but each MUST have a unique `aria-label`

```html
<!-- Primary navigation -->
<!-- wp:navigation {"ariaLabel":"<?php esc_attr_e( 'Primary', 'my-theme' ); ?>"} /-->

<!-- Secondary/footer navigation -->
<!-- wp:navigation {"ariaLabel":"<?php esc_attr_e( 'Footer', 'my-theme' ); ?>"} /-->
```

### Heading Hierarchy

Every page must have exactly one `<h1>`. Template structure:

```
<h1> — Post title (core/post-title) or site title (core/site-title with level=1)
  <h2> — Major sections
    <h3> — Subsections
      <h4> — Rarely needed
```

Do not skip heading levels (no jumping from `<h1>` to `<h3>`).

For the front page where the site title is `<h1>`, post listings should start at `<h2>`:

```html
<!-- wp:query-title {"type":"archive","level":2} /-->
<!-- wp:post-template -->
    <!-- wp:post-title {"level":2} /-->
<!-- /wp:post-template -->
```

---

## Color Contrast

### Minimum Ratios (WCAG 2.1 AA)

| Element | Minimum contrast ratio |
|---------|----------------------|
| Normal text (< 18pt / < 14pt bold) | 4.5:1 |
| Large text (≥ 18pt / ≥ 14pt bold) | 3:1 |
| UI components (button borders, inputs) | 3:1 against adjacent color |
| Icons (informative) | 3:1 |
| Decorative elements | No requirement |
| Placeholder text | 4.5:1 (treat as normal text) |
| Disabled elements | No requirement |

### Checking Contrast in theme.json

When defining the color palette, verify each color pair used for text/background:

**Tools:**

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) — manual
- `npx contrast-ratio "#0F172A" "#FFFFFF"` — CLI
- Chrome DevTools → Accessibility pane → color contrast
- axe DevTools browser extension

**theme.json palette design rule:**

- `foreground` on `background` must be ≥ 4.5:1
- `primary` (used as button background) with white text must be ≥ 4.5:1
- `muted` (used for secondary text) on `background` must be ≥ 4.5:1

### Common Failure: Gray Text

Gray secondary text fails most often. Minimum safe values:

| Background | Minimum gray for 4.5:1 |
|-----------|----------------------|
| White (#FFFFFF) | #767676 or darker |
| Light gray (#F8F9FA) | #6B7280 or darker |
| Dark (#0F172A) | #A0ADB8 or lighter |

### Link Contrast

Links must be distinguishable from surrounding text WITHOUT relying on color alone. Use underline OR 3:1 contrast ratio between link color and surrounding text color. Default browser underlines satisfy this — do not remove `text-decoration: underline` on body links.

---

## Focus Management

### Visible Focus Indicator (WCAG 2.4.11, AA in 2.2)

Every interactive element must have a visible focus indicator with:

- Minimum 3:1 contrast ratio between focused and unfocused state
- Focus area of at least the perimeter of the element

```css
/* Global focus styles — applies to all interactive elements */
:focus-visible {
    outline: 2px solid var(--wp--preset--color--primary);
    outline-offset: 2px;
    border-radius: 2px;
}

/* Never remove focus outline without replacing it */
:focus:not(:focus-visible) {
    outline: none; /* Removes outline for mouse users only — keyboard still gets :focus-visible */
}
```

### Focus Traps (Required for Modals)

See `references/interactivity-api-advanced.md` — Modal Focus Trap section for the full implementation.

**Rules:**

1. When a modal opens, focus moves to the first focusable element inside it (or the modal itself if nothing is focusable)
2. Tab and Shift+Tab cycle through focusable elements INSIDE the modal only
3. Escape closes the modal and returns focus to the trigger element
4. Background content must have `aria-hidden="true"` while modal is open

### Focus After Dynamic Content

When new content loads (Load More, filter, tab switch):

```js
callbacks: {
    onPostsLoaded() {
        if ( state.newPostCount === 0 ) return;

        // Move focus to the first new post to announce it
        const { ref } = getElement();
        const firstNewPost = ref.querySelectorAll( '.post-card' )[ state.previousCount ];
        firstNewPost?.focus();
    },
},
```

---

## Keyboard Navigation Patterns

### Navigation Menus

The `core/navigation` block provides full keyboard navigation. For custom navigation patterns:

| Key | Action |
|-----|--------|
| Tab / Shift+Tab | Move between top-level items |
| Enter / Space | Open dropdown submenu |
| Arrow Down | Move to first submenu item |
| Arrow Up/Down | Move between submenu items |
| Escape | Close submenu, return focus to parent |
| Home / End | Move to first/last item (optional) |

### Tabs Pattern

```html
<div
    role="tablist"
    aria-label="<?php esc_attr_e( 'Content tabs', 'my-theme' ); ?>"
    data-wp-interactive="myTheme"
>
    <button
        role="tab"
        data-wp-on--click="actions.setTab"
        data-tab="overview"
        data-wp-bind--aria-selected="state.activeTab === 'overview'"
        data-wp-bind--tabindex="state.activeTab === 'overview' ? '0' : '-1'"
    >
        <?php esc_html_e( 'Overview', 'my-theme' ); ?>
    </button>
    <button
        role="tab"
        data-wp-on--click="actions.setTab"
        data-tab="details"
        data-wp-bind--aria-selected="state.activeTab === 'details'"
        data-wp-bind--tabindex="state.activeTab === 'details' ? '0' : '-1'"
    >
        <?php esc_html_e( 'Details', 'my-theme' ); ?>
    </button>
</div>

<div
    role="tabpanel"
    aria-labelledby="tab-overview"
    data-wp-bind--hidden="state.activeTab !== 'overview'"
>
    <!-- Overview content -->
</div>
<div
    role="tabpanel"
    aria-labelledby="tab-details"
    data-wp-bind--hidden="state.activeTab !== 'details'"
>
    <!-- Details content -->
</div>
```

**Arrow key navigation in tab list:**

```js
actions: {
    onTabKeydown( event ) {
        const tabs = Array.from( document.querySelectorAll( '[role="tab"]' ) );
        const index = tabs.indexOf( event.target );

        if ( event.key === 'ArrowRight' ) {
            tabs[ ( index + 1 ) % tabs.length ].focus();
        } else if ( event.key === 'ArrowLeft' ) {
            tabs[ ( index - 1 + tabs.length ) % tabs.length ].focus();
        } else if ( event.key === 'Home' ) {
            tabs[0].focus();
        } else if ( event.key === 'End' ) {
            tabs[ tabs.length - 1 ].focus();
        }
    },
},
```

### Disclosure (Details/Summary)

Prefer `core/details` block (renders native `<details><summary>`) for simple accordions — native keyboard support is built in. Use custom Interactivity API patterns only when native `<details>` lacks required behavior (e.g., only one open at a time, animated transitions).

---

## ARIA Patterns

### Button vs Link

| Use case | Element |
|----------|---------|
| Triggers an action (open modal, toggle, submit) | `<button>` |
| Navigates to a URL | `<a href="...">` |
| Looks like a button but navigates | `<a href="..." class="wp-block-button__link">` |

Never use `<div onclick>` or `<span onclick>` — use `<button>` instead.

### Icon Buttons

Icon-only buttons must have an accessible name:

```html
<!-- Option A: aria-label -->
<button aria-label="<?php esc_attr_e( 'Close menu', 'my-theme' ); ?>">
    <?php echo {{theme_slug_underscored}}_get_svg( 'close' ); // Returns sanitized SVG ?>
</button>

<!-- Option B: visually hidden text -->
<button>
    <?php echo {{theme_slug_underscored}}_get_svg( 'close' ); ?>
    <span class="screen-reader-text">
        <?php esc_html_e( 'Close menu', 'my-theme' ); ?>
    </span>
</button>
```

### aria-expanded on Disclosure Controls

```html
<button
    data-wp-bind--aria-expanded="state.isOpen"
    aria-controls="panel-id"
>
    <?php esc_html_e( 'Toggle section', 'my-theme' ); ?>
</button>
<div id="panel-id" data-wp-class--is-hidden="!state.isOpen">
    <!-- content -->
</div>
```

CSS to show/hide the panel:

```css
.is-hidden {
    display: none;
}
```

`display: none` removes content from the accessibility tree — correct for disclosure panels.

### aria-current for Navigation

```html
<!-- wp:navigation-link {"current":true} /-->
```

The `core/navigation` block adds `aria-current="page"` automatically. For custom navigation, add it manually:

```php
<a
    href="<?php the_permalink(); ?>"
    <?php if ( is_singular() && get_the_ID() === $nav_item_id ) : ?>
    aria-current="page"
    <?php endif; ?>
>
```

### Required Form Fields

```html
<label for="email">
    <?php esc_html_e( 'Email address', 'my-theme' ); ?>
    <span aria-hidden="true">*</span>
    <span class="screen-reader-text">
        <?php esc_html_e( '(required)', 'my-theme' ); ?>
    </span>
</label>
<input
    type="email"
    id="email"
    name="email"
    required
    aria-required="true"
    aria-describedby="email-error"
>
<div
    id="email-error"
    role="alert"
    aria-live="assertive"
    data-wp-text="state.emailError"
></div>
```

---

## Images and Alt Text

### Decision Tree for Alt Text

```
Is the image purely decorative (no information content)?
  → alt=""  (empty string, NOT omitted)

Does the image convey information already in adjacent text?
  → alt=""  (avoid duplication)

Is the image a logo?
  → alt="Company Name logo"  (include the text)

Is the image a chart or graph?
  → alt="[brief summary]"  AND provide a text description nearby

Is the image a button or link?
  → alt="[describes the destination or action]"

Otherwise:
  → alt="[describes the image content and its purpose]"
```

### SVG Accessibility

Inline SVGs used as icons (button labels):

```html
<!-- Decorative icon — hidden from screen readers -->
<svg aria-hidden="true" focusable="false" ...>...</svg>

<!-- Informative icon — needs a title -->
<svg role="img" aria-labelledby="icon-title-{{unique-id}}">
    <title id="icon-title-{{unique-id}}"><?php esc_html_e( 'Search', 'my-theme' ); ?></title>
    ...
</svg>
```

### Background Images

Background images in CSS are always decorative — do not convey information via a CSS background image. If the image is informative, use `<img>` with alt text instead.

---

## Forms Accessibility

### Label Association

Every input must have a programmatically associated label:

```html
<!-- Option A: for/id (preferred) -->
<label for="name"><?php esc_html_e( 'Full name', 'my-theme' ); ?></label>
<input type="text" id="name" name="name" autocomplete="name">

<!-- Option B: wrapping label -->
<label>
    <?php esc_html_e( 'Full name', 'my-theme' ); ?>
    <input type="text" name="name" autocomplete="name">
</label>

<!-- Option C: aria-label (when no visible label) -->
<input type="search" aria-label="<?php esc_attr_e( 'Search posts', 'my-theme' ); ?>">

<!-- Option D: aria-labelledby -->
<h3 id="contact-heading"><?php esc_html_e( 'Contact us', 'my-theme' ); ?></h3>
<input aria-labelledby="contact-heading" type="text" name="name">
```

### Autocomplete Attributes

For contact and login forms, always include `autocomplete`:

```html
<input type="text"  name="name"     autocomplete="name">
<input type="email" name="email"    autocomplete="email">
<input type="tel"   name="phone"    autocomplete="tel">
<input type="text"  name="address"  autocomplete="street-address">
<input type="text"  name="city"     autocomplete="address-level2">
<input type="text"  name="zip"      autocomplete="postal-code">
```

### Error Messages

```html
<div role="alert" aria-live="assertive">
    <!-- Errors injected here are announced immediately -->
</div>

<!-- Per-field errors linked via aria-describedby -->
<input
    type="email"
    id="email"
    aria-describedby="email-hint email-error"
    aria-invalid="<?php echo $has_error ? 'true' : 'false'; ?>"
>
<div id="email-hint" class="field-hint">
    <?php esc_html_e( 'We will never share your email.', 'my-theme' ); ?>
</div>
<div id="email-error" class="field-error" role="alert">
    <?php if ( $has_error ) esc_html_e( 'Please enter a valid email address.', 'my-theme' ); ?>
</div>
```

---

## Motion and Animation

### prefers-reduced-motion

Respect the OS-level "Reduce Motion" setting. Wrap ALL animations:

```css
/* Default: full animation */
.card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--wp--preset--shadow--raised);
}

/* Reduced motion: disable animation, keep state change */
@media (prefers-reduced-motion: reduce) {
    .card {
        transition: none;
    }

    .card:hover {
        transform: none;
    }
}
```

For Interactivity API scroll-based animations:

```js
callbacks: {
    initReveal() {
        // Respect reduced motion preference
        if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
            return; // Skip animation entirely
        }

        const { ref } = getElement();
        const observer = new IntersectionObserver( ( entries ) => {
            entries.forEach( ( entry ) => {
                if ( entry.isIntersecting ) {
                    entry.target.classList.add( 'is-revealed' );
                    observer.unobserve( entry.target );
                }
            } );
        } );
        observer.observe( ref );
    },
},
```

### Pause Controls for Auto-Playing Content

Any content that auto-plays (carousel, slideshow, video) must have a pause button (WCAG 2.2.2):

```html
<button
    data-wp-on--click="actions.toggleAutoplay"
    data-wp-bind--aria-pressed="!state.isPlaying"
    data-wp-bind--aria-label="state.isPlaying
        ? '<?php esc_attr_e( 'Pause slideshow', 'my-theme' ); ?>'
        : '<?php esc_attr_e( 'Play slideshow', 'my-theme' ); ?>'"
>
    <span data-wp-bind--hidden="!state.isPlaying">⏸</span>
    <span data-wp-bind--hidden="state.isPlaying">▶</span>
</button>
```

---

## Dark Mode and High Contrast

### Dark Mode with theme.json

In `theme.json`, define a `dark` style variation:

```json
{
    "styles": {
        "variations": {
            "dark": {
                "color": {
                    "background": "var(--wp--preset--color--foreground)",
                    "text": "var(--wp--preset--color--background)"
                }
            }
        }
    }
}
```

Or use `prefers-color-scheme` in CSS:

```css
@media (prefers-color-scheme: dark) {
    :root {
        --wp--preset--color--background: #0F172A;
        --wp--preset--color--foreground: #F8FAFC;
        --wp--preset--color--surface: #1E293B;
        --wp--preset--color--border: #334155;
    }
}
```

**Verify dark mode contrast ratios separately** — colors that pass in light mode may fail in dark mode.

### Forced Colors / High Contrast Mode

Windows High Contrast Mode replaces all colors with user-defined values. Ensure interactive states are distinguishable without color:

```css
@media (forced-colors: active) {
    /* Ensure focus indicator is visible */
    :focus-visible {
        outline: 3px solid ButtonText;
    }

    /* Ensure custom buttons have a border for visibility */
    .wp-block-button__link {
        border: 2px solid ButtonText;
    }

    /* Suppress CSS background images — they disappear in forced-colors mode */
    .hero-background {
        background-image: none;
    }
}
```

---

## Screen Reader Testing

### Testing Matrix (Minimum)

| Browser | Screen reader | Platform |
|---------|-------------|---------|
| Firefox | NVDA | Windows |
| Chrome | JAWS | Windows |
| Safari | VoiceOver | macOS |
| Safari / Chrome | VoiceOver | iOS |
| Chrome | TalkBack | Android |

For most block themes, testing with **NVDA + Firefox** and **VoiceOver + Safari (macOS)** covers the primary user base.

### Key Items to Test Manually

1. **Skip link** — Tab from address bar; first Tab should focus the skip link; Enter should move focus to `#main-content`
2. **Page heading structure** — Use screen reader heading navigation (H key in NVDA/JAWS) to verify `h1` → `h2` → `h3` hierarchy
3. **Navigation landmarks** — Use screen reader landmark navigation (D key / Rotor) to verify header, main, nav, footer
4. **Interactive elements** — Tab through all buttons/links; verify accessible name is announced; activate with Enter/Space
5. **Image alt text** — Screen reader announces alt text (or "image" for blank alt)
6. **Form labels** — Tab to each input; screen reader announces the label
7. **Error messages** — Submit form with empty required fields; verify error is announced
8. **Dynamic content** — Use filter/load more; verify content change is announced
9. **Modal** — Open modal; focus moves inside; Tab stays inside; Escape closes; focus returns to trigger

---

## Automated Accessibility Testing

### axe-core (recommended)

```bash
# Install
npm install --save-dev @axe-core/cli

# Run against a URL
npx axe https://staging.example.com --tags wcag2a,wcag2aa

# Run against multiple pages
npx axe \
  https://staging.example.com/ \
  https://staging.example.com/about/ \
  https://staging.example.com/contact/ \
  --tags wcag2a,wcag2aa \
  --reporter json > axe-results.json
```

### Playwright + axe-core

```js
// tests/e2e/accessibility.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog/' },
    { name: 'Contact', path: '/contact/' },
];

for ( const { name, path } of pages ) {
    test( `${ name } page passes WCAG 2.1 AA`, async ( { page } ) => {
        await page.goto( path );

        const results = await new AxeBuilder( { page } )
            .withTags( [ 'wcag2a', 'wcag2aa', 'wcag21aa' ] )
            .analyze();

        expect( results.violations ).toEqual( [] );
    } );
}
```

### Lighthouse CLI

```bash
npx lighthouse https://staging.example.com \
  --only-categories=accessibility \
  --chrome-flags="--headless" \
  --output=json \
  --output-path=./lighthouse-a11y.json

# Extract score
node -e "
const r = require('./lighthouse-a11y.json');
console.log('Accessibility:', Math.round(r.categories.accessibility.score * 100));
"
```

Target: ≥ 90 (100 if possible — Lighthouse does not test all WCAG criteria).

### stylelint Accessibility Rules

```bash
npm install --save-dev stylelint-a11y

# In .stylelintrc.json
{
    "plugins": ["stylelint-a11y"],
    "rules": {
        "a11y/no-outline-none": true,
        "a11y/selector-pseudo-class-focus": true,
        "a11y/media-prefers-reduced-motion": true,
        "a11y/font-size-is-readable": true
    }
}
```

---

## Accessibility Checklist

### Structure

- [ ] Skip link is first focusable element, visible on focus, target has `tabindex="-1"`
- [ ] Page has exactly one `<h1>`
- [ ] Heading levels are not skipped (`h1 → h2 → h3`, not `h1 → h3`)
- [ ] Page has `<header>`, `<main>`, `<footer>` landmarks
- [ ] Multiple `<nav>` elements each have unique `aria-label`
- [ ] `<section>` elements have `aria-label` or `aria-labelledby`

### Color and Contrast

- [ ] Normal text: ≥ 4.5:1 contrast ratio
- [ ] Large text (18pt+ or 14pt+ bold): ≥ 3:1 contrast ratio
- [ ] UI components (buttons, inputs): ≥ 3:1 against adjacent background
- [ ] Links distinguishable from surrounding text without color alone
- [ ] Dark mode verified separately (if implemented)
- [ ] High contrast mode (`forced-colors`) verified

### Keyboard

- [ ] All interactive elements reachable via Tab
- [ ] Focus order is logical (top to bottom, left to right)
- [ ] Focus indicator visible on all interactive elements (3:1 contrast)
- [ ] No keyboard traps except modals (with Escape to close)
- [ ] Modals: focus moves in on open, trapped inside, returns to trigger on close
- [ ] Tabs use arrow key navigation within `[role="tablist"]`
- [ ] Dropdowns close on Escape

### Images

- [ ] All informative images have meaningful alt text
- [ ] Decorative images have `alt=""`
- [ ] Images in buttons/links describe the action/destination
- [ ] SVG icons have `aria-hidden="true"` (if decorative) or accessible title (if informative)

### Forms

- [ ] Every input has an associated visible label
- [ ] Required fields indicated with `aria-required="true"` AND visible indicator
- [ ] Error messages linked via `aria-describedby`
- [ ] Error messages have `role="alert"` or `aria-live="assertive"`
- [ ] `autocomplete` attributes on contact form fields

### Motion

- [ ] All CSS animations/transitions wrapped in `@media (prefers-reduced-motion: reduce)`
- [ ] Scroll-based animations skip when reduced motion is preferred
- [ ] Auto-playing carousels/videos have pause controls

### Dynamic Content

- [ ] Dynamic content changes announced via `aria-live` region
- [ ] Loading states announced (`aria-live="polite"` spinner label)
- [ ] Filter results count announced after filter update
- [ ] New content receives focus or is announced after load

### ARIA

- [ ] No invalid ARIA roles
- [ ] `aria-expanded` on all disclosure controls
- [ ] `aria-hidden="true"` on all decorative icons
- [ ] `aria-current="page"` on current navigation item
- [ ] `aria-modal="true"` on modal dialogs
- [ ] No ARIA that overrides native semantics without good reason

### Testing

- [ ] axe-core automated scan passes with zero violations
- [ ] Lighthouse accessibility score ≥ 90
- [ ] Manual keyboard test completed (Tab through all interactions)
- [ ] NVDA + Firefox manual test completed
- [ ] VoiceOver + Safari manual test completed (if budget allows)
