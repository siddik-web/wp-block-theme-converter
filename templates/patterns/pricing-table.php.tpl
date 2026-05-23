<?php
/**
 * Title: Pricing Table
 * Slug: {{theme-slug}}/pricing-table
 * Categories: pricing, featured
 * Keywords: pricing, plans, subscription, tiers
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Three-tier pricing table with highlighted featured plan.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"surface","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|20","margin":{"bottom":"var:preset|spacing|60"}}}} -->
    <div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--60)">
        <!-- wp:heading {"textAlign":"center","level":2} -->
        <h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Simple, Transparent Pricing', '{{text-domain}}' ); ?></h2>
        <!-- /wp:heading -->
        <!-- wp:paragraph {"align":"center"} -->
        <p class="has-text-align-center"><?php esc_html_e( 'Choose the plan that works for your team. Upgrade or cancel at any time.', '{{text-domain}}' ); ?></p>
        <!-- /wp:paragraph -->
    </div>
    <!-- /wp:group -->

    <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"top":"var:preset|spacing|50","left":"var:preset|spacing|40"}}}} -->
    <div class="wp-block-columns">

        <!-- STARTER PLAN -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"pricing-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|50","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
            <div class="wp-block-group pricing-card has-background-background-color has-background" style="border-radius:8px;padding-block:var(--wp--preset--spacing--60);padding-inline:var(--wp--preset--spacing--50)">
                <!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"var:preset|font-size|medium","fontWeight":"600"}}} -->
                <h3 class="wp-block-heading"><?php esc_html_e( 'Starter', '{{text-domain}}' ); ?></h3>
                <!-- /wp:heading -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"baseline"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"},"blockGap":"4px"}}} -->
                <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--30)">
                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"3rem","fontWeight":"800","lineHeight":"1"}}} -->
                    <p style="font-size:3rem;font-weight:800;line-height:1">$9</p>
                    <!-- /wp:paragraph -->
                    <!-- wp:paragraph {"textColor":"muted"} -->
                    <p class="has-muted-color has-text-color">/<?php esc_html_e( 'mo', '{{text-domain}}' ); ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:separator {"className":"is-style-wide","backgroundColor":"border","style":{"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}} -->
                <hr class="wp-block-separator is-style-wide has-border-background-color has-background" style="margin-top:var(--wp--preset--spacing--40);margin-bottom:var(--wp--preset--spacing--40)"/>
                <!-- /wp:separator -->
                <!-- wp:list {"style":{"spacing":{"padding":{"left":"0"}}},"className":"pricing-features"} -->
                <ul class="wp-block-list pricing-features" style="padding-inline-start:0">
                    <!-- wp:list-item --><li><?php esc_html_e( '5 projects', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( '10 GB storage', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Basic analytics', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Email support', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                </ul>
                <!-- /wp:list -->
                <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
                <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
                    <!-- wp:button {"width":100,"className":"is-style-outline"} -->
                    <div class="wp-block-button is-style-outline has-custom-width wp-block-button__width-100">
                        <a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Get Started', '{{text-domain}}' ); ?></a>
                    </div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- PRO PLAN (featured) -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"pricing-card pricing-card--featured","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|50","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"primary","textColor":"background"} -->
            <div class="wp-block-group pricing-card pricing-card--featured has-primary-background-color has-background-color has-background has-text-color" style="border-radius:8px;padding-block:var(--wp--preset--spacing--60);padding-inline:var(--wp--preset--spacing--50)">
                <!-- wp:group {"layout":{"type":"flex","justifyContent":"space-between","flexWrap":"nowrap"}} -->
                <div class="wp-block-group">
                    <!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"var:preset|font-size|medium","fontWeight":"600"}},"textColor":"background"} -->
                    <h3 class="wp-block-heading has-background-color has-text-color"><?php esc_html_e( 'Pro', '{{text-domain}}' ); ?></h3>
                    <!-- /wp:heading -->
                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"var:preset|font-size|small","fontWeight":"600"},"spacing":{"padding":{"top":"2px","right":"var:preset|spacing|30","bottom":"2px","left":"var:preset|spacing|30"}}},"backgroundColor":"background","textColor":"primary","className":"pricing-badge"} -->
                    <p class="has-background-background-color has-primary-color has-background has-text-color pricing-badge" style="font-size:var(--wp--preset--font-size--small);font-weight:600;padding:2px var(--wp--preset--spacing--30)"><?php esc_html_e( 'Popular', '{{text-domain}}' ); ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:group {"layout":{"type":"flex","flexWrap":"nowrap","verticalAlignment":"baseline"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|30"},"blockGap":"4px"}}} -->
                <div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--30)">
                    <!-- wp:paragraph {"style":{"typography":{"fontSize":"3rem","fontWeight":"800","lineHeight":"1"}},"textColor":"background"} -->
                    <p class="has-background-color has-text-color" style="font-size:3rem;font-weight:800;line-height:1">$29</p>
                    <!-- /wp:paragraph -->
                    <!-- wp:paragraph {"textColor":"background","style":{"typography":{"fontSize":"var:preset|font-size|small"}}} -->
                    <p class="has-background-color has-text-color" style="font-size:var(--wp--preset--font-size--small)">/<?php esc_html_e( 'mo', '{{text-domain}}' ); ?></p>
                    <!-- /wp:paragraph -->
                </div>
                <!-- /wp:group -->
                <!-- wp:separator {"className":"is-style-wide pricing-featured-divider","style":{"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}} -->
                <hr class="wp-block-separator is-style-wide pricing-featured-divider" style="margin-block:var(--wp--preset--spacing--40);opacity:0.25"/>
                <!-- /wp:separator -->
                <!-- wp:list {"style":{"spacing":{"padding":{"left":"0"}}},"className":"pricing-features","textColor":"background"} -->
                <ul class="wp-block-list pricing-features has-background-color has-text-color" style="padding-inline-start:0">
                    <!-- wp:list-item --><li><?php esc_html_e( 'Unlimited projects', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( '100 GB storage', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Advanced analytics', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Priority support', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Team collaboration', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                </ul>
                <!-- /wp:list -->
                <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
                <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
                    <!-- wp:button {"width":100,"className":"is-style-fill","backgroundColor":"background","textColor":"primary"} -->
                    <div class="wp-block-button is-style-fill has-custom-width wp-block-button__width-100">
                        <a class="wp-block-button__link wp-element-button has-background-background-color has-primary-color has-background has-text-color" href="#"><?php esc_html_e( 'Get Started', '{{text-domain}}' ); ?></a>
                    </div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- ENTERPRISE PLAN -->
        <!-- wp:column -->
        <div class="wp-block-column">
            <!-- wp:group {"className":"pricing-card","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","right":"var:preset|spacing|50","bottom":"var:preset|spacing|60","left":"var:preset|spacing|50"}},"border":{"radius":"8px"}},"backgroundColor":"background"} -->
            <div class="wp-block-group pricing-card has-background-background-color has-background" style="border-radius:8px;padding-block:var(--wp--preset--spacing--60);padding-inline:var(--wp--preset--spacing--50)">
                <!-- wp:heading {"level":3,"style":{"typography":{"fontSize":"var:preset|font-size|medium","fontWeight":"600"}}} -->
                <h3 class="wp-block-heading"><?php esc_html_e( 'Enterprise', '{{text-domain}}' ); ?></h3>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"style":{"typography":{"fontSize":"3rem","fontWeight":"800","lineHeight":"1"},"spacing":{"margin":{"top":"var:preset|spacing|30"}}}} -->
                <p style="font-size:3rem;font-weight:800;line-height:1;margin-top:var(--wp--preset--spacing--30)"><?php esc_html_e( 'Custom', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
                <!-- wp:separator {"className":"is-style-wide","backgroundColor":"border","style":{"spacing":{"margin":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}}} -->
                <hr class="wp-block-separator is-style-wide has-border-background-color has-background" style="margin-top:var(--wp--preset--spacing--40);margin-bottom:var(--wp--preset--spacing--40)"/>
                <!-- /wp:separator -->
                <!-- wp:list {"style":{"spacing":{"padding":{"left":"0"}}},"className":"pricing-features"} -->
                <ul class="wp-block-list pricing-features" style="padding-inline-start:0">
                    <!-- wp:list-item --><li><?php esc_html_e( 'Unlimited everything', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Custom storage', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Custom analytics', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'Dedicated support', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                    <!-- wp:list-item --><li><?php esc_html_e( 'SLA guarantee', '{{text-domain}}' ); ?></li><!-- /wp:list-item -->
                </ul>
                <!-- /wp:list -->
                <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|50"}}}} -->
                <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--50)">
                    <!-- wp:button {"width":100,"className":"is-style-outline"} -->
                    <div class="wp-block-button is-style-outline has-custom-width wp-block-button__width-100">
                        <a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Contact Sales', '{{text-domain}}' ); ?></a>
                    </div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</section>
<!-- /wp:group -->
