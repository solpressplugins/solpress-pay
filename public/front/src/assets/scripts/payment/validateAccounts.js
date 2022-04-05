import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

import { WP_LOCLIZED_TEXT } from "../utils/enums";
import { getWPLocalizedText } from "../utils/functions";
import { getUSDCTokenKey } from "./payment";

/**
 * Validates that the recipient's and payer's accounts exist.
 *
 * @param {Connection} connection
 * @param {PublicKey} recipientKey
 * @param {PublicKey} payerKey
 * @returns {{isValid:boolean, recipientKey: {isValid: boolean, account?:object | undefined, message?: string | undefined}, payerAcc: {isValid: boolean, account?:object | undefined, message?: string | undefined}}}
 */
export async function validateAccounts(connection, recipientKey, payerKey) {
  const recipientAcc = await validateAccount(
    connection,
    recipientKey,
    getWPLocalizedText(WP_LOCLIZED_TEXT.RECIPIENT_ACC_NOT_FOUND)
  );
  const payerAcc = await validateAccount(
    connection,
    payerKey,
    getWPLocalizedText(WP_LOCLIZED_TEXT.PAYER_ACC_NOT_FOUND)
  );

  return { isValid: recipientAcc.isValid && payerAcc.isValid, recipientAcc, payerAcc };
}

/**
 * Validates account.
 * @param {Connection} connection
 * @param {PublicKey} publickKey
 * @param {string?} customErrorMessage a custom error message in case there is
 *  no message returned from the error.
 * @returns {{isValid: boolean, account?:object | undefined, message?: string | undefined}}
 */
async function validateAccount(connection, publickKey, customErrorMessage = "") {
  try {
    let account = await getOrCreateAssociatedTokenAccount(
      connection,
      publickKey.toString(),
      new PublicKey(getUSDCTokenKey()),
      new PublicKey(publickKey)
    );
    return { isValid: true, account };
  } catch (err) {
    return { isValid: false, message: err.message || customErrorMessage || err.toString() };
  }
}
