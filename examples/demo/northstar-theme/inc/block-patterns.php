<?php
/**
 * Block pattern categories. Patterns themselves are auto-discovered from /patterns.
 *
 * @package Northstar
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the pattern category used by the landing page sections.
 *
 * @return void
 */
function northstar_register_pattern_categories() {
	register_block_pattern_category(
		'northstar-landing',
		array( 'label' => __( 'Northstar Landing Page', 'northstar' ) )
	);
}
add_action( 'init', 'northstar_register_pattern_categories' );
