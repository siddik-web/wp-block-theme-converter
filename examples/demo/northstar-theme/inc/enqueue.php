<?php
/**
 * Enqueue front-end and editor assets.
 *
 * @package Northstar
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Enqueue the front-end stylesheet.
 *
 * @return void
 */
function northstar_enqueue_styles() {
	$path = get_template_directory() . '/assets/css/style.css';

	wp_enqueue_style(
		'northstar-style',
		get_template_directory_uri() . '/assets/css/style.css',
		array(),
		filemtime( $path )
	);
}
add_action( 'wp_enqueue_scripts', 'northstar_enqueue_styles' );
