<?php
/**
 * {{THEME_NAME}} functions and definitions.
 *
 * @package {{THEME_NAME_PASCAL}}
 * @since {{VERSION}}
 */

defined( 'ABSPATH' ) || exit;

/**
 * Theme constants.
 */
define( '{{THEME_SLUG_UPPER}}_VERSION', wp_get_theme()->get( 'Version' ) );
define( '{{THEME_SLUG_UPPER}}_DIR', get_template_directory() );
define( '{{THEME_SLUG_UPPER}}_URI', get_template_directory_uri() );

/**
 * Bootstrap theme files.
 */
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/theme-setup.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/enqueue.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-patterns.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-styles.php';
require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-variations.php';

/**
 * Optional: Load Block Bindings API sources.
 * Uncomment if your theme uses the Block Bindings API for dynamic data.
 * See: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/
 */
// require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/block-bindings.php';

/**
 * Optional: Load WooCommerce integration if active.
 */
if ( class_exists( 'WooCommerce' ) ) {
    require_once {{THEME_SLUG_UPPER}}_DIR . '/inc/woocommerce.php';
}
