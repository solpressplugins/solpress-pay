<?php

/**
 * All the helper functions we need to use through the plugin.
 *
 * @link       https://solpress.dev
 * @since      1.0.0
 *
 * @package    Solpress 
 */
if ( ! function_exists( 'add_to_solpress_log' ) ) {
	/**
	 * Add Messages to Solpress Log file.
	 *
	 * @param string $message the message we need to add to Solpress Log.
	 * @param string $type the message type (Can be error, success, .. ).
	 * @see https://www.php.net/manual/en/function.date.php
	 * @see https://www.php.net/manual/en/function.error-log.php
	 * @return void
	 **/
	function add_to_solpress_log( $message, $type = 'error' ) {

			$date = gmdate( 'F j, Y, g:i:s a' );
			if ( defined( 'WP_DEBUG' ) && WP_DEBUG === true ) {
				// phpcs:disable WordPress.PHP.DevelopmentFunctions
				error_log( "[$date]" . " : $type message received " . " [$message] " . "\r\n", 3, SOLPRESS_ROOT . '/solpress.log' );
				// phpcs:enable
			}

	}
}
