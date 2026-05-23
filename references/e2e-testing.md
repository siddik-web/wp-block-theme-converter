# E2E Testing Reference

End-to-end and visual regression testing for WordPress block themes using Playwright. Read this when the user asks about automated browser tests, visual regression, or setting up a test suite for their block theme.

---

## Table of Contents

1. [Testing Stack Overview](#testing-stack-overview)
2. [Playwright Setup](#playwright-setup)
3. [Block Render Tests](#block-render-tests)
4. [Full-Page Visual Regression](#full-page-visual-regression)
5. [Interactivity API Tests](#interactivity-api-tests)
6. [Accessibility Tests](#accessibility-tests)
7. [WooCommerce Page Tests](#woocommerce-page-tests)
8. [CI Integration](#ci-integration)
9. [Test Checklist](#test-checklist)

---

## Testing Stack Overview

| Tool | Purpose |
|------|---------|
| **Playwright** | Browser automation, E2E tests, screenshots |
| **@wordpress/e2e-test-utils-playwright** | WordPress-specific Playwright helpers |
| **@axe-core/playwright** | Accessibility scanning in Playwright tests |
| **pixelmatch** / Playwright snapshots | Visual regression |
| **wp-env** | Local WordPress environment for tests |

---

## Playwright Setup

### Installation

```bash
npm install --save-dev @playwright/test @wordpress/e2e-test-utils-playwright @axe-core/playwright

# Install browser binaries
npx playwright install chromium
```

### `playwright.config.js`

```js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig( {
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !! process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: process.env.CI ? 'github' : 'html',

    use: {
        baseURL: process.env.WP_BASE_URL ?? 'http://localhost:8888',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile',
            use: { ...devices['iPhone 14'] },
        },
    ],
} );
```

### `wp-env` Local WordPress Setup

```json
// .wp-env.json
{
    "core": "WordPress/WordPress#6.8-branch",
    "plugins": [],
    "themes": ["."],
    "config": {
        "WP_DEBUG": true,
        "WP_DEBUG_LOG": true,
        "SCRIPT_DEBUG": true
    },
    "port": 8888
}
```

Start the environment:
```bash
npx wp-env start
npx wp-env run cli wp theme activate {{theme-slug}}
```

Add to `package.json`:
```json
{
    "scripts": {
        "env:start": "wp-env start",
        "env:stop": "wp-env stop",
        "env:clean": "wp-env clean all",
        "test:e2e": "playwright test",
        "test:e2e:ui": "playwright test --ui",
        "test:e2e:debug": "PWDEBUG=1 playwright test"
    }
}
```

---

## Block Render Tests

Test that blocks render the expected HTML structure on the frontend.

```js
// tests/e2e/blocks/hero.spec.js
import { test, expect } from '@playwright/test';

test.describe( 'Hero block', () => {
    test.beforeEach( async ( { page } ) => {
        await page.goto( '/' );
    } );

    test( 'renders hero section', async ( { page } ) => {
        const hero = page.locator( '.wp-block-group.is-style-hero' ).first();
        await expect( hero ).toBeVisible();
    } );

    test( 'hero heading is h1', async ( { page } ) => {
        const heading = page.locator( '.is-style-hero h1' ).first();
        await expect( heading ).toBeVisible();
        await expect( heading ).not.toBeEmpty();
    } );

    test( 'hero CTA button is focusable', async ( { page } ) => {
        const ctaButton = page.locator( '.is-style-hero .wp-block-button__link' ).first();
        await ctaButton.focus();
        await expect( ctaButton ).toBeFocused();
    } );

    test( 'hero image has alt text', async ( { page } ) => {
        const img = page.locator( '.is-style-hero img' ).first();
        if ( await img.count() > 0 ) {
            const alt = await img.getAttribute( 'alt' );
            expect( alt ).toBeTruthy();
            expect( alt ).not.toBe( '' );
        }
    } );
} );
```

### Navigation Tests

```js
// tests/e2e/navigation.spec.js
import { test, expect } from '@playwright/test';

test.describe( 'Site navigation', () => {
    test( 'primary navigation renders', async ( { page } ) => {
        await page.goto( '/' );
        const nav = page.locator( 'header nav[aria-label]' ).first();
        await expect( nav ).toBeVisible();
    } );

    test( 'mobile menu toggle works', async ( { page } ) => {
        await page.setViewportSize( { width: 375, height: 812 } );
        await page.goto( '/' );

        const toggle = page.locator( '[aria-expanded][data-wp-on--click]' ).first();
        if ( await toggle.count() === 0 ) {
            test.skip(); // No mobile toggle on this theme
        }

        await expect( toggle ).toHaveAttribute( 'aria-expanded', 'false' );
        await toggle.click();
        await expect( toggle ).toHaveAttribute( 'aria-expanded', 'true' );
    } );

    test( 'skip link reaches main content', async ( { page } ) => {
        await page.goto( '/' );
        await page.keyboard.press( 'Tab' );

        const skipLink = page.locator( '.skip-link' );
        await expect( skipLink ).toBeFocused();

        await page.keyboard.press( 'Enter' );
        const mainContent = page.locator( '#main-content' );
        await expect( mainContent ).toBeFocused();
    } );
} );
```

---

## Full-Page Visual Regression

Playwright's built-in snapshot testing captures screenshots and diffs them against a baseline.

```js
// tests/e2e/visual/homepage.spec.js
import { test, expect } from '@playwright/test';

const PAGES = [
    { name: 'home',    path: '/' },
    { name: 'blog',    path: '/blog/' },
    { name: '404',     path: '/this-page-does-not-exist/' },
];

for ( const { name, path } of PAGES ) {
    test( `${ name } page visual snapshot`, async ( { page } ) => {
        await page.goto( path );
        await page.waitForLoadState( 'networkidle' );

        // Hide dynamic content that changes on every load
        await page.addStyleTag( {
            content: `
                .wp-block-calendar,
                [data-wp-text="state.date"],
                .current-time { visibility: hidden; }
            `,
        } );

        await expect( page ).toHaveScreenshot( `${ name }.png`, {
            fullPage: true,
            maxDiffPixelRatio: 0.01, // Allow 1% pixel difference
        } );
    } );
}
```

**Generate baseline screenshots:**
```bash
npx playwright test --update-snapshots
```

**Run visual regression:**
```bash
npx playwright test tests/e2e/visual/
```

Screenshots are stored in `tests/e2e/visual/*.png-snapshots/`.

---

## Interactivity API Tests

```js
// tests/e2e/interactivity/modal.spec.js
import { test, expect } from '@playwright/test';

test.describe( 'Modal interaction', () => {
    test.beforeEach( async ( { page } ) => {
        await page.goto( '/contact/' ); // Page with modal
    } );

    test( 'modal opens on button click', async ( { page } ) => {
        const trigger = page.locator( '[aria-haspopup="dialog"]' ).first();
        const dialog = page.locator( '[role="dialog"]' ).first();

        await expect( dialog ).not.toBeVisible();
        await trigger.click();
        await expect( dialog ).toBeVisible();
    } );

    test( 'modal closes on Escape', async ( { page } ) => {
        await page.locator( '[aria-haspopup="dialog"]' ).first().click();
        const dialog = page.locator( '[role="dialog"]' ).first();
        await expect( dialog ).toBeVisible();

        await page.keyboard.press( 'Escape' );
        await expect( dialog ).not.toBeVisible();
    } );

    test( 'focus returns to trigger after close', async ( { page } ) => {
        const trigger = page.locator( '[aria-haspopup="dialog"]' ).first();
        await trigger.click();
        await page.keyboard.press( 'Escape' );
        await expect( trigger ).toBeFocused();
    } );

    test( 'focus trapped inside modal', async ( { page } ) => {
        await page.locator( '[aria-haspopup="dialog"]' ).first().click();
        const dialog = page.locator( '[role="dialog"]' ).first();
        const focusableEls = await dialog.locator( 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])' ).all();

        for ( let i = 0; i < focusableEls.length; i++ ) {
            await page.keyboard.press( 'Tab' );
        }

        // After tabbing through all elements, focus should wrap back inside
        const focused = page.locator( ':focus' );
        await expect( dialog ).toContainElement( focused );
    } );
} );
```

### Load More / Infinite Scroll Tests

```js
// tests/e2e/interactivity/load-more.spec.js
import { test, expect } from '@playwright/test';

test( 'load more button fetches additional posts', async ( { page } ) => {
    await page.goto( '/blog/' );

    const postsBefore = await page.locator( '.post-card' ).count();
    const loadMoreBtn = page.locator( '[data-wp-on--click="actions.loadMore"]' );

    await expect( loadMoreBtn ).toBeVisible();
    await loadMoreBtn.click();

    // Wait for network request and re-render
    await page.waitForResponse( /wp\/v2\/posts/ );
    await page.waitForTimeout( 500 ); // Allow re-render

    const postsAfter = await page.locator( '.post-card' ).count();
    expect( postsAfter ).toBeGreaterThan( postsBefore );
} );
```

---

## Accessibility Tests

```js
// tests/e2e/accessibility.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
    { name: 'Home',    path: '/' },
    { name: 'Blog',    path: '/blog/' },
    { name: 'Contact', path: '/contact/' },
    { name: '404',     path: '/this-page-does-not-exist/' },
];

for ( const { name, path } of PAGES ) {
    test( `${ name } — WCAG 2.1 AA compliance`, async ( { page } ) => {
        await page.goto( path );
        await page.waitForLoadState( 'networkidle' );

        const results = await new AxeBuilder( { page } )
            .withTags( [ 'wcag2a', 'wcag2aa', 'wcag21aa' ] )
            .analyze();

        // Report violations in a readable format
        if ( results.violations.length > 0 ) {
            console.log( `\n${ name } accessibility violations:` );
            results.violations.forEach( ( v ) => {
                console.log( `  [${ v.impact }] ${ v.id }: ${ v.description }` );
                v.nodes.forEach( ( n ) => console.log( `    → ${ n.html }` ) );
            } );
        }

        expect( results.violations ).toHaveLength( 0 );
    } );
}

test( 'keyboard navigation — tab order is logical', async ( { page } ) => {
    await page.goto( '/' );

    // Collect tab order
    const tabOrder = [];
    for ( let i = 0; i < 20; i++ ) {
        await page.keyboard.press( 'Tab' );
        const focused = await page.evaluate( () => {
            const el = document.activeElement;
            return el ? { tag: el.tagName, text: el.textContent?.trim().slice( 0, 40 ) } : null;
        } );
        if ( focused ) tabOrder.push( focused );
    }

    // Skip link should be first
    expect( tabOrder[0]?.tag ).toBe( 'A' );
} );
```

---

## WooCommerce Page Tests

```js
// tests/e2e/woocommerce.spec.js
import { test, expect } from '@playwright/test';

test.describe( 'WooCommerce pages', () => {
    test( 'shop page renders product grid', async ( { page } ) => {
        await page.goto( '/shop/' );
        const products = page.locator( '.wc-block-grid__product' );
        await expect( products.first() ).toBeVisible();
    } );

    test( 'single product page renders add to cart', async ( { page } ) => {
        await page.goto( '/product/{{sample-product-slug}}/' );
        const addToCart = page.locator( '.single_add_to_cart_button' );
        await expect( addToCart ).toBeVisible();
    } );

    test( 'cart page renders', async ( { page } ) => {
        await page.goto( '/cart/' );
        await expect( page.locator( '.wp-block-woocommerce-cart' ) ).toBeVisible();
    } );

    test( 'checkout page renders form', async ( { page } ) => {
        await page.goto( '/checkout/' );
        await expect( page.locator( '.wp-block-woocommerce-checkout' ) ).toBeVisible();
    } );
} );
```

---

## CI Integration

Add E2E tests to the CI pipeline (runs after deploy to staging):

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  e2e:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run E2E tests against staging
        run: npx playwright test
        env:
          WP_BASE_URL: ${{ secrets.STAGING_URL }}

      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

---

## Test Checklist

### Setup

- [ ] `playwright.config.js` configured with `baseURL` from environment variable
- [ ] `.wp-env.json` configured with theme and required plugins
- [ ] `package.json` has `test:e2e` and `test:e2e:ui` scripts
- [ ] Playwright browsers installed (`npx playwright install`)

### Coverage

- [ ] All public pages have a basic render test (page loads, no 500 errors)
- [ ] Navigation renders and links are not broken
- [ ] Skip link focuses `#main-content`
- [ ] Mobile menu toggle works (if applicable)
- [ ] All interactive components tested (modals, tabs, accordions, load more)
- [ ] Visual snapshot tests cover home, blog, and 404 pages
- [ ] axe accessibility scan runs on all key pages
- [ ] WooCommerce pages tested (if WooCommerce is required)

### CI

- [ ] E2E test job runs after staging deploy
- [ ] Test report uploaded as artifact on failure
- [ ] Baseline screenshots committed to repository (not gitignored)
- [ ] Visual regression threshold set (e.g., `maxDiffPixelRatio: 0.01`)
