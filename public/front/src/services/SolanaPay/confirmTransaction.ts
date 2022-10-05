import {
  Commitment,
  Connection,
  SignatureStatus,
  TransactionSignature,
} from "@solana/web3.js";
import { sleep } from "../../utils/functions";

/**
 * Confirm transaction with retry logic
 * @param {number} timeout Time in milliseconds
 * @link https://github.com/kevinfaveri/solana-candy-factory/blob/b57095cb9e1e24195c229f783c932ccc4f24c78d/src/utils/candy-machine.ts#L40
 */
export const awaitTransactionSignatureConfirmation = async (
  signature: TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: Commitment = "recent",
  queryStatus: boolean = false
) => {
  let done = false;
  let status: SignatureStatus | null = {
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
      // eslint-disable-next-line no-loop-func
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            signature,
          ]);
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

  //@ts-ignore
  if (connection._signatureSubscriptions[subId]) {
    connection.removeSignatureListener(subId);
  }

  done = true;
  //   console.log("Returning status ", status);
  return status;
};
