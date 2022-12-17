import Header from "./Header";
import PayButton from "./PayButton/PayButton";
import TransactionSuccess from "./PaymentSuccess/TransactionSuccess";

import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, sendAndConfirmTransaction, TransactionSignature } from "@solana/web3.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSolpress from "../../hooks/useSolpress";
import SolanaPay from "../../services/SolanaPay/SolanaPay.service";
import { getSolpressGlobalVars, getKINTokenKey, setCookie } from "../../utils/functions";
import useAlert from "../../hooks/useAlert";
import WooCommerceService from "../../services/WooCommerce.service";
import { __ } from "@wordpress/i18n";
import { createQR, createTransfer, encodeURL, findReference, FindReferenceError, parseURL, TransferRequestURL, TransferRequestURLFields, validateTransfer, ValidateTransferError } from "@solana/pay";
import BigNumber from "bignumber.js";

import { SolpressAPI } from "../../api/SolPressAPI";

function Payment() {
  const [connection] = useState(SolanaPay.createConnection());

  const qrRef = useRef<HTMLDivElement>(null);

  // console.log("Connection: ", connection);

  const { publicKey } = useWallet();
  const {
    isTransactionDone,
    updateIsTransactionDone,
    transactionAmount,
    updateTransactionAmount,
  } = useSolpress();
  const { addSuccessAlert, addErrorAlert, addInfoAlert } = useAlert();
  const [transactionStarted, setTransactionStarted] = useState(false);
  const [orderAmount, setOrderAmount] = useState(0);
  const [isAwaitingPayment, setAwaitingPayment] = useState<"waiting" | "done" | "idle">("idle")

  const recipientKey = useMemo(() => getSolpressGlobalVars().to_public_key, []);

  const referenceKey = useMemo(() => Keypair.generate().publicKey, [])

  useEffect(() => {
    // console.log("PK", publicKey);
    if (publicKey) {
      addSuccessAlert(__("Wallet connected successfully"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);


  // Check every 0.5s if the transaction is completed
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        if (isAwaitingPayment !== "waiting") return
        // Check if there is any transaction for the reference
        const signatureInfo = await findReference(connection, referenceKey, { finality: 'confirmed' })
        // Validate that the transaction has the expected recipient, amount and SPL token
        const isValid = await validateTransfer(
          connection,
          signatureInfo.signature,
          {
            recipient: new PublicKey(recipientKey),
            amount: BigNumber(orderAmount),
            splToken: getKINTokenKey(),
            reference: referenceKey,
          },
          { commitment: 'confirmed' }
        ).catch(err => console.log(err))

        if (!isValid) return
        updateTransactionAmount(orderAmount);
        setSignatureCookie(signatureInfo.signature);
        updateIsTransactionDone();

        setTransactionStarted(false);
        WooCommerceService.enableOtherPaymentMethods();
        WooCommerceService.enableCheckoutFormInputs();

        WooCommerceService.triggerWCOrder();
        setAwaitingPayment("done")


      } catch (e) {
        if (e instanceof FindReferenceError) {
          // No transaction found yet, ignore this error
          return;
        }
        if (e instanceof ValidateTransferError) {
          // Transaction is invalid
          console.error('Transaction is invalid', e)
          return;
        }
        console.error('Unknown error', e)
      }
    }, 5000)


    let timer1 = setTimeout(() => {
      clearInterval(interval)
    }, 30000);


    return () => {
      clearInterval(interval)
      clearTimeout(timer1);
    }
  }, [connection, isAwaitingPayment, orderAmount, recipientKey, referenceKey, updateIsTransactionDone, updateTransactionAmount])



  type isQrArgs = "qr" | "popup";

  const triggerSendTransaction = useCallback(async (isQr: isQrArgs ) => {
    try {
      if (!publicKey) throw new WalletNotConnectedError();
      if (!recipientKey) return;
      if (!referenceKey) return;

      setTransactionStarted(true);
      WooCommerceService.disableOtherPaymentMethods();
      WooCommerceService.disableCheckoutFormInputs();

      // Validating WC checkout form
      WooCommerceService.validateWCCheckoutForm();

      const { getAPIOrderAmount } = new SolpressAPI();
      // console.log(referenceKey.toString(), recipientKey)
      getAPIOrderAmount()
        .then(async (amount) => {
          setOrderAmount(amount)
          const urlParams: TransferRequestURLFields = {
            recipient: new PublicKey(recipientKey),
            splToken: getKINTokenKey(),
            amount: BigNumber(amount),
            reference: referenceKey,
            label: document.querySelector('title')?.textContent || "none",
            message: document.querySelector('td.product-name')?.textContent || "none",
          }

          // Encode the params into the format shown
          const url = encodeURL(urlParams)

          const qr = createQR(url, 512, 'transparent')

          if (qrRef.current) {
            qrRef.current.innerHTML = ''
          }

          if (qrRef.current && amount > 0 && isQr === "qr") {

            qr.append(qrRef.current)
            setAwaitingPayment("waiting")
          }

          
          if (isQr === "popup") {
            const { recipient, amount: orderAmount, reference, memo } = parseURL(url) as TransferRequestURL;

            /**
             * Create the transaction with the parameters decoded from the URL
             */
            const tx = await createTransfer(connection, publicKey, { recipient, amount: orderAmount!, reference: referenceKey, splToken:  getKINTokenKey() });
  
            /**
             * Send the transaction to the network
             */
            await window.solana.signAndSendTransaction(tx);
  
            setAwaitingPayment("waiting")
          }


        })
        .catch(err => console.log(err))


      return

    } catch (err: any) {
      console.log(err);
      console.log(err.stack);
      addErrorAlert(err.message || err.toString());
    } finally {
      setTransactionStarted(false);
      WooCommerceService.enableOtherPaymentMethods();
      WooCommerceService.enableCheckoutFormInputs();
    }
  }, [addErrorAlert, connection, publicKey, recipientKey, referenceKey]);

  // JSX
  const payButtonJSX =
    publicKey && !isTransactionDone ? (
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
  const successMessageJSX =
    isTransactionDone && transactionAmount ? (
      <TransactionSuccess amount={transactionAmount} />
    ) : null;

  return (
    <section>
      <Header />
      <div ref={qrRef} />
      {payButtonJSX}
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
    setCookie(getSolpressGlobalVars().signature_storage, signature, 1)
  }

}

export default Payment;
