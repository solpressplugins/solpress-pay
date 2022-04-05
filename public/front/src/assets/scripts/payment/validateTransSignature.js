import { validateTransactionSignature } from "@solana/pay";
import { Connection, PublicKey, TransactionSignature } from "@solana/web3.js";
import { sleep } from "../utils/functions";

/**
 * Validate transaction signature is valid.
 *
 * @param {Connection} connection
 * @param {TransactionSignature} signature
 * @param {PublicKey} recipient
 * @param {BigInt} amount
 * @param {PublicKey} splToken
 * @param {boolean} retry
 */
export async function valiateTransSignature(
  connection,
  signature,
  recipient,
  amount,
  splToken,
  reference,
  retry = false
) {
  let isDone = false;
  let trialsCount = 0;
  let validationRes = null;
  let timeoutInMilliSeconds = 1000 * 60 * 2; // 2 minute
  let maxTrials = retry ? 10 : 1;
  const initialWaitSeconds = (retry ? 30 : 60) * 1000;
  let sleepInterval = timeoutInMilliSeconds / maxTrials;

  // Wait at least this initial time before trying to validate.
  await sleep(initialWaitSeconds);

  while (!isDone && trialsCount < maxTrials) {
    trialsCount++;

    await validate();

    if (!isDone) {
      await sleep(sleepInterval);
    }

    async function validate() {
      try {
        const res = await validateTransactionSignature(
          connection,
          signature,
          recipient,
          amount,
          splToken,
          reference
        );

        validationRes = { isValid: true, res };
        isDone = true;
      } catch (err) {
        console.log(err);
        validationRes = { isValid: false, errorMessage: err.message || err.toString() };

        if (trialsCount === maxTrials) {
          isDone = true;
        }
      }
    }
  }

  return validationRes;
}
