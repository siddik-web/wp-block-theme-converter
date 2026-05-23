<?php
/**
 * Title: Stats Row
 * Slug: {{theme-slug}}/stats-row
 * Categories: featured
 * Keywords: stats, numbers, metrics, achievements, social proof
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Horizontal row of key statistics or metrics.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|70","bottom":"var:preset|spacing|70"}}},"backgroundColor":"foreground","textColor":"background","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull has-foreground-background-color has-background-color has-background has-text-color" style="padding-top:var(--wp--preset--spacing--70);padding-bottom:var(--wp--preset--spacing--70)">

    <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"1px"}}}} -->
    <div class="wp-block-columns">

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|10"}}} -->
            <div class="wp-block-group">
                <!-- wp:heading {"textAlign":"center","level":2,"textColor":"background","style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"800","lineHeight":"1"}}} -->
                <h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:clamp(2.5rem,5vw,4rem);font-weight:800;line-height:1">10K+</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center","textColor":"background","style":{"typography":{"fontSize":"var:preset|font-size|small"}}} -->
                <p class="has-text-align-center has-background-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'Happy Customers', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|10"}}} -->
            <div class="wp-block-group">
                <!-- wp:heading {"textAlign":"center","level":2,"textColor":"background","style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"800","lineHeight":"1"}}} -->
                <h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:clamp(2.5rem,5vw,4rem);font-weight:800;line-height:1">99.9%</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center","textColor":"background","style":{"typography":{"fontSize":"var:preset|font-size|small"}}} -->
                <p class="has-text-align-center has-background-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'Uptime SLA', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|10"}}} -->
            <div class="wp-block-group">
                <!-- wp:heading {"textAlign":"center","level":2,"textColor":"background","style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"800","lineHeight":"1"}}} -->
                <h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:clamp(2.5rem,5vw,4rem);font-weight:800;line-height:1">48h</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center","textColor":"background","style":{"typography":{"fontSize":"var:preset|font-size|small"}}} -->
                <p class="has-text-align-center has-background-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'Avg. Support Response', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|10"}}} -->
            <div class="wp-block-group">
                <!-- wp:heading {"textAlign":"center","level":2,"textColor":"background","style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"800","lineHeight":"1"}}} -->
                <h2 class="wp-block-heading has-text-align-center has-background-color has-text-color" style="font-size:clamp(2.5rem,5vw,4rem);font-weight:800;line-height:1">4.9★</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"align":"center","textColor":"background","style":{"typography":{"fontSize":"var:preset|font-size|small"}}} -->
                <p class="has-text-align-center has-background-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'Average Rating', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</section>
<!-- /wp:group -->
