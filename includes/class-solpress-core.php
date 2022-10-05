<?php

/**
 * Fired the solpress Payments Gateways Core.
 *
 * @link       https://solpress.dev
 * @since      1.0.0
 *
 * @package    Solpress
 * @subpackage Solpress/includes
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Fired the Solpress Payments Gateways Core.
 *
 * This class defines all code necessary to run to load the Payment Gateways.
 *
 * @since      1.0.0
 * @package    Solpress
 * @subpackage Solpress/includes
 * @author     Solpress  <solpressteam@gmail.com>
 */
class Solpress_Core {

	/**
	 * Fries the core functionlity for Solpress/Recieve an error message in solpress log if the main class from WooCommerce doesn't exist and include the main functionality if everything is fine.
	 *
	 * @return void
	 */
	public function woocommerce_solpress_init() {
		if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
			return;
		} else {
			if ( is_readable( SOLPRESS_ROOT . 'includes/class-wc-solpress-solana.php' ) ) {
				require_once SOLPRESS_ROOT . 'includes/class-wc-solpress-solana.php';
			}
		}
	}
	/**
	 * Add Solpress method to the woocommerce payments gateway.
	 *
	 * @param array $methods an array of wooCommerce methods that already exists.
	 * @return array $methods the same array but with Solpress added to it as a payment method.
	 */
	public function woocommerce_solpress_gateway( $methods ) {
		$methods[] = 'WC_Solpress_Solana';
		return $methods;
	}
	/**
	 * Add new settings links for Solpress Plugin banner.
	 *
	 * @param array $links an array of existing links.
	 * @return array $links an array of the new added links to the old $links.
	 */
	public function solpress_settings_link( $links ) {
		// Build and escape the URL.
		$url = esc_url( get_admin_url() . 'admin.php?page=wc-settings&tab=checkout&section=' . SOLPRESS_GATEWAY_ID );
		// Create the link.
		$settings_link = "<a href='$url'>" . esc_html__( 'Settings', 'solpress' ) . '</a>';
		// Adds the link to the end of the array.
		array_push(
			$links,
			$settings_link
		);
		return $links;
	}
	/**
	 * Add Solpress Voucher.
	 *
	 * @param integer $order_id is the order recieved.
	 * @return void
	 */
	public function add_solpress_special_voucher( $order_id ) {
		if ( ! class_exists( 'WC_Order' ) ) {
			return;
		}
		$order           = new WC_Order( $order_id );
		$memo_session    = get_post_meta( $order_id, 'solpress_memo', true );
		$order_signature = get_post_meta( $order_id, 'solpress_signature', true );
		$cluster         = get_post_meta( $order_id, 'solpress_cluster', true );
		$solscan         = "https://solscan.io/tx/$order_signature?cluster=$cluster";
		?>

			<ul class="woocommerce-order-overview woocommerce-thankyou-order-details order_details">

				<li class="woocommerce-order-overview__order order">
					<?php esc_html_e( 'Order memo:', 'solpress' ); ?>
					<strong><?php echo esc_html( $memo_session ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></strong>
				</li>

				<li class="woocommerce-order-overview__date date">
					<?php esc_html_e( 'Transaction:', 'solpress' ); ?>
					<strong><a href="<?php echo esc_url( $solscan ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" target="_blank"><?php esc_html_e( 'Click here for details', 'solpress' ); ?></a></strong>
				</li>

			</ul>
		<?php
	}
}

