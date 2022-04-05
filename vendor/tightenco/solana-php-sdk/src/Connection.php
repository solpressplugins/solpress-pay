<?php

namespace Tighten\SolanaPhpSdk;

use Tighten\SolanaPhpSdk\Exceptions\AccountNotFoundException;
use Tighten\SolanaPhpSdk\Util\Commitment;

class Connection extends Program {

	/**
	 * @param string $pubKey
	 * @return array
	 */
	public function getAccountInfo( string $pubKey ): array {
		$accountResponse = $this->client->call( 'getAccountInfo', array( $pubKey, array( 'encoding' => 'jsonParsed' ) ) )['value'];

		if ( ! $accountResponse ) {
			throw new AccountNotFoundException( "API Error: Account {$pubKey} not found." );
		}

		return $accountResponse;
	}

	/**
	 * @param string $pubKey
	 * @return float
	 */
	public function getBalance( string $pubKey ): float {
		return $this->client->call( 'getBalance', array( $pubKey ) )['value'];
	}

	/**
	 * @param string $transactionSignature
	 * @return array
	 */
	public function getConfirmedTransaction( string $transactionSignature ): array {
		return $this->client->call( 'getConfirmedTransaction', array( $transactionSignature ) );
	}

	/**
	 * NEW: This method is only available in solana-core v1.7 or newer. Please use getConfirmedTransaction for solana-core v1.6
	 *
	 * @param string $transactionSignature
	 * @return array
	 */
	public function getTransaction( string $transactionSignature ): array {
		return $this->client->call( 'getTransaction', array( $transactionSignature ) );
	}

	/**
	 * @param Commitment|null $commitment
	 * @return array
	 * @throws Exceptions\GenericException|Exceptions\MethodNotFoundException|Exceptions\InvalidIdResponseException
	 */
	public function getRecentBlockhash( ?Commitment $commitment = null ): array {
		return $this->client->call( 'getRecentBlockhash', array_filter( array( $commitment ) ) )['value'];
	}

	/**
	 * @param Transaction $transaction
	 * @param Keypair     $signer
	 * @param array       $params
	 * @return array|\Illuminate\Http\Client\Response
	 * @throws Exceptions\GenericException
	 * @throws Exceptions\InvalidIdResponseException
	 * @throws Exceptions\MethodNotFoundException
	 */
	public function sendTransaction( Transaction $transaction, Keypair $signer, $params = array() ) {
		if ( ! $transaction->recentBlockhash ) {
			$transaction->recentBlockhash = $this->getRecentBlockhash()['blockhash'];
		}

		$transaction->sign( $signer );

		$rawBinaryString = $transaction->serialize( false );

		$hashString = sodium_bin2base64( $rawBinaryString, SODIUM_BASE64_VARIANT_ORIGINAL );

		return $this->client->call(
			'sendTransaction',
			array(
				$hashString,
				array(
					'encoding'            => 'base64',
					'preflightCommitment' => 'confirmed',
				),
			)
		);
	}
	public function getSignatureStatuses( string $transactionSignature ): array {
		return $this->client->call( 'getSignatureStatuses', array( $transactionSignature ) );
	}
	public function getSignaturesForAddress( string $accountAddress ): array {
		return $this->client->call( 'getSignaturesForAddress', array($accountAddress) );
	}

}
