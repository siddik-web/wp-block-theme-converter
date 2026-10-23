<?php
/**
 * Block style variations. The matching CSS lives in assets/css/style.css and editor.css.
 *
 * @package Northstar
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the light button style used on the call-to-action band.
 *
 * @return void
 */
function northstar_register_block_styles() {
	register_block_style(
		'core/button',
		array(
			'name'  => 'light',
			'label' => __( 'Light', 'northstar' ),
		)
	);
}
add_action( 'init', 'northstar_register_block_styles' );
