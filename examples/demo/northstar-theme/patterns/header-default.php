<?php
/**
 * Title: Northstar Header
 * Slug: northstar/header-default
 * Categories: northstar-landing
 * Keywords: header, navigation, logo
 * Block Types: core/template-part/header
 * Inserter: false
 * Description: Site header with logo, primary navigation and a call-to-action button.
 */
?>
<!-- wp:html -->
<a class="skip-link screen-reader-text" href="#main"><?php esc_html_e( 'Skip to content', 'northstar' ); ?></a>
<!-- /wp:html -->

<!-- wp:group {"align":"full","className":"northstar-header","backgroundColor":"background","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull northstar-header has-background-background-color has-background"><!-- wp:group {"style":{"spacing":{"padding":{"top":"var:preset|spacing|30","bottom":"var:preset|spacing|30"}}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
<div class="wp-block-group" style="padding-top:var(--wp--preset--spacing--30);padding-bottom:var(--wp--preset--spacing--30)"><!-- wp:group {"style":{"spacing":{"blockGap":"0.6rem"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:image {"sizeSlug":"full","linkDestination":"none","className":"northstar-logo"} -->
<figure class="wp-block-image size-full northstar-logo"><img src="<?php echo esc_url( get_template_directory_uri() ); ?>/assets/images/logo.svg" alt=""/></figure>
<!-- /wp:image -->

<!-- wp:site-title {"level":0,"fontSize":"large","style":{"typography":{"fontWeight":"800"},"elements":{"link":{"color":{"text":"var:preset|color|text"}}}},"textColor":"text"} /--></div>
<!-- /wp:group -->

<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|40"}},"layout":{"type":"flex","flexWrap":"nowrap"}} -->
<div class="wp-block-group"><!-- wp:navigation {"ariaLabel":"<?php echo esc_attr__( 'Primary', 'northstar' ); ?>","overlayMenu":"mobile","textColor":"secondary","layout":{"type":"flex","setCascadingProperties":true,"justifyContent":"right"},"style":{"spacing":{"blockGap":"var:preset|spacing|40"}}} -->
<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Features', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#features' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Pricing', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#pricing' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'FAQ', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#faq' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->

<!-- wp:navigation-link {"label":"<?php echo esc_html__( 'Docs', 'northstar' ); ?>","url":"<?php echo esc_url( home_url( '/#docs' ) ); ?>","kind":"custom","isTopLevelLink":true} /-->
<!-- /wp:navigation -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><!-- wp:button {"className":"northstar-btn-small"} -->
<div class="wp-block-button northstar-btn-small"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/#pricing' ) ); ?>"><?php esc_html_e( 'Get started', 'northstar' ); ?></a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
