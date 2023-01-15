import {
  Connection,
  PublicKey,
  TransactionSignature,
  Transaction,
  clusterApiUrl,
  Keypair,
} from "@solana/web3.js";
import { parseURL, createTransfer, TransferRequestURL, TransferRequestURLFields, encodeURL } from "@solana/pay";
import { SendTransactionOptions, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import BigNumber from "bignumber.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

import {SolpressAPI} from "../../api/SolPressAPI";
import TokenAddress from "../../types/TokenAddress";
import { getSolpressGlobalVars, isTestMode } from "../../utils/functions";
import { awaitTransactionSignatureConfirmation } from "./confirmTransaction";
import {
  TransactionValidationFailure,
  TransactionValidationRes,
  valiateSentTransactionSignature,
} from "./validateTransactionSignature";
import { __ } from "@wordpress/i18n";

type SendAdapterTransactionArgs = (
  transaction: Transaction,
  connection: Connection,
  options?: SendTransactionOptions | undefined
) => Promise<string>;

type CreateTransactionResponse =
  | {
      transaction: Transaction;
      amount: BigNumber;
      splToken: PublicKey | undefined;
      reference: PublicKey[] | undefined;
      amountUI: number;
    }
  | undefined;

export interface SolanaPayI {
  sendTransaction: (
    sendAdapterTransaction: SendAdapterTransactionArgs,
    connection: Connection,
    payerPK: PublicKey,
    recipientPK: PublicKey,
    addSuccessAlert: (content: string) => void,
    addInfoAlert: (content: string) => void,
    addErrorAlert: (content: string) => void
  ) => Promise<{ amountUI: number; signature: TransactionSignature } | undefined>;
  createSolanaTransaction: (
    connection: Connection,
    payerPK: PublicKey,
    recipientPK: PublicKey,
    orderAmount: number
  ) => Promise<CreateTransactionResponse>;
  getUSDCTokenKey: () => any;
  getMemo: () => string;
}

class SolanaPay implements SolanaPayI {
  /**
   * Creats then sends the transaction.
   */
  async sendTransaction(
    sendAdapterTransaction: SendAdapterTransactionArgs,
    connection: Connection,
    payerPK: PublicKey,
    recipientPK: PublicKey,
    addSuccessAlert: (content: string) => void,
    addInfoAlert: (content: string) => void,
    addErrorAlert: (content: string) => void
  ) {

    //Validating accounts
    await this.validateAccounts(connection, recipientPK, payerPK);

    // Getting order amount
    const {getAPIOrderAmount} =  new SolpressAPI();
    const orderAmount = await getAPIOrderAmount();

    if (isNaN(orderAmount)) {
      throw new Error(__("Failed to get order amount"));
    }


    const referenceKey = Keypair.generate().publicKey

    const urlParams: TransferRequestURLFields = {
      recipient: recipientPK,
      // splToken: this.getUSDCTokenKey(),
      splToken: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
      amount: BigNumber(orderAmount),
      reference: referenceKey,
      label: "Sol Pay Inc",
      message: "Thanks for your order! 🍪",
    }
  
    // Encode the params into the format shown
    const url = encodeURL(urlParams)


    const res = await this.createSolanaTransaction(connection, payerPK, recipientPK, orderAmount);

    if (!res || !res.transaction) {
      throw new Error(__("Failed to create transaction"));
    }

    const { transaction, amount, splToken, reference, amountUI } = res;

    //sendAdapterTransaction is the sendTransaction of the wallet adapter.
    const signature = await sendAdapterTransaction(transaction, connection);

    if (signature) {
      addInfoAlert(__("Sending transaction"));

      const isConfirmed = await this.confirmSignature(connection, signature);

      if (isConfirmed) {
        addSuccessAlert(__("Waiting for transaction to be confirmed"));
      } else {
        addErrorAlert(
          __("Failed to confirm your transaction, checking the transaction signature...")
        );
      }

      const validationRes: TransactionValidationRes = await valiateSentTransactionSignature(
        connection,
        signature,
        recipientPK,
        amount,
        splToken,
        reference,
        isConfirmed
      );

      if (validationRes && validationRes.isValid) {
        addSuccessAlert(__("Transaction was created successfully"));
      } else if (
        validationRes &&
        !validationRes.isValid &&
        (validationRes as TransactionValidationFailure).errorMessage
      ) {
        throw Error(__((validationRes as TransactionValidationFailure).errorMessage));
      } else {
        throw Error(__("Something went wrong while validating the transaction."));
      }

      return { amountUI, signature };
    }
  }

  /**
   * Confirm signature of a transaction.
   * @param {Connection} connection
   * @param {string} signature
   */
  async confirmSignature(connection: Connection, signature: TransactionSignature) {
    const failedMessage = __("Failed to confirm your transaction");

    try {
      const timoutMinutes = 2;
      const res = await awaitTransactionSignatureConfirmation(
        signature,
        1000 * 60 * timoutMinutes,
        connection
      );

      //@ts-ignore
      if (res && !res.err && !res.timeout) {
        return true;
      } else throw new Error(failedMessage);
    } catch (err) {
      return false;
    }
  }

  async createSolanaTransaction(
    connection: Connection,
    payerPK: PublicKey,
    recipientPK: PublicKey,
    orderAmount: number
  ): Promise<CreateTransactionResponse> {
    // Creating transaction url
    const { recipient, amount, splToken, reference, memo, } = this.createURL(
      recipientPK,
      orderAmount
    );

    if (!amount) {
      throw new Error(__("Failed to get order amount"));
    }

    const transaction = await createTransfer(connection, payerPK, {
      amount,
      recipient,
      // reference,
      memo,
      splToken
    });

    transaction.feePayer = payerPK;
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    return { transaction, amount, splToken, reference, amountUI: orderAmount };
  }

  /**
   * Validates that the receiver's and payer's accounts exist.
   */
  async validateAccounts(connection: Connection, recipientPK: PublicKey, payerPK: PublicKey) {
    const recipientAcc = await this.validateAccount(
      connection,
      recipientPK,
      __("Recipient account was not found")
    );

    const payerAcc = await this.validateAccount(
      connection,
      payerPK,
      __("Payer account was not found")
    );

    const isValid = recipientAcc.isValid && payerAcc.isValid;

    if (!isValid) {
      if (!payerAcc.isValid) throw new Error(payerAcc.message);
      if (!recipientAcc.isValid) throw new Error(recipientAcc.message);
    }

    return { isValid, recipientAcc, payerAcc };
  }

  /**
   * Validates account.
   * @param {string?} customErrorMessage a custom error message in case there is
   */
  async validateAccount(connection: Connection, publicKey: PublicKey, customErrorMessage: string) {
    if (!publicKey) return { isValid: false, customErrorMessage };

    try {
      let account = await getOrCreateAssociatedTokenAccount(
        connection,
        //@ts-ignore
        publicKey,
        new PublicKey(this.getUSDCTokenKey()),
        new PublicKey(publicKey)
      );
      return { isValid: true, account };
    } catch (err: any) {
      return {
        isValid: false,
        message: err.message || customErrorMessage || err.toString(),
      };
    }
  }

  /**
   * Creates solana pay URL
   * @returns Parsed URL
   * @link https://docs.solanapay.com/spec#specification
   */
  createURL(recipientPK: PublicKey, usdcAmount: number) {
    const usdcQuery = `&spl-token=${this.getUSDCTokenKey()}`;
    const memoQuery = `&memo=${this.getMemo()}`;

    const url = `solana:${recipientPK.toString()}?amount=${usdcAmount}${usdcQuery}&reference=${recipientPK.toString()}${memoQuery}`;

    return parseURL(url) as TransferRequestURL;
  }

  /**
   * Gets the address token for USDC or a fake token for testing.
   */
  getUSDCTokenKey() {
    // return new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") 
    return isTestMode() ? TokenAddress.Dummy : TokenAddress.USDC;
  }

  /**
   * Gets the order memo.
   */
  getMemo() {
    return getSolpressGlobalVars().memo;
  }

  /**
   * Gets network URL.
   */
  getNetworkURL() {
    const customNetworkURL = getSolpressGlobalVars().network_url;

    return isTestMode()
      ? clusterApiUrl(WalletAdapterNetwork.Devnet)
      : customNetworkURL
      ? customNetworkURL
      : clusterApiUrl(WalletAdapterNetwork.Mainnet);
  }

  /**
   * Get cluster name.
   */
  getCluster() {
    return isTestMode() ? WalletAdapterNetwork.Devnet : WalletAdapterNetwork.Mainnet;
  }

  /**
   * Creates a connection with one of Solana's clusters.
   */
  createConnection(): Connection {
    const NETWORK = this.getNetworkURL();
    return new Connection(NETWORK);
  }
}

export default new SolanaPay();
