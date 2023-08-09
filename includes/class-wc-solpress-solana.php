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

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

if (!class_exists('WC_Payment_Gateway') && !isset(WC()->session)) {
    return;
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
class WC_Solpress_Solana extends WC_Payment_Gateway
{

    /**
     * Here we initalize the payment options, hooks.
     * @since 1.0.0
     * @version 2.0.0
     */
    public function __construct()
    {
        $this->id = SOLPRESS_GATEWAY_ID; // payment gateway plugin ID.
        $this->icon = ''; // URL of the icon that will be displayed on checkout page near your gateway name.
        $this->has_fields = true; // in case you need a custom credit card form.
        $this->method_title = esc_html__('USDC on Solana', 'solpress');
        $this->method_description = esc_html__('Pay via Solana USDC', 'solpress'); // will be displayed on the options page.

        // gateways can support subscriptions, refunds, saved payment methods.
        $this->supports = array(
            'products',
        );

        // Method with all the options fields.
        $this->init_form_fields();

        // Load the settings.
        $this->init_settings();
        $this->title = $this->get_option('title');
        $this->description = $this->get_option('description');
        $this->enabled = $this->get_option('enabled');
        $this->testmode = 'yes' === $this->get_option('testmode');
        if ($this->testmode) {
            $this->title .= ' (' . esc_html__('Test mode enabled', 'solpress') . ')';
            $this->cluster = 'devnet';
        } else {
            $this->cluster = 'mainnet';
        }

        $default_mainnet_rpc =  'https://solana-mainnet.rpc.extrnode.com';

        $this->publishable_key = $this->testmode ? $this->get_option('test_publishable_key') : $this->get_option('publishable_key');
        $this->network_url = $this->get_option('network_url') !== "" ? $this->get_option('network_url') : $default_mainnet_rpc;
        $this->solpress_log = 'yes' === $this->get_option('solpress_log');

        $this->custom_spl_enabled = $this->get_option('custom_spl_enabled');
        $this->custom_spl_token = $this->get_option('custom_spl_token');

        $this->custom_qr_btn_class = $this->get_option('custom_qr_btn_class');
        $this->custom_pay_btn_class = $this->get_option('custom_pay_btn_class');



        // data that will be used for the memo
        if (WC()->session) {
            $this->order_total = WC()->cart->total ? WC()->cart->total : 0;
            $this->billing_first_name = WC()->customer->get_billing_first_name() ? WC()->customer->get_billing_first_name() : '';
            $this->customer_id = WC()->customer->get_id() ? WC()->customer->get_id() : 0;
        }

        // unique id we are going to use as memo for the transactions.
        if (!is_admin() && WC()->session && !empty($this->order_total)) {

            $memo_session = WC()->session->get(SOLPRESS_MEMO_SESSION);
            if (!$memo_session) {

                $this->memo = $this->generate_memo();
                WC()->session->set(SOLPRESS_MEMO_SESSION, $this->memo);
            } else {
                $this->memo = WC()->session->get(SOLPRESS_MEMO_SESSION);
            }
            $this->signature = isset($_COOKIE[SOLPRESS_SIGNATURE_STORAGE]) ? sanitize_text_field($_COOKIE[SOLPRESS_SIGNATURE_STORAGE]) : '';
        }

        // This action hook saves the settings.
        add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));

        // We need custom JavaScript to obtain a token.
        add_action('wp_enqueue_scripts', array($this, 'payment_scripts'), 1);

        // React root
        add_action('woocommerce_review_order_after_payment', array($this, 'add_wallets_root'));


        if (strlen($this->get_option('custom_spl_symbol')) > 0 && strlen($this->get_option('custom_spl_name')) > 0) {
            $this->addCustomTokenCurrency();

            add_action( 'woocommerce_settings_pricing_options', array( $this, 'my_custom_pricing_options_description') );

        }      
        
    }

    public function my_custom_pricing_options_description( ) {
        ?>
        <p><?php echo esc_html( 'The currency is set by Solpress Payment Gateway.' ); ?></p>
        <?php
        
    }

    private function addCustomTokenCurrency()
    {
        $token_name = $this->get_option('custom_spl_name');
        $token_symbol = $this->get_option('custom_spl_symbol');
        /**
         * Custom currency and currency symbol
         */
        add_filter('woocommerce_currencies', function($currencies) use ($token_name, $token_symbol){
            $currencies[$token_symbol] = __( $token_name , 'woocommerce');
            return $currencies;
        });

        add_filter('woocommerce_currency_symbol', function ($currency_symbol, $currency) use($token_symbol) {
            switch ($currency) {
                case $token_symbol:
                    $currency_symbol = $token_symbol;
                    break;
            }
            return $currency_symbol;
        }, 10, 2);

        update_option('woocommerce_currency', $token_symbol);

    }

    /**
     * Plugin Options and data, that we can handle and change the plugin frontend data.
     *
     * @since 1.0.0
     */
    public function init_form_fields()
    {
        $this->form_fields = array(
            'enabled' => array(
                'title' => esc_html__('Enable/Disable', 'solpress'),
                'label' => esc_html__('Enable Solpress Solana Pay Gateway', 'solpress'),
                'type' => 'checkbox',
                'description' => '',
                'default' => 'no',
            ),
            'solpress_log' => array(
                'title' => esc_html__('Enable/Disable Solpress Log', 'solpress'),
                'label' => esc_html__('Enable Solpress Debug Log', 'solpress'),
                'type' => 'checkbox',
                'default' => 'no',
                'desc_tip' => true,
            ),
            'title' => array(
                'title' => esc_html__('Title', 'solpress'),
                'type' => 'text',
                'description' => esc_html__('This controls the title which the user sees during checkout.', 'solpress'),
                'default' => esc_html__('USDC on Solana Payments', 'solpress'),
            ),
            'description' => array(
                'title' => esc_html__('Description', 'solpress'),
                'type' => 'textarea',
                'description' => esc_html__('This controls the description which the user sees during checkout.', 'solpress'),
                'default' => esc_html__('Pay via USDC on Solana.', 'solpress'),
            ),
            'testmode' => array(
                'title' => esc_html__('Test mode', 'solpress'),
                'label' => esc_html__('Enable Test Mode', 'solpress'),
                'type' => 'checkbox',
                'description' => esc_html__('Place the payment gateway in test mode using test devnet wallet.', 'solpress'),
                'default' => 'no',
                'desc_tip' => true,
            ),
            'test_publishable_key' => array(
                'title' => esc_html__('Test Devnet Merchant Wallet Address', 'solpress'),
                'description' => esc_html__('Please enter a Devnet Merchant Wallet Address, this is a string of alphanumeric characters used to receive the payment', 'solpress'),
                'type' => 'text',
            ),
            'publishable_key' => array(
                'title' => esc_html__('Live Merchant Wallet Address', 'solpress'),
                'description' => esc_html__('Please enter your Live Merchant Wallet address on the Solana Mainnet. Make sure to double check the address as transactions sent to the wrong address cannot be recovered.', 'solpress'),
                'type' => 'text',
            ),
            'network_url' => array(
                'title' => esc_html__('RPC Network URL', 'solpress'),
                'type' => 'url',
                'description' => esc_html__('Leave empty to use extrnode rpc (free). If it fails check ' . esc_url('https://solpress.dev/rpc/') . ' for free and other available rpc networks.', 'solpress'),
            ),
            'custom_spl_enabled' => array(
                'title' => esc_html__('Use Custom SPL Token', 'solpress'),
                'label' => esc_html__('Use your own SPL token', 'solpress'),
                'type' => 'checkbox',
                'description' => esc_html__('To enable other SPL tokens.', 'solpress'),
                'default' => 'no',
                'desc_tip' => true,
            ),
            'custom_spl_token' => array(
                'title' => esc_html__('Custom SPL Token Address', 'solpress'),
                'type' => 'text',
                'description' => esc_html__("Please enter the valid custom SPL token contract address. This can be found on the blockchain explorer by searching for the contract's transaction hash.", 'solpress'),
            ),
            'custom_spl_symbol' => array(
                'title' => esc_html__('Custom SPL Token Symbol', 'solpress'),
                'type' => 'text',
                'description' => esc_html__('Set this value to add the token symbol to your available Woocommerce currency list. Works when Custom SPL Token Name is set.', 'solpress'),
            ),
            'custom_spl_name' => array(
                'title' => esc_html__('Custom SPL Token Name', 'solpress'),
                'type' => 'text',
                'description' => esc_html__('Set this value to add the token name to your available Woocommerce currency list. Works when Custom SPL Token Symbol is set.', 'solpress'),
            ),
            'custom_qr_btn_class' => array(
                'title' => esc_html__('QR button class', 'solpress'),
                'type' => 'text',
                'description' => esc_html__('Custom class to override CSS style on the "Scan QR code" button.', 'solpress'),
            ),
            'custom_pay_btn_class' => array(
                'title' => esc_html__('Complete here button class', 'solpress'),
                'type' => 'text',
                'description' => esc_html__('Custom class to override CSS style on the "Complete here" button.', 'solpress'),
            ),
        );
    }

    /**
     * The hashed memo that would be used.
     *
     * @since 2.0.0
     * @return string memo , our generated hashed memo
     */

    protected function generate_memo()
    {
        $this->memo = $this->customer_id . '-' . $this->billing_first_name . '-' . $this->order_total;
        $this->memo = function_exists('wp_hash') ? wp_hash($this->memo) : $this->memo;
        return $this->memo;
    }

    /**
     * The payment fields that would appear in the frontend (Checkout page).
     * @since 1.0.0
     */
    public function payment_fields()
    {
        if ($this->description) {
            $this->description = trim($this->description);
            // display the description with <p> tags etc.
            echo esc_html($this->description);
        }
        // connect to wallet markup.
        if (is_readable(SOLPRESS_ROOT . 'public/partials/solpress-connect-wallet.php')) {
            include_once SOLPRESS_ROOT . 'public/partials/solpress-connect-wallet.php';
        }
    }

    /**
     * Add the JS Scripts we need.
     *
     * @since 1.0.0
     */
    public function payment_scripts()
    {
        // we need JavaScript to process a token only on cart/checkout pages.
        // phpcs:disable WordPress.Security.NonceVerification.Recommended
        if (!is_cart() && !is_checkout() && !isset($_GET['pay_for_order'])) {
        // phpcs:enable
            return;
        }
        if (!$this->publishable_key) {
            return;
        }

        // if our payment gateway is disabled, we do not have to enqueue JS too.
        if ('no' === $this->enabled) {
            return;
        }

        // do not work with card detailes without SSL unless your website is in a test mode.
        if (!$this->testmode && !is_ssl()) {
            return;
        }

        // let's suppose it is our payment processor JavaScript that allows to obtain a token .

        // Custom.js that we would work with.
        wp_register_script('wc_solpress.js', SOLPRESS_ASSETS_URL . 'main.js', array('jquery'), '1.0.0', true);
        wp_localize_script(
            'wc_solpress.js',
            'solpress_payment',
            array(
                'to_public_key' => $this->publishable_key,
                'network_url' => $this->network_url,
                'order_total' => self::get_order_total(),
                'security' => wp_create_nonce("solpress-solana"),
                'confirm_transaction' => 'solpress_confirm_transaction',
                'ajax_url' => admin_url('admin-ajax.php'),
                'test_mode' => $this->testmode,
                'memo' => $this->generate_memo(),
                'active_currency' => (function_exists('get_woocommerce_currency')) ? get_woocommerce_currency() : 'USD',
                'get_total_order' => 'get_order_total',
                'signature_storage' => SOLPRESS_SIGNATURE_STORAGE,
                'custom_spl_token' => $this->custom_spl_token,
                'custom_spl_enabled' => $this->custom_spl_enabled,
                'custom_qr_btn_class' => $this->custom_qr_btn_class,
                'custom_pay_btn_class' => $this->custom_pay_btn_class,
            )
        );

        wp_enqueue_script('wc_solpress.js');
    }

    /**
     * Validate the fields.
     *
     * @since 1.0.0
     * @version 2.0.0
     *
     * @see https://woocommerce.wp-a2z.org/oik_api/wc_add_notice/
     * @return boolean
     */
    public function validate_fields()
    {
        // if we need to validate anything here.
        if ($this->testmode) {
            $end_point = 'https://api.devnet.solana.com';
            $transaction_token = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
        } else {
            $end_point =  $this->network_url;
            $transaction_token = strlen($this->custom_spl_token) > 0 && $this->custom_spl_enabled !== 'no' ? $this->custom_spl_token : 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
        }
        // get random key to be sent as id
        $this->random_key = random_int(0, 99999999);
        $this->signature = isset($_COOKIE[SOLPRESS_SIGNATURE_STORAGE]) ? sanitize_text_field($_COOKIE[SOLPRESS_SIGNATURE_STORAGE]) : '';

        if ($this->signature) {
            // put the request body and headers
            $body = array(
                'jsonrpc' => '2.0',
                'id' => $this->random_key,
                'method' => 'getTransaction',
                'params' => array(
                    $this->signature,
                ),
            );

            $args = array(
                'method' => 'POST',
                'headers' => array(
                    'Content-Type' => 'application/json',
                ),
                'body' => wp_json_encode($body),
            );

            $request_retry_count = 1;
            $max_request_retries = 5;

            do {
                sleep(3);
                $confirmed = wp_remote_post($end_point, $args);
                if (!is_wp_error($confirmed)) {
                    $confirmed_body = isset($confirmed['body']) ? json_decode($confirmed['body'], true) : array();
                    $program_index = $confirmed_body['result']['transaction']['message']['instructions'][0]['programIdIndex'];
                    $program_account = $confirmed_body['result']['transaction']['message']['accountKeys'][$program_index];

                    if ($program_account === "11111111111111111111111111111111" && $transaction_token === "So11111111111111111111111111111111111111112") {
                        // @todo: compare amounts also.
                        $request_retry_count = $max_request_retries + 10;
                    }

                    if (!isset($confirmed_body['result']['meta']['postTokenBalances'][0]['mint'])) {
                        continue;
                    }

                    if (isset($confirmed_body['result']['meta']['postTokenBalances'][0]['mint']) && $confirmed_body['result']['meta']['postTokenBalances'][0]['mint'] === $transaction_token) {
                        // should break loop
                        $request_retry_count = $max_request_retries + 10;

                    } else {

                        wc_add_notice(esc_html__('Invalid Transaction Token.', 'solpress'), 'error');
                        return false;
                    }
                } else {
                    wc_add_notice($confirmed->get_error_message(), 'error');
                    $confirmed = false;
                    return false;
                }

                $request_retry_count++;

            } while ($request_retry_count <= $max_request_retries && $confirmed);

            if (!$confirmed) {
                wc_add_notice(esc_html__('The Transaction is not confirmed.', 'solpress'), 'error');
                return false;
            }
        } else {
            wc_add_notice(esc_html__('Not valid signature.', 'solpress'), 'error');
            WC()->session->set(SOLPRESS_MEMO_SESSION, '');
            return false;
        }
        return true;
    }

    /**
     * Process the payment through the main library.
     *
     * @since 1.0.0
     *
     * @param integer $order_id the created id for the order.
     * @return mixed
     */
    public function process_payment($order_id)
    {
        global $woocommerce;
        // we need it to get any order detailes
        $order = wc_get_order($order_id);
        update_post_meta($order_id, 'solpress_memo', $this->memo);
        update_post_meta($order_id, 'solpress_signature', $this->signature);
        update_post_meta($order_id, 'solpress_cluster', $this->cluster);
        $solscan = "https://solscan.io/tx/$this->signature?cluster=$this->cluster";

        // we received the payment
        $order->payment_complete();
        wc_reduce_stock_levels($order_id);

        // some notes to customer (replace true with false to make it private).
        $order->add_order_note(esc_html__('Hey, your order is paid! Thank you!, Order memo:' . $this->memo . ' And Transaction Link: ', 'solpress') . esc_url($solscan), true);
        setcookie(SOLPRESS_SIGNATURE_STORAGE, '', time() - 3600, '/'); // Expire this cookie.*/
        WC()->session->set(SOLPRESS_MEMO_SESSION, '');

        // Empty cart
        $woocommerce->cart->empty_cart();

        // Redirect to the thank you page
        return array(
            'result' => 'success',
            'redirect' => $this->get_return_url($order),
        );
    }

    /**
     * Add Wallet Root.
     *
     * @since 1.0.0
     * @return void
     */
    public function add_wallets_root()
    {
        ?>
		<div id="solpress-alerts-root" class="solpress__alerts"></div>
		<section id="solpress-payment-root" class="solpress-payment-root"></section>
<?php
}
}
