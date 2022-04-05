import { Connection, PublicKey, TransactionSignature, clusterApiUrl } from "@solana/web3.js";
import { parseURL, createTransaction } from "@solana/pay";

import { DUMMY_TOKEN_KEY, TESTING_CLUSTER, MAIN_CLUSTER, USDC_TOKEN_KEY } from "./constants";
import { validateAccounts } from "./validateAccounts";
import { valiateTransSignature } from "./validateTransSignature";
import { getAPITotalAmount } from "../api/api";
import { getWPLocalizedText } from "../utils/functions";
import { WP_LOCLIZED_TEXT, PAYMENT_STEPS } from "../utils/enums";
import { validateWCCheckoutForm } from "./validateWCCheckoutForm";
import {
  getLocallySavedTransaction,
  isExpiredTransaction,
  removeSavedTransactionLocally,
} from "./saveTransaction";

import {
  getJQueryFormInputs,
  getPayWithSolanaInput,
  getWooCommercePlaceOrderButton,
} from "../ui/element-getters";
import {
  hideSolanaControls,
  toggleConnectWalletButton,
  toggleInfoHeader,
  togglePhantomLink,
  togglePayButton,
  togglePayButtonLoader,
  toggleTransactionError,
  toggleWooCommerceOriginalControls,
  showTransactionSuccess,
} from "../ui/togglers";
import { Alert, createErrorAlert, createInfoAlert, createSuccessAlert } from "../ui/Alert";
import { removePayButton, setTransactionValue } from "../ui/element-updaters";
import { awaitTransactionSignatureConfirmation } from "./confirmTransaction";

let SOLANA;
let IS_PHANTOM;
let paymentStep = PAYMENT_STEPS.CONNECT_WALLET;
let lastPaymentAmount;

window.onload = function () {
  SOLANA = window.solana;
  IS_PHANTOM = SOLANA && SOLANA.isPhantom ? true : false;

  initSolanaOnFirstLoad();
  setEventListeners();
};

/**
 * Sets the current payment setp.
 * @param {PAYMENT_STEPS.CONNECT_WALLET | PAYMENT_STEPS.PAY | PAYMENT_STEPS.DONE} step
 */
function setPaymentStep(step) {
  paymentStep = step;
}

/**
 * Gets the address token for USDC or a fake token for testing.
 * @returns {string} USDC address token.
 */
export function getUSDCTokenKey() {
  return isTestMode() ? DUMMY_TOKEN_KEY : USDC_TOKEN_KEY;
}

/**
 * Gets a Solana cluster.
 */
export function getClusterURL() {
  return isTestMode()
    ? clusterApiUrl(TESTING_CLUSTER)
    : window.solpress.network_url
    ? window.solpress.network_url
    : clusterApiUrl(MAIN_CLUSTER);
}

/**
 * Gets the order memo.
 */
export function getMemo() {
  return window.solpress ? window.solpress.memo : "";
}

/**
 * Checkes whether we are in test mode or not depending on a wp global variable.
 */
function isTestMode() {
  return window.solpress && window.solpress.test_mode === "1";
}

/**
 * Initializes solana markup & functionality on 1st load, takning into account
 * saved transactions for uncompleted orders if found.
 */
function initSolanaOnFirstLoad() {
  const savedTransaction = getLocallySavedTransaction();

  if (savedTransaction) {
    /**
     * If expired, remove the saved transaction and initialize solana normally,
     * otherwise mark the transaction aleady done.
     */
    if (isExpiredTransaction(savedTransaction.date, savedTransaction.amountUI)) {
      removeSavedTransactionLocally();
      initSolana();
    } else {
      handleAlreadyPaidOrder(savedTransaction);
    }
  } else {
    initSolana();
  }
}

/**
 * Handle setup for already paid order on first page load.
 * @param {{amountUI: number, date: number, memo: string, signature: string}}
 */
function handleAlreadyPaidOrder({ amountUI, date, memo, signature }) {
  lastPaymentAmount = amountUI;
  setPaymentStep(PAYMENT_STEPS.DONE);
  createSuccessAlert(
    `${getWPLocalizedText(WP_LOCLIZED_TEXT.PAID_ORDER_PART_1)} ${new Date(
      date
    ).toLocaleDateString()}${getWPLocalizedText(WP_LOCLIZED_TEXT.PAID_ORDER_PART_2)}`
  );
  removePayButton();
  setTransactionValue(amountUI);
  setSignatureCookie(signature);
  setMemo(memo);

  if (isPayWithSolana()) {
    handleAlreadyStartedPaymentProcess();
  } else {
    showTransactionSuccess();
  }
}

/**
 * Sets the momo passed to be the current momo instead of the WP set one.
 * @param {string} memo
 */
function setMemo(memo) {
  if (window.solpress && window.solpress.memo) {
    window.solpress.memo = memo;
  }
}

/**
 * Initialize paying with Solana if payment with Solana is checked.
 */
export function initSolana() {
  if (isPayWithSolana()) {
    handleChoosingSolanaPayment();
  }
}

/**
 * Sets event listeners needed for taking actions.
 */
function setEventListeners() {
  window.addEventListener("change", handlePaymentChoiceChange);
  window.addEventListener("click", connectWallet);
  window.addEventListener("click", triggerSolanaPay);
  window.addEventListener("click", Alert.dismiss);

  preventSubmitBeforePayment();
}

/**
 * Connects to a wallet.
 * @param {MouseEvent} e
 */
function connectWallet(e) {
  if (e.target.id === "solpress-connect-wallet") {
    connectToPhantom();
  }
}

/**
 * Disconnect wallet.
 */
async function disconnectWallet() {
  if (SOLANA) {
    await SOLANA.disconnect();
  }
}

/**
 * Pay with Solana.
 */
async function triggerSolanaPay(e) {
  if (e.target.id === "solpress-place-order-click-layer") {
    if (!SOLANA.isConnected) {
      await connectToPhantom();
    }

    const isValid = validateWCCheckoutForm();

    if (!isValid) {
      handleAfterTransError(null, getWPLocalizedText(WP_LOCLIZED_TEXT.INVALID_WC_CHECKOUT_FORM));
      return;
    }

    if (SOLANA.isConnected) {
      togglePayButtonLoader(true);
      toggleTransactionError(false);
      sendTransaction();
    }
  }
}

/**
 * Triggers the WooCommerce order by clicking the WooCommerce place order button.
 */
function triggerWCOrder() {
  const placeOrderButton = getWooCommercePlaceOrderButton();

  if (placeOrderButton) {
    placeOrderButton.click();
  }
}

/**
 * Handles the change in payment choice from and to Solana method.
 */
function handlePaymentChoiceChange() {
  if (isPayWithSolana()) {
    handleChoosingSolanaPayment();
  } else {
    handleNotChoosingSolanaPayment();
  }
}

/**
 * Checks if the user has chosen to pay with Solana or not.
 */
function isPayWithSolana() {
  const input = getPayWithSolanaInput();
  return input && input.checked;
}

/**
 * Handles after the user has chosen to pay using Solana.
 */
function handleChoosingSolanaPayment() {
  // Transaction is already done
  if (transactionIsDone()) {
    handleAlreadyStartedPaymentProcess();
  } else {
    handleNotStartedPaymentProcess();
  }
}

/**
 * Handles choosing solana after the payment process is already done.
 * - Shows transaction done success message.
 * - Sets the last paid amount in the success message.
 * - Shows info header.
 * - Shows WooCommerce 'Place Order' button.
 */
function handleAlreadyStartedPaymentProcess() {
  if (lastPaymentAmount !== undefined) {
    setTransactionValue(lastPaymentAmount);
  }

  toggleInfoHeader(true);
  showTransactionSuccess();
  toggleWooCommerceOriginalControls(true);
}

/**
 * Handles setup for not already paid orders.
 */
function handleNotStartedPaymentProcess() {
  toggleWooCommerceOriginalControls(false);

  if (IS_PHANTOM !== undefined) {
    if (IS_PHANTOM) {
      showSolanaPaymentControl();
    } else {
      togglePhantomLink(true);
    }
  }
}

/**
 * Shows Solana payment control, such as phantom link or connect wallet button.
 */
function showSolanaPaymentControl() {
  if (!SOLANA) return;

  toggleConnectWalletButton(!SOLANA.isConnected);
  togglePayButton(SOLANA.isConnected);
  toggleInfoHeader(true);
}

/**
 * Handle after the user has choosen another option than paying with Solana
 */
function handleNotChoosingSolanaPayment() {
  toggleWooCommerceOriginalControls(true);
  hideSolanaControls();

  if (transactionIsDone()) {
    showTransactionSuccess();
  }
}

/**
 * Create transaction to Solana
 */
async function createSolanaTransaction() {
  if (!SOLANA || !getPayerPublicKey()) return;

  const connection = createConnection();

  // Validating accounts
  const isValidAccounts = await handleValidatingAccounts(connection);
  if (!isValidAccounts) return;

  // Getting order amount
  const orderAmount = await getOrderAmount();

  if (isNaN(orderAmount)) return;

  // Creating transaction url
  const { recipient, amount, splToken, reference, memo, url } = createURL(
    getRecipientPublicKey(),
    orderAmount
  );

  try {
    const transaction = await createTransaction(
      connection,
      getPayerPublicKey(),
      recipient,
      amount,
      {
        reference,
        memo,
        splToken,
      }
    );

    transaction.feePayer = getPayerPublicKey();
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    return { transaction, connection, amount, splToken, reference, amountUI: orderAmount, memo };
  } catch (err) {
    handleAfterTransError(err);
  }
}

/**
 * If at any point the transaction is failed, this should be used to
 * - display the error message as an alert if the message is short, or as an error
 *   message if long.
 * - Remove the pay button loader.
 * @param {Error?} err
 * @param {string?} customMessage
 */
function handleAfterTransError(err = null, customMessage = "") {
  const message = err ? err.message || err.toString() || customMessage : customMessage;

  createErrorAlert(message);
  togglePayButtonLoader(false);
}

/**
 * Handles validating recipient and payer accounts.
 * @param {Connection} connection
 */
async function handleValidatingAccounts(connection) {
  const { isValid, recipientAcc, payerAcc } = await validateAccounts(
    connection,
    getRecipientPublicKey(),
    getPayerPublicKey()
  );

  if (!isValid) {
    if (!recipientAcc || !recipientAcc.isValid) {
      handleAfterTransError(null, getWPLocalizedText(WP_LOCLIZED_TEXT.RECIPIENT_ACC_NOT_FOUND));
    }

    if (!payerAcc || !payerAcc.isValid) {
      handleAfterTransError(null, getWPLocalizedText(WP_LOCLIZED_TEXT.PAYER_ACC_NOT_FOUND));
    }
  }

  return isValid;
}

/**
 * Creat connection with a Solana cluster.
 */
function createConnection() {
  const NETWORK = getClusterURL();
  return new Connection(NETWORK);
}

/**
 * Creates solana pay URL
 * @param {string} recipientKey
 * @returns Parsed URL
 * @link https://docs.solanapay.com/spec#specification
 */
function createURL(recipientKey, usdcAmount) {
  const usdcQuery = `&spl-token=${getUSDCTokenKey()}`;
  const memoQuery = `&memo=${getMemo()}`;

  const url = `solana:${recipientKey.toString()}?amount=${usdcAmount}${usdcQuery}&reference=${recipientKey}${memoQuery}`;

  return { ...parseURL(url), url };
}

/**
 * Gets the WP order amount.
 * @returns {number | -1}
 */
async function getOrderAmount() {
  try {
    const amount = await getAPITotalAmount();
    return amount;
  } catch (errorMessage) {
    handleAfterTransError(null, errorMessage);
  }
}

/**
 * Gets recipient account publick key
 * @returns {PublicKey | null}
 */
function getRecipientPublicKey() {
  return window.solpress?.to_public_key ? new PublicKey(window.solpress.to_public_key) : null;
}

/**
 * Gets payer account publick key from the wallet.
 * @returns {PublicKey | null}
 */
function getPayerPublicKey() {
  return SOLANA ? SOLANA.publicKey : null;
}

/**
 * Creats then sends the transaction.
 */
async function sendTransaction() {
  try {
    const res = await createSolanaTransaction();

    if (!res) return;

    const { transaction, connection, amount, splToken, reference, amountUI, memo } = res;

    if (!transaction) return;

    let signed = await SOLANA.signTransaction(transaction);
    let signature = await connection.sendRawTransaction(signed.serialize());

    if (signature) {
      createInfoAlert(getWPLocalizedText(WP_LOCLIZED_TEXT.SENDING_TRANSACTION));

      const isConfirmed = await confirmSignature(connection, signature);

      handleTransactionValidation(
        connection,
        signature,
        amount,
        splToken,
        reference,
        amountUI,
        memo,
        isConfirmed
      );
    }
  } catch (err) {
    console.log(err);
    handleAfterTransError(err);
  }
}

/**
 * Handle validating sent transaction.
 * @param {Connection} connection
 * @param {TransactionSignature} signature
 * @param {PublicKey} recipient
 * @param {BigInt} amount
 * @param {PublicKey} splToken
 * @param {number} amountUI
 * @param {string} memo
 * @param {boolean} retry
 */
async function handleTransactionValidation(
  connection,
  signature,
  amount,
  splToken,
  reference,
  amountUI,
  memo,
  retry
) {
  const { isValid } = await valiateTransSignature(
    connection,
    signature,
    getRecipientPublicKey(),
    amount,
    splToken,
    reference,
    retry
  );

  if (isValid) {
    handleValidatedTransaction(signature, amountUI, memo);
  } else {
    handleAfterTransError(
      null,
      `${getWPLocalizedText(WP_LOCLIZED_TEXT.TRANSACTION_NOT_FOUND)} ${signature}`
    );
  }
}

/**
 * Sets signature as a cookie.
 * @param {TransactionSignature} signature
 */
function setSignatureCookie(signature = "") {
  if (window.Cookies && window.solpress && window.solpress.signature_storage) {
    window.Cookies.set(window.solpress.signature_storage, signature);
  }
}

/**
 * Handle after transaction validation is done.
 * @param {TransactionSignature} signature
 * @param {number} amountUI
 * @param {string} memo
 */
function handleValidatedTransaction(signature, amountUI, memo) {
  lastPaymentAmount = amountUI;

  // saveTransactionLocally(amountUI, memo, signature);
  setSignatureCookie(signature);
  setTransactionValue(amountUI);
  setPaymentStep(PAYMENT_STEPS.DONE);
  disconnectWallet();

  setTimeout(() => {
    createSuccessAlert(getWPLocalizedText(WP_LOCLIZED_TEXT.TRANSACTION_CREATED));
    setTimeout(() => {
      removePayButton();
      showTransactionSuccess();

      setTimeout(() => {
        triggerWCOrder();
      }, 500);
    }, 2000);
  }, 2000);
}

/**
 * Prevent WC form submit before the payment is done.
 */
function preventSubmitBeforePayment() {
  const formInputs = getJQueryFormInputs();

  if (formInputs) {
    for (let input of formInputs) {
      input.addEventListener("keydown", preventSubmitOnEnter);
    }
  }
}

/**
 * Prevent the WC input from triggering the submit on pressing 'Enter' on keyboard
 * if the transaction is not done.
 * @param {KeyboardEvent} e
 */
function preventSubmitOnEnter(e) {
  const solanaChecked = isPayWithSolana();
  const transactionDone = transactionIsDone();

  if ((e.key === "Enter" || e.keyCode === 13) && solanaChecked && !transactionDone) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
}

/**
 * Checks if the transaction has already been made or not.
 */
function transactionIsDone() {
  return paymentStep === PAYMENT_STEPS.DONE;
}

/**
 * Confirm signature of a transaction.
 * @param {Connection} connection
 * @param {string} signature
 */
async function confirmSignature(connection, signature) {
  const failedMessage = getWPLocalizedText(WP_LOCLIZED_TEXT.CONFIRMATION_FAILED);
  try {
    const timoutMinutes = 2;
    const res = await awaitTransactionSignatureConfirmation(
      signature,
      1000 * 60 * timoutMinutes,
      connection
    );

    if (res && !res.err && !res.timeout) {
      createSuccessAlert(getWPLocalizedText(WP_LOCLIZED_TEXT.TRANSACTION_CONFIRMED));
      return true;
    } else throw new Error(failedMessage);
  } catch (err) {
    createErrorAlert(failedMessage);

    return false;
  }
}

/**
 * Connects to Phantom wallet.
 * @returns {boolean} whether the connection succeeded or failed
 */
async function connectToPhantom() {
  if (!SOLANA) {
    toggleConnectWalletButton(false);
    togglePhantomLink(true);
    return false;
  }

  try {
    await SOLANA.connect();
    // debugger;
    createSuccessAlert(getWPLocalizedText(WP_LOCLIZED_TEXT.WALLET_CONNECTED));
    toggleConnectWalletButton(false);
    togglePayButton(true);
    setPaymentStep(PAYMENT_STEPS.PAY);

    return true;
  } catch (err) {
    console.log(err);
    handleAfterTransError(err);
    setPaymentStep(PAYMENT_STEPS.CONNECT_WALLET);
    return false;
  }
}
