<section id="solpress-payment-container">
	<!-- Header -->
	<header id="solpress-header" aria-hidden="true" class="solpress__header solpress__payment-control">
		<h2 class="solpress__header__heading"><?php esc_html_e( 'Pay With USDC', 'solpress' ); ?></h2>
		<p class="solpress__header__warning">
			<strong><?php esc_html_e( 'Don\'t close the page until redirected to the order received page or your transaction may be lost.', 'solpress' ); ?></strong>
		</p>
	</header>

	<!-- Phantom Link -->
	<div id="solpress-phantom-link" class="solpress__payment-control solpress__payment-control__phantom-link-wrapper"
		aria-hidden="true">
		<a target="_blank" rel="noreferrer noopener" class=" solpress__payment-controls__phantom-link"
			href="https://phantom.app/"><?php esc_html_e( 'Connect to Phantom Wallet', 'solpress' ); ?></a>
		<p><?php esc_html_e( 'Already installed the Phantom wallet? Try refreshing the page.', 'solpress' ); ?></p>
	</div>


	<!-- Place Order Button -->
	<button id="solpress-place-order" type="button" aria-hidden="true"
		class="solpress__payment-control solpress__clickable solpress__payment-control--btn solpress__payment-control__place-order">
		<!-- Content -->
		<?php esc_html_e( 'Pay with', 'solpress' ); ?>
		<img class="solpress__payment-control__place-order-image" src="/wp-content/plugins/solpress/public/front/src/assets/images/solana-sol-logo.svg" alt="" role="presentation"/>
		<?php esc_html_e( 'Pay', 'solpress' ); ?>
		<!-- Click Layer -->
		<div id="solpress-place-order-click-layer" class="solpress__clickable__click-layer"></div>
		<!-- Loader -->
		<div id="solpress-place-order-loader" class="solpress__loader" loading="false">
			<div class="lds-default">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</div>
	</button>

	<!-- Transaction Error -->
	<div id="solpress-transaction-error" aria-hidden="true" role="alert"
		class="solpress__payment-control solpress__payment-control__error solpress__alert solpress__alert--error">
		<p id="solpress-transaction-error-content"
			class="solpress__payment-control__error-content solpress__alert__message"></p>
	</div>

	<!-- Transaction Success -->
	<div id="solpress-transaction-success" class="solpress__payment-control solpress__payment-control__sucess"
		aria-hidden="true" role="alert">
		<div class="solpress__payment-control__sucess__icon">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="#09b765">
				<path fill-rule="evenodd"
					d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd" />
			</svg>
		</div>
		<h3 class="solpress__payment-control__sucess__heading"><?php esc_html_e( 'Transaction Done', 'solpress' ); ?></h3>
		<p class="solpress__payment-control__sucess__desc">
			<?php esc_html_e( 'Transaction with ', 'solpress' ); ?>
			<span class="solpress__payment-control__sucess__amount-value-wrapper text-med">
				<span id="solpress-transaction-value" class="solpress__payment-control__sucess__amount-value">-</span>
				<span class="solpress__payment-control__sucess__amount-value-unit"><?php esc_html_e( 'USDC', 'solpress' ); ?></span>
			</span>
			<?php esc_html_e( 'is made successfully', 'solpress' ); ?>
		</p>
	</div>
</section>



<!-- Templates -->
<!-- Error Template -->
<template id="solpress-alert-error">
	<li class="solpress__alert solpress__alert--error" role="alert">
		<button type="button" class="solpress__alert__dismiss" aria-lebel="Dismiss message" aria-pressed="false"
			aria-controls="">
			X
		</button>
		<div class="solpress__alert__icon-wrapper">
			<svg class="solpress__alert__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
				viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd"
					d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
					clip-rule="evenodd" />
			</svg>
		</div>
		<div class="solpress__alert__message"></div>
	</li>
</template>

<!-- Success Template -->
<template id="solpress-alert-success">
	<li class="solpress__alert solpress__alert--success" role="alert">
		<button type="button" class="solpress__alert__dismiss" aria-lebel="Dismiss message" aria-pressed="false"
			aria-controls="">
			X
		</button>
		<div class="solpress__alert__icon-wrapper">
			<svg class="solpress__alert__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
				fill="currentColor">
				<path fill-rule="evenodd"
					d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					clip-rule="evenodd" />
			</svg>
		</div>
		<div class="solpress__alert__message"></div>
	</li>
</template>

<!-- Info Template -->
<template id="solpress-alert-info">
	<li class="solpress__alert solpress__alert--info" role="alert">
		<button type="button" class="solpress__alert__dismiss" aria-lebel="Dismiss message" aria-pressed="false"
			aria-controls="">
			X
		</button>
		<div class="solpress__alert__icon-wrapper">
			<svg class="solpress__alert__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
				viewBox="0 0 20 20" fill="currentColor">
				<path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
				<path fill-rule="evenodd"
					d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
					clip-rule="evenodd" />
			</svg>
		</div>
		<div class="solpress__alert__message"></div>
	</li>
</template>
