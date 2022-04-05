<?php

/**
 * Handle the payments via Solana.
 *
 * @link       https://solpress.dev
 * @since      1.0.0
 *
 * @package    Solpress
 * @subpackage Solpress/includes
 * @link https://rudrastyh.com/woocommerce/payment-gateway-plugin.html
 * @link https://spl-token-faucet.com/ (for Testing)
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Handle the payments via Solana.
 *
 * This class defines all code necessary to run to use Solana Blockchain.
 *
 * @since      1.0.0
 * @package    Solpress
 * @subpackage Solpress/includes
 * @author     Solpress  <solpressteam@gmail.com>
 */



// PHP Solana PHP SDK.
use Tighten\SolanaPhpSdk\Connection;
use Tighten\SolanaPhpSdk\SolanaRpcClient;

if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
	return;
}

class Wc_Solpress_Solana extends WC_Payment_Gateway {


	/**
	 * Here we initalize the payment options, hooks.
	 */
	public function __construct() {
		 $this->id                = SOLPRESS_GATEWAY_ID; // payment gateway plugin ID.
		$this->icon               = ''; // URL of the icon that will be displayed on checkout page near your gateway name.
		$this->has_fields         = true; // in case you need a custom credit card form.
		$this->method_title       = esc_html__( 'USDC on Solana', 'solpress' );
		$this->method_description = esc_html__( 'Pay via Solana USDC', 'solpress' ); // will be displayed on the options page.

		// gateways can support subscriptions, refunds, saved payment methods.
		$this->supports = array(
			'products',
		);

		// Method with all the options fields.
		$this->init_form_fields();

		// Load the settings.
		$this->init_settings();
		$this->title       = $this->get_option( 'title' );
		$this->description = $this->get_option( 'description' );
		$this->enabled     = $this->get_option( 'enabled' );
		$this->testmode    = 'yes' === $this->get_option( 'testmode' );
		if ( $this->testmode ) {
			$this->title  .= ' (' . esc_html__( 'Test mode enabled', 'solpress' ) . ')';
			$this->cluster = 'devnet';
		} else {
			$this->cluster = 'mainnet';
		}
		$this->publishable_key = $this->testmode ? $this->get_option( 'test_publishable_key' ) :
			$this->get_option( 'publishable_key' );
		$this->network_url = $this->get_option( 'network_url' );
		$this->solpress_log     = 'yes' === $this->get_option( 'solpress_log' );
		// unique id we are going to use as memo for the transactions.
		if ( ! is_admin() && isset(WC()->session) ) {
			$memo_session = WC()->session->get( SOLPRESS_MEMO_SESSION );
			if ( ! $memo_session ) {
				$this->memo = uniqid() . '-' . time();
				WC()->session->set( SOLPRESS_MEMO_SESSION, $this->memo );
			} else {
				$this->memo = WC()->session->get( SOLPRESS_MEMO_SESSION );
			}
			$this->signature = isset( $_COOKIE[ SOLPRESS_SIGNATURE_STORAGE ] ) ? $_COOKIE[ SOLPRESS_SIGNATURE_STORAGE ] : '';
		}
		// This action hook saves the settings.
		add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );

		// We need custom JavaScript to obtain a token.
		add_action( 'wp_enqueue_scripts', array( $this, 'payment_scripts' ) );
		add_action( 'woocommerce_before_checkout_form', array( $this, 'embed_solpress_alerts' ) );
		// Include connect to wallet method.
		add_action( 'woocommerce_review_order_before_submit', array( $this, 'pay_with_solpress_markup' ) );
	}

	/**
	 * Plugin Options and data, that we can handle and change the plugin frontend data.
	 */
	public function init_form_fields() {
		$this->form_fields = array(
			'enabled'              => array(
				'title'       => esc_html__( 'Enable/Disable', 'solpress' ),
				'label'       => esc_html__( 'Enable Solpress Solana Pay Gateway', 'solpress' ),
				'type'        => 'checkbox',
				'description' => '',
				'default'     => 'no',
			),
			'solpress_log'          => array(
				'title'       => esc_html__( 'Enable/Disable Solpress Log', 'solpress' ),
				'label'       => esc_html__( 'Enable Solpress Debug Log', 'solpress' ),
				'type'        => 'checkbox',
				'description' => esc_html__( '' ),
				'default'     => 'no',
				'desc_tip'    => true,
			),
			'title'                => array(
				'title'       => esc_html__( 'Title', 'solpress' ),
				'type'        => 'text',
				'description' => esc_html__( 'This controls the title which the user sees during checkout.', 'solpress' ),
				'default'     => esc_html__( 'USDC on Solana Payments', 'solpress' ),
				'desc_tip'    => true,
			),
			'description'          => array(
				'title'       => esc_html__( 'Description', 'solpress' ),
				'type'        => 'textarea',
				'description' => esc_html__( 'This controls the description which the user sees during checkout.', 'solpress' ),
				'default'     => esc_html__( 'Pay via USDC on Solana.', 'solpress' ),
			),
			'testmode'             => array(
				'title'       => esc_html__( 'Test mode', 'solpress' ),
				'label'       => esc_html__( 'Enable Test Mode', 'solpress' ),
				'type'        => 'checkbox',
				'description' => esc_html__( 'Place the payment gateway in test mode using test devnet wallet.', 'solpress' ),
				'default'     => 'no',
				'desc_tip'    => true,
			),
			'test_publishable_key' => array(
				'title' => esc_html__( 'Test Devnet Merchant Wallet Address', 'solpress' ),
				'type'  => 'text',
			),
			'publishable_key'      => array(
				'title' => esc_html__( 'Live Merchant Wallet Address', 'solpress' ),
				'type'  => 'text',
			),
			'network_url'      => array(
				'title' => esc_html__( 'RPC Network URL', 'solpress' ),
				'type'  => 'url',
				'description' => esc_html__( 'Leave empty to use mainnet. For Medium/High Volume Woocommerce Stores and/or Increased Performance Please Use: https://solpress.genesysgo.net/', 'solpress' ),
			),
		);
	}
	/**
	 * The payment fields that would appear in the frontend (Checkout page).
	 */
	public function payment_fields() {
		if ( $this->description ) {
			$this->description = trim( $this->description );
			// display the description with <p> tags etc.
			echo wpautop( wp_kses_post( $this->description ) );
		}
		// connect to wallet markup.
		if ( is_readable( SOLPRESS_ROOT . 'public/partials/solpress-connect-wallet.php' ) ) {
			include_once SOLPRESS_ROOT . 'public/partials/solpress-connect-wallet.php';
		}

	}
	/**
	 * Add the JS Scripts we need.
	 */
	public function payment_scripts() {
		// we need JavaScript to process a token only on cart/checkout pages.
		if ( ! is_cart() && ! is_checkout() && ! isset( $_GET['pay_for_order'] ) ) {
			return;
		}
		if ( ! $this->publishable_key ) {
			return;
		}

		// if our payment gateway is disabled, we do not have to enqueue JS too.
		if ( 'no' === $this->enabled ) {
			return;
		}

		// do not work with card detailes without SSL unless your website is in a test mode.
		if ( ! $this->testmode && ! is_ssl() ) {
			return;
		}

		// let's suppose it is our payment processor JavaScript that allows to obtain a token .
		// wp_enqueue_script( 'solpress_solana_js', 'https://www.solpress_solanapayments.com/api/token.js' );

		// Custom.js that we would work with.
		wp_register_script( 'wc_solpress.js', SOLPRESS_ASSETS_URL . 'main.js', array( 'jquery' ), '1.0.0', true );
		wp_localize_script(
			'wc_solpress.js',
			'solpress',
			array(
				'to_public_key'       => $this->publishable_key,
				'network_url'         => $this->network_url,
				'order_total'         => self::get_order_total(),
				'security'            => wp_create_nonce( 'solpress-solana' ),
				'confirm_transaction' => 'solpress_confirm_transaction',
				'ajax_url'            => admin_url( 'admin-ajax.php' ),
				'test_mode'           => $this->testmode,
				'memo'                => $this->memo,
				'active_currency'     => ( function_exists( 'get_woocommerce_currency' ) ) ? get_woocommerce_currency() : 'USD',
				'get_total_order'     => 'get_order_total',
				'signature_storage'   => SOLPRESS_SIGNATURE_STORAGE,
			)
		);

		wp_enqueue_script( 'wc_solpress.js' );
	}


	/**
	 * Validate the fields.
	 *
	 * @see https://woocommerce.wp-a2z.org/oik_api/wc_add_notice/
	 * @see https://github.com/tighten/solana-php-sdk
	 * @return boolean
	 */
	public function validate_fields() {
		// if we need to validate anything here.
	   if ( $this->testmode ) {
		   $end_point = SolanaRpcClient::DEVNET_ENDPOINT;
		   $transaction_token = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
	   } else {
		   $end_point = SolanaRpcClient::MAINNET_ENDPOINT;
		   $transaction_token ='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
	   }
	   $client          = new SolanaRpcClient( $end_point );
	   $connection      = new Connection( $client );
	   $this->signature = isset( $_COOKIE[ SOLPRESS_SIGNATURE_STORAGE ] ) ? $_COOKIE[ SOLPRESS_SIGNATURE_STORAGE ] : '';

	   if ( $this->signature ) {
		   try {
			   $confirmed = $connection->getConfirmedTransaction( $this->signature );
					if( isset( $confirmed['meta']['postTokenBalances'][0]['mint'] ) && $confirmed['meta']['postTokenBalances'][0]['mint'] === $transaction_token) {
							$schema    = 'Program log: Memo (len ' . strlen( $this->memo ) . '): "' . $this->memo . '"';

							if ( isset( $confirmed['meta']['logMessages'] ) ) {
								if ( $confirmed['meta']['logMessages'][1] !== $schema ) {
									wc_add_notice( esc_html__( 'The signature provided has not valid memo.', 'solpress' ), 'error' );
									if ( $this->solpress_log ) {
										$malicious = $_SERVER['REMOTE_ADDR'];
										add_to_solpress_log( "This IP[$malicious] is a malicious Address" );
									}
									WC()->session->set( SOLPRESS_MEMO_SESSION, '' );
									return false;
								}
							} else {
								if ( $this->solpress_log ) {
									add_to_solpress_log( 'We need an update for the backend lib' );
								}
							}
						} else {
							wc_add_notice( esc_html__( 'Invalid Transaction Token.', 'solpress' ), 'error' );
							return false;
						}
		   } catch ( Exception $e ) {
			   $confirmed = false;
			   wc_add_notice( $e->getMessage(), 'error' );
			   return false;
		   }
		   if ( ! $confirmed ) {
			   wc_add_notice( esc_html__( 'The Transaction is not confirmed.', 'solpress' ), 'error' );
			   return false;
		   }
	   } else {
		   wc_add_notice( esc_html__( 'Not valid signature.', 'solpress' ), 'error' );
		   WC()->session->set( SOLPRESS_MEMO_SESSION, '' );
		   return false;
	   }
	   return true;
   }
	/**
	 * Process the payment through the main library.
	 *
	 * @param integer $order_id the created id for the order.
	 * @return mixed
	 */
	public function process_payment( $order_id ) {
		global $woocommerce;
		// we need it to get any order detailes
		$order = wc_get_order( $order_id );
		update_post_meta( $order_id, 'solpress_memo', $this->memo );
		update_post_meta( $order_id, 'solpress_signature', $this->signature );
		update_post_meta( $order_id, 'solpress_cluster', $this->cluster );
		$solscan = "https://solscan.io/tx/$this->signature?cluster=$this->cluster";

		// we received the payment
		$order->payment_complete();
		$order->reduce_order_stock();

		// some notes to customer (replace true with false to make it private).
		$order->add_order_note( esc_html__( 'Hey, your order is paid! Thank you!, Order memo:' . $this->memo . ' And Transaction Link: ', 'solpress' ) . esc_url( $solscan ), true );
		setcookie( SOLPRESS_SIGNATURE_STORAGE, '', time() - 3600, '/' ); // Expire this cookie.*/
		WC()->session->set( SOLPRESS_MEMO_SESSION, '' );

		// Empty cart
		$woocommerce->cart->empty_cart();

		// Redirect to the thank you page
		return array(
			'result'   => 'success',
			'redirect' => $this->get_return_url( $order ),
		);
	}
	/**
	 * Ihis Markup would display before the submit btn.
	 *
	 * @return void
	 */
	public function pay_with_solpress_markup() {
		if ( is_readable( SOLPRESS_ROOT . 'public/partials/solpress-payment-display.php' ) ) {
			include_once SOLPRESS_ROOT . 'public/partials/solpress-payment-display.php';
		}
	}
	/**
	 * Embed Solpress Alerts.
	 *
	 * @return void
	 */
	public function embed_solpress_alerts() {
		?>
	<!-- Alerts List -->
<ul id="solpress-alerts" class="solpress__alerts"></ul>
		<?php
	}
}
