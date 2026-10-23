<?php
/**
 * Theme setup: supports, text domain and core behaviour tweaks.
 *
 * @package Northstar
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register theme supports and load the text domain.
 *
 * @return void
 */
function northstar_setup() {
	load_theme_textdomain( 'northstar', get_template_directory() . '/languages' );

	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'assets/css/editor.css' );

	/*
	 * The header pattern ships its own skip link, so drop the one core
	 * prints in the footer to avoid two identical links on the page.
	 */
	remove_action( 'wp_footer', 'the_block_template_skip_link' );
}
add_action( 'after_setup_theme', 'northstar_setup' );
