<?php
/**
 * Title: Call to Action
 * Slug: {{theme-slug}}/cta
 * Categories: cta, featured
 * Keywords: cta, call to action, conversion, signup, newsletter
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Centered call-to-action section with heading, description, and button.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","className":"is-style-cta","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"primary","textColor":"background","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull is-style-cta has-primary-background-color has-background-color has-background has-text-color" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|40"}}} -->
    <div class="wp-block-group">

        <!-- wp:heading {"textAlign":"center","level":2,"textColor":"background"} -->
        <h2 class="wp-block-heading has-text-align-center has-background-color has-text-color"><?php esc_html_e( 'Ready to Get Started?', '{{text-domain}}' ); ?></h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","textColor":"background","style":{"typography":{"fontSize":"var:preset|font-size|large"}}} -->
        <p class="has-text-align-center has-background-color has-text-color" style="font-size:var(--wp--preset--font-size--large)"><?php esc_html_e( 'Join thousands of satisfied customers. Start your free trial today — no credit card required.', '{{text-domain}}' ); ?></p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|20"}}}} -->
        <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--20)">
            <!-- wp:button {"backgroundColor":"background","textColor":"primary"} -->
            <div class="wp-block-button">
                <a class="wp-block-button__link wp-element-button has-background-background-color has-primary-color has-background has-text-color" href="#"><?php esc_html_e( 'Start Free Trial', '{{text-domain}}' ); ?></a>
            </div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->

    </div>
    <!-- /wp:group -->

</section>
<!-- /wp:group -->
