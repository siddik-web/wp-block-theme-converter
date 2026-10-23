<?php
/**
 * Title: Northstar Pricing
 * Slug: northstar/pricing
 * Categories: northstar-landing, featured
 * Keywords: pricing, plans, tiers
 * Viewport Width: 1400
 * Description: Three pricing plans with the middle plan highlighted.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","anchor":"pricing","className":"northstar-section","backgroundColor":"surface","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<section id="pricing" class="wp-block-group alignfull northstar-section has-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:heading {"textAlign":"center","level":2} -->
<h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Simple, predictable pricing', 'northstar' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","className":"northstar-section-lead","textColor":"secondary","fontSize":"medium"} -->
<p class="has-text-align-center northstar-section-lead has-secondary-color has-text-color has-medium-font-size"><?php esc_html_e( 'Start free. Upgrade when your team grows.', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"northstar-grid northstar-grid-3","layout":{"type":"grid","columnCount":3}} -->
<div class="wp-block-group northstar-grid northstar-grid-3"><!-- wp:group {"tagName":"article","className":"northstar-card northstar-plan","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<article class="wp-block-group northstar-card northstar-plan"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Starter', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"northstar-price","fontSize":"xx-large","style":{"typography":{"fontWeight":"800"}}} -->
<p class="northstar-price has-xx-large-font-size" style="font-weight:800"><?php esc_html_e( '$0', 'northstar' ); ?><span class="northstar-price-unit"><?php esc_html_e( '/month', 'northstar' ); ?></span></p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"northstar-plan-list","textColor":"secondary"} -->
<ul class="wp-block-list northstar-plan-list has-secondary-color has-text-color"><!-- wp:list-item -->
<li><?php esc_html_e( '1 project', 'northstar' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Community support', 'northstar' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Public docs', 'northstar' ); ?></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Start free', 'northstar' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"northstar-card northstar-plan northstar-plan-featured","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<article class="wp-block-group northstar-card northstar-plan northstar-plan-featured"><!-- wp:paragraph {"className":"northstar-badge","textColor":"accent","backgroundColor":"tint","fontSize":"small"} -->
<p class="northstar-badge has-accent-color has-tint-background-color has-text-color has-background has-small-font-size"><?php esc_html_e( 'Most popular', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Team', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"northstar-price","fontSize":"xx-large","style":{"typography":{"fontWeight":"800"}}} -->
<p class="northstar-price has-xx-large-font-size" style="font-weight:800"><?php esc_html_e( '$29', 'northstar' ); ?><span class="northstar-price-unit"><?php esc_html_e( '/month', 'northstar' ); ?></span></p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"northstar-plan-list","textColor":"secondary"} -->
<ul class="wp-block-list northstar-plan-list has-secondary-color has-text-color"><!-- wp:list-item -->
<li><?php esc_html_e( 'Unlimited projects', 'northstar' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Pull-request previews', 'northstar' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Private docs and SSO', 'northstar' ); ?></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Start 14-day trial', 'northstar' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"northstar-card northstar-plan","layout":{"type":"flex","orientation":"vertical","justifyContent":"stretch"}} -->
<article class="wp-block-group northstar-card northstar-plan"><!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Enterprise', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph {"className":"northstar-price","fontSize":"xx-large","style":{"typography":{"fontWeight":"800"}}} -->
<p class="northstar-price has-xx-large-font-size" style="font-weight:800"><?php esc_html_e( 'Custom', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:list {"className":"northstar-plan-list","textColor":"secondary"} -->
<ul class="wp-block-list northstar-plan-list has-secondary-color has-text-color"><!-- wp:list-item -->
<li><?php esc_html_e( 'Audit logs', 'northstar' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( 'Dedicated support', 'northstar' ); ?></li>
<!-- /wp:list-item -->

<!-- wp:list-item -->
<li><?php esc_html_e( '99.99% uptime SLA', 'northstar' ); ?></li>
<!-- /wp:list-item --></ul>
<!-- /wp:list -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#"><?php esc_html_e( 'Talk to sales', 'northstar' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></article>
<!-- /wp:group --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->
