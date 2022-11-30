<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://solpress.dev
 * @since      1.0.0
 *
 * @package    Solpress
 * @subpackage Solpress/admin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Solpress
 * @subpackage Solpress/admin
 * @author     Solpress  <solpressteam@gmail.com>
 */
class Solpress_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string $plugin_name       The name of this plugin.
	 * @param      string $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version     = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Solpress_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Solpress_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/solpress-admin.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Solpress_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Solpress_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/solpress-admin.js', array( 'jquery' ), $this->version, false );

	}
	/**
	 * Add needed admin notices for SolPress.
	 */
	public function solpress_admin_notices() {
		if ( function_exists( 'wp_get_active_and_valid_plugins' ) && function_exists( 'trailingslashit' ) ) {
			$plugin_path = trailingslashit( WP_PLUGIN_DIR ) . 'woocommerce/woocommerce.php';
			if ( ! in_array( $plugin_path, wp_get_active_and_valid_plugins(), true ) ) {
				 echo '<div class="notice notice-error is-dismissible">
          <p><strong>' . esc_html__( 'To enable SolPress features you need to install the WooCommerce plugin.', 'solpress' ) . '</strong></p>
         </div>';
			}
		}
	}

}
