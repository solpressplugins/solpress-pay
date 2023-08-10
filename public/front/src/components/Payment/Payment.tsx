import Header from "./Header";
import PayButton from "./PayButton/PayButton";
import TransactionSuccess from "./PaymentSuccess/TransactionSuccess";

import { SignerWalletAdapterProps, WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
} from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSolpress from "../../hooks/useSolpress";
import {
  getSolpressGlobalVars,
  getSplTokenKey,
  setCookie,
} from "../../utils/functions";
import useAlert from "../../hooks/useAlert";
import WooCommerceService from "../../services/WooCommerce.service";
import { __ } from "@wordpress/i18n";
import {
  createQR,
  encodeURL,
  findReference,
  FindReferenceError,
  TransferRequestURLFields,
  ValidateTransferError,
  ValidateTransferFields,
  validateTransfer
} from "@solana/pay";
import BigNumber from "bignumber.js";
import { createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount, getAssociatedTokenAddress, getMint } from '@solana/spl-token'; // Add this line


import { SolpressAPI } from "../../api/SolPressAPI";

// JSX
const PayButtons = ({
  triggerSendTransaction,
  publicKey,
  isTransactionDone,
  transactionStarted,
}: any) => {
  return publicKey && !isTransactionDone ? (
    <>
      <PayButton
        isQr="qr"
        isLoading={transactionStarted}
        sendTransaction={() => triggerSendTransaction("qr")}
      />
      <PayButton
        isQr="popup"
        isLoading={transactionStarted}
        sendTransaction={() => triggerSendTransaction("popup")}
      />
    </>
  ) : null;
};

export const configureAndSendCurrentTransaction = async (
  transaction: Transaction,
  connection: Connection,
  feePayer: PublicKey,
  signTransaction: SignerWalletAdapterProps['signTransaction']
) => {
  const blockHash = await connection.getLatestBlockhash();
  transaction.feePayer = feePayer;
  transaction.recentBlockhash = blockHash.blockhash;
  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction({
    blockhash: blockHash.blockhash,
    lastValidBlockHeight: blockHash.lastValidBlockHeight,
    signature
  });
  return signature;
};


function Payment() {
  // const [connection] = useState(SolanaPay.createConnection());
  const { connection } = useConnection();

  const qrRef = useRef<HTMLDivElement>(null);

  const {
    isTransactionDone,
    updateIsTransactionDone,
    transactionAmount,
    updateTransactionAmount,
  } = useSolpress();
  const { addSuccessAlert, addErrorAlert } = useAlert();
  const [transactionStarted, setTransactionStarted] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [isAwaitingPayment, setAwaitingPayment] = useState<
    "waiting" | "done" | "idle"
  >("idle");
  const [isQr, setQr ] = useState<"qr" | "popup" | "">("");


  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const recipientKey = useMemo(() => getSolpressGlobalVars().to_public_key, []);

  const referenceKey = useMemo(() => Keypair.generate().publicKey, []);

  const { getAPIOrderAmount } = new SolpressAPI();


  useEffect(() => {
    if (publicKey) {
      addSuccessAlert(__("Wallet connected successfully"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  // Check every 0.5s if the transaction is completed
  useEffect(() => {

    const interval = setInterval(async () => {
      try {
        console.log(isAwaitingPayment);
        let isValid = false;
        let signatureInfo;
        if (isAwaitingPayment == "waiting") {

          if (isQr == "qr") {
            // Check if there is any transaction for the reference
            signatureInfo = await findReference(connection, referenceKey, {
              finality: "confirmed",
            });
            // Validate that the transaction has the expected recipient, amount and SPL token
            const options: ValidateTransferFields = {
              recipient: new PublicKey(recipientKey),
              amount: BigNumber(orderAmount),
              reference: referenceKey,
            };
            if (getSplTokenKey()) {
              options.splToken = getSplTokenKey();
            }
            const isValidSolanaPay = await validateTransfer(
              connection,
              signatureInfo.signature,
              options,
              { commitment: "confirmed" }
            ).catch((err) => console.log(err));

            isValid = !!isValidSolanaPay;
          }

          if (isQr == "popup") {

            let signatureDetail = await connection.getSignaturesForAddress(publicKey!);
            signatureInfo = signatureDetail[0];
  
            // Validate that the transaction has the expected recipient, amount and SPL token
            if (!signatureInfo) return;
            const memo = signatureInfo.memo?.split(" ")[1];
            console.log(memo, referenceKey.toString());
            isValid = memo === referenceKey.toString();
          }


          if (!isValid) return;
          if (!signatureInfo) return;

          updateTransactionAmount(orderAmount);
          setSignatureCookie(signatureInfo.signature);
          updateIsTransactionDone();

          setTransactionStarted(false);
          WooCommerceService.enableOtherPaymentMethods();
          WooCommerceService.enableCheckoutFormInputs();

          WooCommerceService.triggerWCOrder();
          setAwaitingPayment("done");
        }

      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          return;
        }
        if (e instanceof ValidateTransferError) {
          // Transaction is invalid
          console.error("Transaction is invalid", e);
          return;
        }
        console.error("Unknown error", e);
      }
    }, 5000);

    let timer1 = setTimeout(() => {
      clearInterval(interval);
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer1);
    };
  }, [connection, isAwaitingPayment, isQr, orderAmount, publicKey, recipientKey, referenceKey, updateIsTransactionDone, updateTransactionAmount]);

  type isQrArgs = "qr" | "popup";


  const prepTransaction = (isQr: isQrArgs) => {
    setTransactionStarted(true)
    triggerSendTransaction(isQr)
  }

  const triggerSendTransaction = useCallback(
    async (isQr: isQrArgs) => {
      setQr(isQr);
      try {
        if (!publicKey) throw new WalletNotConnectedError();
        if (!recipientKey) return;
        if (!referenceKey) return;

        WooCommerceService.disableOtherPaymentMethods();
        WooCommerceService.disableCheckoutFormInputs();

        // Validating WC checkout form
        WooCommerceService.validateWCCheckoutForm();

        const amount = await getAPIOrderAmount().catch((err) => console.log(err));
        if (!amount) return
        setOrderAmount(amount);

        const urlParams: TransferRequestURLFields = {
          recipient: new PublicKey(recipientKey),
          amount: BigNumber(amount),
          reference: referenceKey,
          label: document.querySelector("title")?.textContent || "none",
          message:
            document.querySelector("td.product-name")?.textContent ||
            "none",
        };
        if (getSplTokenKey()) {
          urlParams.splToken = getSplTokenKey();
        }
        // Encode the params into the format shown
        const url = encodeURL(urlParams);

        const sectionWidth = document.querySelector('.solpress-payment-root')?.clientWidth

        const qr = createQR(url, sectionWidth || 512, "transparent");

        if (qrRef.current) {
          qrRef.current.innerHTML = "";
        }

        if (qrRef.current && amount > 0 && isQr === "qr") {
          qr.append(qrRef.current);
          setAwaitingPayment("waiting");
        }

        if (isQr === "popup") {

          if (getSplTokenKey()) {
            const tokenAddress = getSplTokenKey()!;// Replace with the token's mint address
            const { decimals } = await getMint(connection, tokenAddress);
            const tokenAmount = new BigNumber(amount).multipliedBy(10 ** decimals).toNumber(); // Amount in token's decimals
            const recipient = new PublicKey(recipientKey);
            const transactionInstructions: TransactionInstruction[] = [];

            const associatedTokenFrom = await getAssociatedTokenAddress(
              tokenAddress,
              publicKey
            );
            const fromAccount = await getAccount(connection, associatedTokenFrom);
            const associatedTokenTo = await getAssociatedTokenAddress(
              tokenAddress,
              recipient
            );

            if (!(await connection.getAccountInfo(associatedTokenTo))) {
              transactionInstructions.push(
                createAssociatedTokenAccountInstruction(
                  publicKey,
                  associatedTokenTo,
                  recipient,
                  tokenAddress
                )
              );
            }
            transactionInstructions.push(
              createTransferInstruction(
                fromAccount.address, // source
                associatedTokenTo, // dest
                publicKey,
                tokenAmount // transfer 1 USDC, USDC on solana devnet has 6 decimal
              )
            );


            const transaction = new Transaction().add(...transactionInstructions);
            await transaction.add(
              new TransactionInstruction({
                keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
                data: Buffer.from(referenceKey.toString(), "utf-8"),
                programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
              })

            )
            // add a reference/memo to the transaction

            if (signTransaction) {
              await configureAndSendCurrentTransaction(
                transaction,
                connection,
                publicKey,
                signTransaction!
              );
            }
            setAwaitingPayment("waiting");

          } else {
            const tx = new Transaction()

            const lamports = new BigNumber(amount).multipliedBy(
              Math.pow(10, 9)
            ).toNumber();
            tx.add(
              SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(recipientKey),
                lamports,
              })
            );
            tx.add(
              new TransactionInstruction({
                keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
                data: Buffer.from(referenceKey.toString(), "utf-8"),
                programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
              })
            )
            // const tx = await createTransfer(connection, publicKey, options);
            /**
             * Send the transaction to the network
             */
            // await window.solana.signAndSendTransaction(tx);
            const {
              context: { slot: minContextSlot },
              value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();


            const signature = await sendTransaction(tx, connection, { minContextSlot });
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            setAwaitingPayment("waiting");
          }


        }



        // return;
      } catch (err: any) {
        console.log(err);
        console.log(err.stack);
        // @ts-ignore
        remoteLogger(err.stack)
        addErrorAlert(err.message || err.toString());
      } finally {
        setTransactionStarted(false);
        WooCommerceService.enableOtherPaymentMethods();
        WooCommerceService.enableCheckoutFormInputs();
      }
    },
    [
      addErrorAlert,
      connection,
      getAPIOrderAmount,
      publicKey,
      recipientKey,
      referenceKey,
      sendTransaction,
      signTransaction
    ]
  );

  const successMessageJSX =
    isTransactionDone && transactionAmount ? (
      <TransactionSuccess amount={transactionAmount} />
    ) : null;

  return (
    <section>
      <Header />
      <div ref={qrRef} />
      <PayButtons
        triggerSendTransaction={prepTransaction}
        publicKey={publicKey}
        isTransactionDone={isTransactionDone}
        transactionStarted={transactionStarted}
      />
      {successMessageJSX}
    </section>
  );
}

declare const window: any;

/**
 * Sets signature as a cookie.
 */
function setSignatureCookie(signature: TransactionSignature) {
  if (getSolpressGlobalVars().signature_storage) {
    setCookie(getSolpressGlobalVars().signature_storage, signature, 1);
  }
}

export default Payment;
