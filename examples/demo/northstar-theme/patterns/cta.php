<?php
/**
 * Title: Northstar Call to Action
 * Slug: northstar/cta
 * Categories: northstar-landing, call-to-action
 * Keywords: cta, call to action, banner
 * Description: Full-width brand-colored band with a closing call to action.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","anchor":"docs","className":"northstar-cta","backgroundColor":"primary","textColor":"background","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<section id="docs" class="wp-block-group alignfull northstar-cta has-background-color has-primary-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:heading {"textAlign":"center","level":2} -->
<h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Ready to ship docs that never go stale?', 'northstar' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","fontSize":"medium"} -->
<p class="has-text-align-center has-medium-font-size"><?php esc_html_e( 'Set up takes about five minutes. No credit card required.', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"className":"is-style-light"} -->
<div class="wp-block-button is-style-light"><a class="wp-block-button__link wp-element-button" href="#pricing"><?php esc_html_e( 'Start free trial', 'northstar' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></section>
<!-- /wp:group -->
