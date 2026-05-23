<?php
/**
 * Title: Testimonials
 * Slug: {{theme-slug}}/testimonials
 * Categories: testimonials, featured
 * Keywords: testimonials, reviews, quotes, social proof
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Three testimonials in a responsive grid layout.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:heading {"textAlign":"center","level":2,"style":{"spacing":{"margin":{"bottom":"var:preset|spacing|60"}}}} -->
    <h2 class="wp-block-heading has-text-align-center" style="margin-bottom:var(--wp--preset--spacing--60)"><?php esc_html_e( 'What Our Customers Say', '{{text-domain}}' ); ?></h2>
    <!-- /wp:heading -->

    <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|50"}}}} -->
    <div class="wp-block-columns">

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"testimonial-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"surface"} -->
            <div class="wp-block-group testimonial-card has-surface-background-color has-background" style="border-radius:8px;padding:var(--wp--preset--spacing--50)">
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.25rem"}}} -->
                <p style="font-size:1.25rem">&#8220;</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph -->
                <p><?php esc_html_e( '"This product completely transformed the way we work. I can\'t imagine going back to how things were before."', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
                <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)">
                    <!-- wp:image {"width":48,"height":48,"scale":"cover","style":{"border":{"radius":"50%"}}} -->
                    <figure class="wp-block-image" style="border-radius:50%"><img src="" alt="<?php esc_attr_e( 'Alex Johnson avatar', '{{text-domain}}' ); ?>" width="48" height="48" style="object-fit:cover"/></figure>
                    <!-- /wp:image -->
                    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"rowGap":"0"}}} -->
                    <div class="wp-block-group">
                        <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}}} -->
                        <p style="font-weight:700"><?php esc_html_e( 'Alex Johnson', '{{text-domain}}' ); ?></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|small"}},"textColor":"muted"} -->
                        <p class="has-muted-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'CEO, Acme Corp', '{{text-domain}}' ); ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"testimonial-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"surface"} -->
            <div class="wp-block-group testimonial-card has-surface-background-color has-background" style="border-radius:8px;padding:var(--wp--preset--spacing--50)">
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.25rem"}}} -->
                <p style="font-size:1.25rem">&#8220;</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph -->
                <p><?php esc_html_e( '"The support team is incredibly responsive. Every question was answered promptly and the setup process was seamless."', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
                <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)">
                    <!-- wp:image {"width":48,"height":48,"scale":"cover","style":{"border":{"radius":"50%"}}} -->
                    <figure class="wp-block-image" style="border-radius:50%"><img src="" alt="<?php esc_attr_e( 'Maria Santos avatar', '{{text-domain}}' ); ?>" width="48" height="48" style="object-fit:cover"/></figure>
                    <!-- /wp:image -->
                    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"rowGap":"0"}}} -->
                    <div class="wp-block-group">
                        <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}}} -->
                        <p style="font-weight:700"><?php esc_html_e( 'Maria Santos', '{{text-domain}}' ); ?></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|small"}},"textColor":"muted"} -->
                        <p class="has-muted-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'Product Manager, StartupXYZ', '{{text-domain}}' ); ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"testimonial-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|50","right":"var:preset|spacing|50","bottom":"var:preset|spacing|50","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"surface"} -->
            <div class="wp-block-group testimonial-card has-surface-background-color has-background" style="border-radius:8px;padding:var(--wp--preset--spacing--50)">
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"1.25rem"}}} -->
                <p style="font-size:1.25rem">&#8220;</p>
                <!-- /wp:paragraph -->
                <!-- wp:paragraph -->
                <p><?php esc_html_e( '"We saw results within the first week. The ROI has been exceptional and our team adoption was immediate."', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
                <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--40)">
                    <!-- wp:image {"width":48,"height":48,"scale":"cover","style":{"border":{"radius":"50%"}}} -->
                    <figure class="wp-block-image" style="border-radius:50%"><img src="" alt="<?php esc_attr_e( 'James Kim avatar', '{{text-domain}}' ); ?>" width="48" height="48" style="object-fit:cover"/></figure>
                    <!-- /wp:image -->
                    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"rowGap":"0"}}} -->
                    <div class="wp-block-group">
                        <!-- wp:paragraph {"style":{"typography":{"fontWeight":"700"}}} -->
                        <p style="font-weight:700"><?php esc_html_e( 'James Kim', '{{text-domain}}' ); ?></p>
                        <!-- /wp:paragraph -->
                        <!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|small"}},"textColor":"muted"} -->
                        <p class="has-muted-color has-text-color" style="font-size:var(--wp--preset--font-size--small)"><?php esc_html_e( 'Director, Enterprise Inc', '{{text-domain}}' ); ?></p>
                        <!-- /wp:paragraph -->
                    </div>
                    <!-- /wp:group -->
                </div>
                <!-- /wp:group -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</section>
<!-- /wp:group -->
