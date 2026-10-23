<?php
/**
 * Title: Northstar Hero
 * Slug: northstar/hero
 * Categories: northstar-landing, featured
 * Keywords: hero, banner, headline
 * Viewport Width: 1400
 * Description: Centered hero with badge, headline, lead paragraph, two buttons and a terminal code card.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","anchor":"top","className":"northstar-hero","gradient":"hero-tint","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"820px"}} -->
<section id="top" class="wp-block-group alignfull northstar-hero has-hero-tint-gradient-background has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:paragraph {"className":"northstar-badge","textColor":"accent","backgroundColor":"tint","fontSize":"small"} -->
<p class="northstar-badge has-accent-color has-tint-background-color has-text-color has-background has-small-font-size"><?php esc_html_e( 'New: pull-request previews', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"textAlign":"center","level":1} -->
<h1 class="wp-block-heading has-text-align-center"><?php esc_html_e( 'Documentation that ships with your code.', 'northstar' ); ?></h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"secondary","fontSize":"large"} -->
<p class="has-text-align-center has-secondary-color has-text-color has-large-font-size"><?php esc_html_e( 'Northstar turns your repository into a searchable docs site and keeps it in sync on every merge, so your docs are never a release behind.', 'northstar' ); ?></p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#pricing"><?php esc_html_e( 'Start free trial', 'northstar' ); ?></a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#features"><?php esc_html_e( 'See how it works', 'northstar' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons -->

<!-- wp:code {"className":"northstar-code-card"} -->
<pre class="wp-block-code northstar-code-card"><code><?php echo esc_html( implode( "\n", array( '$ npx northstar init', '✔ Found 42 Markdown files', '✔ Built search index in 1.2s', '✔ Preview ready: https://docs.acme.dev' ) ) ); ?></code></pre>
<!-- /wp:code --></section>
<!-- /wp:group -->
