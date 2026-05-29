# WooCommerce Block Theme Reference

Read this file when the user requests WooCommerce support.

## Required Theme Support Declarations

In `inc/woocommerce.php`:

```php
<?php
defined( 'ABSPATH' ) || exit;

function {{theme_slug_underscored}}_woocommerce_setup() {
    add_theme_support( 'woocommerce', array(
        'thumbnail_image_width' => 600,
        'single_image_width'    => 1200,
        'product_grid'          => array(
            'default_rows'    => 3,
            'min_rows'        => 1,
            'default_columns' => 3,
            'min_columns'     => 1,
            'max_columns'     => 6,
        ),
    ) );

    add_theme_support( 'wc-product-gallery-zoom' );
    add_theme_support( 'wc-product-gallery-lightbox' );
    add_theme_support( 'wc-product-gallery-slider' );
}
add_action( 'after_setup_theme', '{{theme_slug_underscored}}_woocommerce_setup' );

// Declare HPOS (High-Performance Order Storage) compatibility.
// NOTE: For themes, use get_template_directory() . '/style.css' as the file reference,
// not __FILE__ which would point to inc/woocommerce.php.
function {{theme_slug_underscored}}_declare_wc_compatibility() {
    if ( class_exists( '\Automattic\WooCommerce\Utilities\FeaturesUtil' ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            get_template_directory() . '/style.css',
            true
        );
    }
}
add_action( 'before_woocommerce_init', '{{theme_slug_underscored}}_declare_wc_compatibility' );
```

## Required Templates

For a complete WooCommerce block theme:

| Template | Purpose | Required Blocks |
|----------|---------|-----------------|
| `templates/single-product.html` | Single product page | `woocommerce/single-product`, `woocommerce/product-image-gallery`, `woocommerce/product-details`, `woocommerce/product-meta` |
| `templates/archive-product.html` | Shop / product archive | `woocommerce/product-collection` |
| `templates/taxonomy-product_cat.html` | Product category archive | `woocommerce/product-collection` filtered by category |
| `templates/taxonomy-product_tag.html` | Product tag archive | `woocommerce/product-collection` filtered by tag |
| `templates/product-search-results.html` | Product search | `woocommerce/product-collection` |
| `templates/page-cart.html` | Cart page | `woocommerce/cart` |
| `templates/page-checkout.html` | Checkout page | `woocommerce/checkout` |
| `templates/page-my-account.html` | My Account page | `woocommerce/customer-account` |

## Single Product Template Skeleton

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">

    <!-- wp:woocommerce/breadcrumbs /-->

    <!-- wp:woocommerce/single-product -->
    <div class="wp-block-woocommerce-single-product">
        <!-- wp:columns -->
        <div class="wp-block-columns">

            <!-- wp:column {"width":"50%"} -->
            <div class="wp-block-column" style="flex-basis:50%">
                <!-- wp:woocommerce/product-image-gallery /-->
            </div>
            <!-- /wp:column -->

            <!-- wp:column {"width":"50%"} -->
            <div class="wp-block-column" style="flex-basis:50%">
                <!-- wp:post-title {"level":1} /-->
                <!-- wp:woocommerce/product-rating /-->
                <!-- wp:woocommerce/product-price /-->
                <!-- wp:post-excerpt /-->
                <!-- wp:woocommerce/add-to-cart-form /-->
                <!-- wp:woocommerce/product-meta /-->
            </div>
            <!-- /wp:column -->

        </div>
        <!-- /wp:columns -->

        <!-- wp:woocommerce/product-details /-->

        <!-- wp:pattern {"slug":"theme-slug/related-products"} /-->
    </div>
    <!-- /wp:woocommerce/single-product -->

</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

## Archive Product Template Skeleton

```html
<!-- wp:template-part {"slug":"header","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">

    <!-- wp:woocommerce/breadcrumbs /-->

    <!-- wp:query-title {"type":"archive"} /-->

    <!-- wp:term-description /-->

    <!-- wp:columns -->
    <div class="wp-block-columns">

        <!-- wp:column {"width":"25%"} -->
        <div class="wp-block-column" style="flex-basis:25%">
            <!-- wp:template-part {"slug":"product-filters"} /-->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"75%"} -->
        <div class="wp-block-column" style="flex-basis:75%">

            <!-- wp:woocommerce/product-collection {"queryId":1,"query":{"perPage":12,"pages":0,"offset":0,"postType":"product","order":"asc","orderBy":"title","search":"","exclude":[],"sticky":"","inherit":true},"displayLayout":{"type":"flex","columns":3}} -->
                <!-- wp:woocommerce/product-template -->
                    <!-- wp:woocommerce/product-image {"showSaleBadge":true,"saleBadgeAlign":"right"} /-->
                    <!-- wp:post-title {"level":3,"isLink":true} /-->
                    <!-- wp:woocommerce/product-price /-->
                    <!-- wp:woocommerce/product-rating /-->
                    <!-- wp:woocommerce/product-button /-->
                <!-- /wp:woocommerce/product-template -->

                <!-- wp:query-pagination -->
                    <!-- wp:query-pagination-previous /-->
                    <!-- wp:query-pagination-numbers /-->
                    <!-- wp:query-pagination-next /-->
                <!-- /wp:query-pagination -->

                <!-- wp:woocommerce/product-collection-no-results -->
                    <!-- wp:paragraph {"align":"center"} -->
                    <p class="has-text-align-center"><?php esc_html_e( 'No products found.', 'theme-slug' ); ?></p>
                    <!-- /wp:paragraph -->
                <!-- /wp:woocommerce/product-collection-no-results -->
            <!-- /wp:woocommerce/product-collection -->

        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer","tagName":"footer"} /-->
```

## Cart Template Skeleton

```html
<!-- wp:template-part {"slug":"header-minimal","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:woocommerce/cart /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer-minimal","tagName":"footer"} /-->
```

## Checkout Template Skeleton

```html
<!-- wp:template-part {"slug":"header-minimal","tagName":"header"} /-->

<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group">
    <!-- wp:post-title {"level":1} /-->
    <!-- wp:woocommerce/checkout /-->
</main>
<!-- /wp:group -->

<!-- wp:template-part {"slug":"footer-minimal","tagName":"footer"} /-->
```

NOTE: Use minimal header/footer for cart/checkout to reduce distractions and improve conversion.

## WooCommerce-Specific theme.json Settings

Add these block overrides:

```json
"settings": {
  "blocks": {
    "woocommerce/product-price": {
      "color": { "text": true },
      "typography": { "fontSize": true, "fontWeight": true }
    },
    "woocommerce/product-button": {
      "color": { "text": true, "background": true },
      "border": { "radius": true }
    },
    "woocommerce/product-image": {
      "border": { "radius": true }
    },
    "woocommerce/cart": {
      "color": { "text": true, "background": true }
    },
    "woocommerce/checkout": {
      "color": { "text": true, "background": true }
    }
  }
},
"styles": {
  "blocks": {
    "woocommerce/product-price": {
      "typography": {
        "fontSize": "var(--wp--preset--font-size--large)",
        "fontWeight": "600"
      },
      "color": {
        "text": "var(--wp--preset--color--primary)"
      }
    },
    "woocommerce/product-button": {
      "color": {
        "text": "var(--wp--preset--color--background)",
        "background": "var(--wp--preset--color--primary)"
      },
      "border": { "radius": "0" }
    }
  }
}
```

## Custom WooCommerce Patterns

Common eCommerce patterns to register:

1. **product-grid-default** — Standard 3-column product grid
2. **product-grid-featured** — Featured products with hero treatment
3. **product-quick-view** — Modal product preview
4. **product-compare** — Side-by-side product comparison
5. **bundle-section** — Product bundles
6. **reviews-section** — Customer reviews showcase
7. **trust-badges** — Payment/shipping/return badges
8. **shipping-returns-info** — Footer info bar
9. **newsletter-signup** — Email capture
10. **related-products** — Related/upsell products
11. **category-showcase** — Featured categories
12. **brand-story** — Brand storytelling section

## Required Plugins to Recommend

```php
function {{theme_slug_underscored}}_recommended_plugins() {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function() {
            echo '<div class="notice notice-warning"><p>';
            esc_html_e( 'This theme works best with WooCommerce. Please install and activate WooCommerce.', 'theme-slug' );
            echo '</p></div>';
        });
    }
}
add_action( 'admin_init', '{{theme_slug_underscored}}_recommended_plugins' );
```

## Performance Notes for eCommerce

- **Lazy-load product images** below the fold (core default)
- **Preload LCP image** on single product page (the main product image)
- **Defer non-critical JS** like reviews, recommendations
- **Use `woocommerce/product-collection`** instead of `woocommerce/products-by-attribute` (newer, more performant)
- **Cache product queries** via WC's built-in cache layer
- **Consider Object Cache** (Redis/Memcached) recommendation in readme

## Accessibility Notes for eCommerce

- Ensure "Add to Cart" buttons have descriptive labels (not just "Add")
- Provide screen-reader text for price changes (sale price)
- Ensure star ratings have text equivalents
- Ensure product gallery has keyboard navigation
- Ensure cart updates announce to screen readers (aria-live regions)

## Graceful Degradation

If WooCommerce is not installed, the theme should still function:

```php
// Check before using WC functions
if ( function_exists( 'WC' ) ) {
    // WC-specific code
}

// Conditional template loading
if ( class_exists( 'WooCommerce' ) ) {
    // Load WC templates
}
```

In templates, use `<!-- wp:pattern -->` references that fall back to placeholder content if WC is missing.
