<?php
/**
 * Title: FAQ Accordion
 * Slug: {{theme-slug}}/faq
 * Categories: faq, featured
 * Keywords: faq, accordion, questions, answers, help
 * Viewport Width: 1400
 * Block Types: core/post-content
 * Description: Frequently asked questions using native details/summary blocks.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|80","bottom":"var:preset|spacing|80"}}},"backgroundColor":"background","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull has-background-background-color has-background" style="padding-top:var(--wp--preset--spacing--80);padding-bottom:var(--wp--preset--spacing--80)">

    <!-- wp:columns {"isStackedOnMobile":true,"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|70"}}}} -->
    <div class="wp-block-columns">

        <!-- wp:column {"width":"35%"} -->
        <div class="wp-block-column" style="flex-basis:35%">
            <!-- wp:heading {"level":2} -->
            <h2 class="wp-block-heading"><?php esc_html_e( 'Frequently Asked Questions', '{{text-domain}}' ); ?></h2>
            <!-- /wp:heading -->
            <!-- wp:paragraph {"textColor":"muted"} -->
            <p class="has-muted-color has-text-color"><?php esc_html_e( 'Can\'t find the answer you\'re looking for? Reach out to our support team.', '{{text-domain}}' ); ?></p>
            <!-- /wp:paragraph -->
            <!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|40"}}}} -->
            <div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--40)">
                <!-- wp:button {"className":"is-style-outline"} -->
                <div class="wp-block-button is-style-outline">
                    <a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Contact Support', '{{text-domain}}' ); ?></a>
                </div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"65%"} -->
        <div class="wp-block-column" style="flex-basis:65%">

            <!-- wp:details -->
            <details class="wp-block-details">
                <summary><?php esc_html_e( 'How do I get started?', '{{text-domain}}' ); ?></summary>
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'Getting started is easy. Simply create an account, choose your plan, and you\'ll be up and running in minutes. Our onboarding guide will walk you through every step.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </details>
            <!-- /wp:details -->

            <!-- wp:details -->
            <details class="wp-block-details">
                <summary><?php esc_html_e( 'Is there a free trial available?', '{{text-domain}}' ); ?></summary>
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'Yes! We offer a 14-day free trial on all plans. No credit card required. You can upgrade, downgrade, or cancel at any time during or after your trial.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </details>
            <!-- /wp:details -->

            <!-- wp:details -->
            <details class="wp-block-details">
                <summary><?php esc_html_e( 'Can I change my plan later?', '{{text-domain}}' ); ?></summary>
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'Absolutely. You can upgrade or downgrade your plan at any time. When you upgrade, you\'ll be billed the prorated difference immediately. When you downgrade, the change takes effect at the next billing cycle.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </details>
            <!-- /wp:details -->

            <!-- wp:details -->
            <details class="wp-block-details">
                <summary><?php esc_html_e( 'What payment methods do you accept?', '{{text-domain}}' ); ?></summary>
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for annual Enterprise plans.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </details>
            <!-- /wp:details -->

            <!-- wp:details -->
            <details class="wp-block-details">
                <summary><?php esc_html_e( 'How do I cancel my subscription?', '{{text-domain}}' ); ?></summary>
                <!-- wp:paragraph -->
                <p><?php esc_html_e( 'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. We do not offer refunds for partial billing periods.', '{{text-domain}}' ); ?></p>
                <!-- /wp:paragraph -->
            </details>
            <!-- /wp:details -->

        </div>
        <!-- /wp:column -->

    </div>
    <!-- /wp:columns -->

</section>
<!-- /wp:group -->
