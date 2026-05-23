<?php
/**
 * Title: WooCommerce Product Card
 * Slug: {{theme-slug}}/woocommerce-product-card
 * Categories: WooCommerce, featured
 * Keywords: woocommerce, product, shop, card, ecommerce
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: A single WooCommerce product card for use inside a Query Loop. Displays product image, title, price, rating, and an Add to Cart button.
 *
 * Requires: WooCommerce 8.0+, WordPress 6.5+
 */

// Guard: only output if WooCommerce is active.
if ( ! class_exists( 'WooCommerce' ) ) {
    return;
}
?>
<!-- wp:group {"tagName":"article","className":"wc-product-card","style":{"spacing":{"padding":{"top":"0","right":"0","bottom":"0","left":"0"}},"border":{"radius":"8px"}},"backgroundColor":"surface","layout":{"type":"constrained"}} -->
<article class="wp-block-group wc-product-card has-surface-background-color has-background" style="border-radius:8px">

    <!-- Product image -->
    <!-- wp:woocommerce/product-image {"isDescendentOfQueryLoop":true,"width":"100%","style":{"spacing":{"margin":{"bottom":"0"}}}} /-->

    <!-- Card body -->
    <!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|40","right":"var:preset|spacing|40","bottom":"var:preset|spacing|40","left":"var:preset|spacing|40"},"rowGap":"var:preset|spacing|20"}},"layout":{"type":"flex","orientation":"vertical"}} -->
    <div class="wp-block-group" style="padding:var(--wp--preset--spacing--40);row-gap:var(--wp--preset--spacing--20)">

        <!-- Category badge -->
        <!-- wp:post-terms {"term":"product_cat","style":{"typography":{"fontSize":"var:preset|font-size|small","fontWeight":"600"}},"textColor":"primary"} /-->

        <!-- Product title -->
        <!-- wp:post-title {"isLink":true,"level":3,"style":{"typography":{"fontSize":"var:preset|font-size|medium","fontWeight":"700","lineHeight":"1.3"},"spacing":{"margin":{"top":"0","bottom":"0"}}}} /-->

        <!-- Star rating -->
        <!-- wp:woocommerce/product-rating {"isDescendentOfQueryLoop":true,"style":{"spacing":{"margin":{"top":"0","bottom":"0"}}}} /-->

        <!-- Price -->
        <!-- wp:woocommerce/product-price {"isDescendentOfQueryLoop":true,"style":{"typography":{"fontSize":"var:preset|font-size|large","fontWeight":"800"},"spacing":{"margin":{"top":"0","bottom":"0"}}},"textColor":"foreground"} /-->

        <!-- Add to Cart button -->
        <!-- wp:woocommerce/product-button {"isDescendentOfQueryLoop":true,"width":100,"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} /-->

    </div>
    <!-- /wp:group -->

</article>
<!-- /wp:group -->
