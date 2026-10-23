<?php
/**
 * Title: Northstar Features
 * Slug: northstar/features
 * Categories: northstar-landing, featured
 * Keywords: features, cards, grid
 * Viewport Width: 1400
 * Description: Three-card feature grid with icons.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","anchor":"features","className":"northstar-section","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<section id="features" class="wp-block-group alignfull northstar-section" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:heading {"textAlign":"center","level":2} -->
<h2 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Everything you need to keep docs honest', 'northstar' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","className":"northstar-section-lead","textColor":"secondary","fontSize":"medium"} -->
<p class="has-text-align-center northstar-section-lead has-secondary-color has-text-color has-medium-font-size"><?php esc_html_e( 'Three ideas, done well.', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:group {"className":"northstar-grid northstar-grid-3","layout":{"type":"grid","columnCount":3}} -->
<div class="wp-block-group northstar-grid northstar-grid-3"><!-- wp:group {"tagName":"article","className":"northstar-card"} -->
<article class="wp-block-group northstar-card"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-icon"} -->
<figure class="wp-block-image size-full northstar-icon"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/icon-sync.svg" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Always in sync', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'Docs build from the same commit as your code. Merge a change and the site updates in under a minute.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"northstar-card"} -->
<article class="wp-block-group northstar-card"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-icon"} -->
<figure class="wp-block-image size-full northstar-icon"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/icon-search.svg" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Instant search', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'Full-text search that understands your API names, with keyboard shortcuts and typo tolerance.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></article>
<!-- /wp:group -->

<!-- wp:group {"tagName":"article","className":"northstar-card"} -->
<article class="wp-block-group northstar-card"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-icon"} -->
<figure class="wp-block-image size-full northstar-icon"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/icon-shield.svg" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":3} -->
<h3 class="wp-block-heading"><?php esc_html_e( 'Versioned and safe', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><?php esc_html_e( 'Every release gets its own docs. Roll back with one click and keep old versions available.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></article>
<!-- /wp:group --></div>
<!-- /wp:group --></section>
<!-- /wp:group -->
