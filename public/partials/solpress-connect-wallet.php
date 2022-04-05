		<!-- Connect Wallet Button -->
	<button id="solpress-connect-wallet" type="button" aria-hidden="true"
		class="solpress__payment-control solpress__payment-control--btn solpress__payment-control__connect-wallet"><?php esc_html_e( 'Connect to Phantom Wallet', 'solpress' ); ?></button>
		<fieldset id="wc-<?php echo esc_attr( $this->id ); ?>-cc-form" class="wc-credit-card-form wc-payment-form" style="background:transparent;">

	<?php
	  do_action( 'woocommerce_credit_card_form_start', $this->id );

		// if we need to add code for the forms, we can do that here.
		do_action( 'woocommerce_credit_card_form_end', $this->id );
	?>

	<div class="clear"></div></fieldset>
