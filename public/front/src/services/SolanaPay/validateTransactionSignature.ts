import { validateTransfer as validateTransactionSignature } from "@solana/pay";
import {
  Connection,
  PublicKey,
  TransactionResponse,
  TransactionSignature,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";
import { sleep } from "../../utils/functions";

export type TransactionValidationSuccess = {
  res: TransactionResponse;
  isValid: boolean;
};

export type TransactionValidationFailure = {
  isValid: boolean;
  errorMessage: string;
};

export type TransactionValidationRes =
  | TransactionValidationSuccess
  | TransactionValidationFailure
  | null;

/**
 * Validate transaction signature is valid.
 */
export async function valiateSentTransactionSignature(
  connection: Connection,
  signature: TransactionSignature,
  recipient: PublicKey,
  amount: BigNumber,
  splToken: PublicKey | undefined,
  reference: PublicKey[] | undefined,
  retry: boolean = false
): Promise<TransactionValidationRes> {
  let isDone = false;
  let trialsCount = 0;
  let validationRes: TransactionValidationRes = null;
  let timeoutInMilliSeconds = 1000 * 60 * 2; // 2 minute
  const maxTrials = retry ? 10 : 1;
  const initialWaitSeconds = (retry ? 30 : 60) * 1000;
  const sleepInterval = timeoutInMilliSeconds / maxTrials;

  // Wait at least this initial time before trying to validate.
  await sleep(initialWaitSeconds);

  while (!isDone && trialsCount < maxTrials) {
    trialsCount++;

    await validate();

    if (!isDone) {
      await sleep(sleepInterval);
    }
  }

  async function validate() {
    try {
      const res = await validateTransactionSignature(
        connection,
        signature,
        {
          recipient,
          amount,
          splToken,
          reference
        }
      );

      validationRes = { isValid: true, res };
      isDone = true;
    } catch (err: any) {
      console.log(err);
      validationRes = {
        isValid: false,
        errorMessage: err.message || err.toString(),
      };

      if (trialsCount === maxTrials) {
        isDone = true;
      }
    }
  }

  return validationRes;
}
