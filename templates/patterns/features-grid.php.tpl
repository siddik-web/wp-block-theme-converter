<?php
/**
 * Title: Features Grid
 * Slug: {{theme-slug}}/features-grid
 * Categories: featured, services
 * Keywords: features, grid, cards, benefits, services
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Three-column features grid with icon, heading, and description per feature.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"surface","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|20"}}} -->
    <div class="wp-block-group">
        <!-- wp:heading {"textAlign":"center","level":2} -->
        <h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Why Choose Us', '{{text-domain}}' ); ?></h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center"><?php esc_html_e( 'Everything you need to get started, with nothing to slow you down.', '{{text-domain}}' ); ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"margin":{"top":"var:preset|spacing|60"},"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns is-not-stacked-on-mobile">

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"feature-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
            <div class="wp-block-group feature-card has-background-background-color has-background" style="border-radius:8px;padding:var(--wp--preset--spacing--50)">
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"2.5rem"}}} -->
                <p style="font-size:2.5rem">✦</p>
                <!-- /wp:paragraph -->
                <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
                <h3 class="wp-block-heading" style="margin-top:var(--wp--preset--spacing--30)"><?php esc_html_e( 'Feature One', '{{text-domain}}' ); ?></h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'A short description of this feature and the benefit it provides to your users.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"feature-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
            <div class="wp-block-group feature-card has-background-background-color has-background" style="border-radius:8px;padding:var(--wp--preset--spacing--50)">
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"2.5rem"}}} -->
                <p style="font-size:2.5rem">◈</p>
                <!-- /wp:paragraph -->
                <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
                <h3 class="wp-block-heading" style="margin-top:var(--wp--preset--spacing--30)"><?php esc_html_e( 'Feature Two', '{{text-domain}}' ); ?></h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'A short description of this feature and the benefit it provides to your users.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"feature-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
            <div class="wp-block-group feature-card has-background-background-color has-background" style="border-radius:8px;padding:var(--wp--preset--spacing--50)">
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"2.5rem"}}} -->
                <p style="font-size:2.5rem">❋</p>
                <!-- /wp:paragraph -->
                <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
                <h3 class="wp-block-heading" style="margin-top:var(--wp--preset--spacing--30)"><?php esc_html_e( 'Feature Three', '{{text-domain}}' ); ?></h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'A short description of this feature and the benefit it provides to your users.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</section>
<!-- /wp:group -->
