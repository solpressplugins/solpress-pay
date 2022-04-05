import { Connection, TransactionSignature } from "@solana/web3.js";
import { sleep } from "../utils/functions";

/**
 * Confirm transaction with retry logic
 * @param {TransactionSignature} signature Transaction signature
 * @param {number} timeout Time in milliseconds
 * @param {Connection} connection
 * @param {string?} commitment
 * @param {false?} queryStatus
 * @returns
 */
export const awaitTransactionSignatureConfirmation = async (
  signature,
  timeout,
  connection,
  commitment = "recent",
  queryStatus = false
) => {
  let done = false;
  let status = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;

  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      //   console.log("Rejecting for timeout...");
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        signature,
        (result, context) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            // console.log("Rejected via websocket", result.err);
            reject(status);
          } else {
            // console.log("Resolved via websocket", result);
            resolve(status);
          }
        },
        commitment
      );
    } catch (e) {
      done = true;
      //   console.error("WS error in setup", signature, e);
    }
    while (!done && queryStatus) {
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([signature]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              //   console.log("REST null result for", signature, status);
            } else if (status.err) {
              //   console.log("REST error for", signature, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              //   console.log("REST no confirmations for", signature, status);
            } else {
              //   console.log("REST confirmation for", signature, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            // console.log("REST connection error: signature", signature, e);
          }
        }
      })();
      await sleep(2000);
    }
  });

  if (connection._signatureSubscriptions[subId]) {
    connection.removeSignatureListener(subId);
  }

  done = true;
  //   console.log("Returning status ", status);
  return status;
};
