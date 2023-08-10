<?php

/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://solpress.dev
 * @since             1.0.0
 * @package           Solpress
 *
 * @wordpress-plugin
 * Plugin Name:       SolPress Payment Gateway
 * Plugin URI:        https://solpress.dev
 * Description:       A payment gateway using Solana Pay for your WooCommerce store.
 * Version:           2.0.27
 * Author:            Solpress
 * Author URI:        https://profiles.wordpress.org/solpressplugins/
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       solpress
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Currently plugin version.
 * Start at version 1.0.0 and use SemVer - https://semver.org
 * Rename this for your plugin and update it as you release new versions.
 */
define( 'SOLPRESS_VERSION', '2.0.27' );
define( 'SOLPRESS_ROOT', plugin_dir_path( __FILE__ ) );
define( 'SOLPRESS_ASSETS', SOLPRESS_ROOT . '/assets/' );
define( 'SOLPRESS_ASSETS_URL', plugin_dir_url( __FILE__ ) . 'assets/' );
define( 'SOLPRESS_GATEWAY_ID', 'wc_solpress_solana' );
define( 'SOLPRESS_SIGNATURE_STORAGE', 'wc_solpress_signature' );
define( 'SOLPRESS_MEMO_SESSION', 'solpress_order_memo' );

/**
 * Add the helper functions file.
 */
if ( is_readable( SOLPRESS_ROOT . 'helper.php' ) ) {
	require_once SOLPRESS_ROOT . 'helper.php';
}

if ( is_readable( SOLPRESS_ROOT . '/vendor/autoload.php' ) ) {
	require_once SOLPRESS_ROOT . '/vendor/autoload.php';
}
/**
 * The code that runs during plugin activation.
 * This action is documented in includes/class-solpress-activator.php
 */
function activate_solpress() {
	require_once SOLPRESS_ROOT . 'includes/class-solpress-activator.php';
	Solpress_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-solpress-deactivator.php
 */
function deactivate_solpress() {
	require_once SOLPRESS_ROOT . 'includes/class-solpress-deactivator.php';
	Solpress_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_solpress' );
register_deactivation_hook( __FILE__, 'deactivate_solpress' );

/**
 * The core plugin class that is used to define internationalization,
 * admin-specific hooks, and public-facing site hooks.
 */
require SOLPRESS_ROOT . 'includes/class-solpress.php';

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 *
 * @since    1.0.0
 */
function run_solpress() {

	$plugin = new Solpress();
	$plugin->run();

}
run_solpress();


