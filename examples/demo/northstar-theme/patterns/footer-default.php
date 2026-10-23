<?php
/**
 * Title: Northstar Footer
 * Slug: northstar/footer-default
 * Categories: northstar-landing
 * Keywords: footer, links, copyright
 * Block Types: core/template-part/footer
 * Inserter: false
 * Description: Site footer with brand note, product and company links, and copyright line.
 */
?>
<!-- wp:group {"align":"full","className":"northstar-footer","backgroundColor":"dark","textColor":"faint","style":{"spacing":{"padding":{"top":"var:preset|spacing|60"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull northstar-footer has-faint-color has-dark-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60)"><!-- wp:columns {"className":"northstar-footer-columns"} -->
<div class="wp-block-columns northstar-footer-columns"><!-- wp:column {"width":"50%"} -->
<div class="wp-block-column" style="flex-basis:50%"><!-- wp:site-title {"level":0,"isLink":false,"fontSize":"large","style":{"typography":{"fontWeight":"800"}},"textColor":"background"} /-->

<!-- wp:paragraph {"textColor":"subtle"} -->
<p class="has-subtle-color has-text-color"><?php esc_html_e( 'Documentation that ships with your code.', 'northstar' ); ?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"25%"} -->
<div class="wp-block-column" style="flex-basis:25%"><!-- wp:heading {"level":3,"textColor":"background","fontSize":"normal"} -->
<h3 class="wp-block-heading has-background-color has-text-color has-normal-font-size"><?php esc_html_e( 'Product', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:navigation {"ariaLabel":"<?php echo esc_attr__( 'Product', 'northstar' ); ?>","overlayMenu":"never","textColor":"subtle","layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Features', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#features' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Pricing', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#pricing' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'FAQ', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#faq' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column -->

<!-- wp:column {"width":"25%"} -->
<div class="wp-block-column" style="flex-basis:25%"><!-- wp:heading {"level":3,"textColor":"background","fontSize":"normal"} -->
<h3 class="wp-block-heading has-background-color has-text-color has-normal-font-size"><?php esc_html_e( 'Company', 'northstar' ); ?></h3>
<!-- /wp:heading -->

<!-- wp:navigation {"ariaLabel":"<?php echo esc_attr__( 'Company', 'northstar' ); ?>","overlayMenu":"never","textColor":"subtle","layout":{"type":"flex","orientation":"vertical"},"style":{"spacing":{"blockGap":"var:preset|spacing|20"}}} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'About', 'northstar' ); ?>","url":"#","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Careers', 'northstar' ); ?>","url":"#","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Contact', 'northstar' ); ?>","url":"#","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation --></div>
<!-- /wp:column --></div>
<!-- /wp:columns -->

<!-- wp:group {"className":"northstar-copyright","style":{"spacing":{"padding":{"top":"var:preset|spacing|40","bottom":"var:preset|spacing|40"}}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group northstar-copyright" style="padding-top:var(--wp--preset--spacing--40);padding-bottom:var(--wp--preset--spacing--40)"><!-- wp:paragraph {"textColor":"subtle","fontSize":"small"} -->
<p class="has-subtle-color has-text-color has-small-font-size"><?php
	printf(
		/* translators: %s: current year. */
		esc_html__( '© %s Northstar, Inc. All rights reserved.', 'northstar' ),
		esc_html( gmdate( 'Y' ) )
	);
?></p>
<!-- /wp:paragraph --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
