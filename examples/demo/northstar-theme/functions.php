<?php
/**
 * Northstar functions and definitions.
 *
 * @package Northstar
 * @since 1.0.0
 */

defined( 'ABSPATH' ) || exit;

// Theme constants.
define( 'NORTHSTAR_VERSION', wp_get_theme()->get( 'Version' ) );
define( 'NORTHSTAR_DIR', get_template_directory() );
define( 'NORTHSTAR_URI', get_template_directory_uri() );

// Bootstrap.
require_once NORTHSTAR_DIR . '/inc/theme-setup.php';
require_once NORTHSTAR_DIR . '/inc/enqueue.php';
require_once NORTHSTAR_DIR . '/inc/block-patterns.php';
require_once NORTHSTAR_DIR . '/inc/block-styles.php';
