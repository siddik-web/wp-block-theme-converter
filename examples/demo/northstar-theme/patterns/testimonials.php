<?php
/**
 * Title: Northstar Testimonials
 * Slug: northstar/testimonials
 * Categories: northstar-landing, testimonials
 * Keywords: testimonials, quotes, social proof
 * Viewport Width: 1400
 * Description: Three customer quotes with avatars.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","className":"northstar-section","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull northstar-section" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:heading {"textAlign":"center","level":2,"className":"northstar-section-heading"} -->
<h2 class="wp-block-heading has-text-align-center northstar-section-heading"><?php esc_html_e( 'Loved by engineering teams', 'northstar' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:group {"className":"northstar-grid northstar-grid-3","layout":{"type":"grid","columnCount":3}} -->
<div class="wp-block-group northstar-grid northstar-grid-3"><!-- wp:group {"tagName":"article","className":"northstar-card northstar-quote"} -->
<article class="wp-block-group northstar-card northstar-quote"><!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p><?php esc_html_e( 'We deleted our wiki. Northstar made the docs part of code review, and they finally stay accurate.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></blockquote>
<!-- /wp:quote -->

<!-- wp:group {"className":"northstar-author","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group northstar-author"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-avatar"} -->
<figure class="wp-block-image size-full northstar-avatar"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/avatar-maya.svg" alt="<?php esc_attr_e( 'Maya Chen', 'northstar' ); ?>"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"textColor":"secondary","fontSize":"small"} -->
<p class="has-secondary-color has-text-color has-small-font-size"><strong><?php esc_html_e( 'Maya Chen', 'northstar' ); ?></strong><br><?php esc_html_e( 'Staff Engineer, Lumen', 'northstar' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"northstar-card northstar-quote"} -->
<article class="wp-block-group northstar-card northstar-quote"><!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p><?php esc_html_e( 'Search alone paid for it. New hires find answers without pinging the team.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></blockquote>
<!-- /wp:quote -->

<!-- wp:group {"className":"northstar-author","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group northstar-author"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-avatar"} -->
<figure class="wp-block-image size-full northstar-avatar"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/avatar-jonas.svg" alt="<?php esc_attr_e( 'Jonas Weber', 'northstar' ); ?>"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"textColor":"secondary","fontSize":"small"} -->
<p class="has-secondary-color has-text-color has-small-font-size"><strong><?php esc_html_e( 'Jonas Weber', 'northstar' ); ?></strong><br><?php esc_html_e( 'CTO, Fieldwork', 'northstar' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"northstar-card northstar-quote"} -->
<article class="wp-block-group northstar-card northstar-quote"><!-- wp:quote -->
<blockquote class="wp-block-quote"><!-- wp:paragraph -->
<p><?php esc_html_e( 'Versioned docs for every release took us from a week of work to zero.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></blockquote>
<!-- /wp:quote -->

<!-- wp:group {"className":"northstar-author","style":{"spacing":{"blockGap":"var:preset|spacing|30"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group northstar-author"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-avatar"} -->
<figure class="wp-block-image size-full northstar-avatar"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/avatar-priya.svg" alt="<?php esc_attr_e( 'Priya Nair', 'northstar' ); ?>"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph {"textColor":"secondary","fontSize":"small"} -->
<p class="has-secondary-color has-text-color has-small-font-size"><strong><?php esc_html_e( 'Priya Nair', 'northstar' ); ?></strong><br><?php esc_html_e( 'Head of DX, Orbit', 'northstar' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></article>
<!-- /wp:group --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->
