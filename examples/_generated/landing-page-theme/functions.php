<?php
/**
 * Landing Page Theme functions and definitions.
 *
 * @package LandingPageTheme
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register the pattern categories used by patterns/ that core doesn't provide.
 */
function landing_page_theme_register_pattern_categories() {
	register_block_pattern_category( 'hero', array( 'label' => __( 'Hero', 'landing-page-theme' ) ) );
	register_block_pattern_category( 'services', array( 'label' => __( 'Services', 'landing-page-theme' ) ) );
	register_block_pattern_category( 'cta', array( 'label' => __( 'Call to Action', 'landing-page-theme' ) ) );
}
add_action( 'init', 'landing_page_theme_register_pattern_categories' );
