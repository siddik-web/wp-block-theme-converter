<?php
/**
 * Title: Hero with CTA
 * Slug: {{theme-slug}}/hero
 * Categories: hero, featured
 * Keywords: hero, banner, cta, headline, landing
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Full-width hero section with headline, subtext, and call-to-action buttons.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","className":"is-style-hero","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"foreground","textColor":"background","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull is-style-hero has-foreground-background-color has-background-color has-background has-text-color" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:group {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"},"style":{"spacing":{"rowGap":"var:preset|spacing|40"}}} -->
    <div class="wp-block-group">

        <!-- wp:heading {"textAlign":"center","level":1,"style":{"typography":{"fontSize":"clamp(2.5rem, 5vw, 4rem)","fontWeight":"800","lineHeight":"1.1"}}} -->
        <h1 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Your Compelling Headline Here', '{{text-domain}}' ); ?></h1>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"align":"center","style":{"typography":{"fontSize":"var:preset|font-size|large"},"spacing":{"margin":{"top":"0"}}}} -->
        <p class="has-text-align-center"><?php esc_html_e( 'A concise subheading that supports the headline and drives the visitor toward your primary call to action.', '{{text-domain}}' ); ?></p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"},"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
        <div class="wp-block-buttons">
            <!-- wp:button {"className":"is-style-fill"} -->
            <div class="wp-block-button is-style-fill">
                <a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Get Started', '{{text-domain}}' ); ?></a>
            </div>
            <!-- /wp:button -->

            <!-- wp:button {"className":"is-style-outline"} -->
            <div class="wp-block-button is-style-outline">
                <a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Learn More', '{{text-domain}}' ); ?></a>
            </div>
            <!-- /wp:button -->
        </div>
        <!-- /wp:buttons -->

    </div>
    <!-- /wp:group -->

</section>
<!-- /wp:group -->
