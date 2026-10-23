<?php
/**
 * Title: Northstar FAQ
 * Slug: northstar/faq
 * Categories: northstar-landing
 * Keywords: faq, questions, accordion
 * Description: Frequently asked questions as native expandable details blocks.
 */
?>
<!-- wp:group {"tagName":"section","align":"full","anchor":"faq","className":"northstar-section","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"layout":{"type":"constrained","contentSize":"720px"}} -->
<section id="faq" class="wp-block-group alignfull northstar-section" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)"><!-- wp:heading {"textAlign":"center","level":2,"className":"northstar-section-heading"} -->
<h2 class="wp-block-heading has-text-align-center northstar-section-heading"><?php esc_html_e( 'Frequently asked questions', 'northstar' ); ?></h2>
<!-- /wp:heading -->

<!-- wp:details -->
<details class="wp-block-details"><summary><?php esc_html_e( 'Which Markdown formats do you support?', 'northstar' ); ?></summary><!-- wp:paragraph -->
<p><?php esc_html_e( 'CommonMark, GitHub-flavored Markdown, and MDX. Front matter is optional.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->

<!-- wp:details -->
<details class="wp-block-details"><summary><?php esc_html_e( 'Can I host the docs on my own domain?', 'northstar' ); ?></summary><!-- wp:paragraph -->
<p><?php esc_html_e( 'Yes. Point a CNAME at Northstar and we provision the certificate automatically.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->

<!-- wp:details -->
<details class="wp-block-details"><summary><?php esc_html_e( 'Is there a free plan?', 'northstar' ); ?></summary><!-- wp:paragraph -->
<p><?php esc_html_e( 'The Starter plan is free forever for one project with public docs.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></details>
<!-- /wp:details -->

<!-- wp:details -->
<details class="wp-block-details"><summary><?php esc_html_e( 'How do pull-request previews work?', 'northstar' ); ?></summary><!-- wp:paragraph -->
<p><?php esc_html_e( 'Every pull request gets its own preview URL, posted as a comment on the PR.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></details>
<!-- /wp:details --></section>
<!-- /wp:group -->
