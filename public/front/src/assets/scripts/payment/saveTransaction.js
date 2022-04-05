const SAVE_TRANSACTION_NAME = "solpressTransaction";

/**
 * Saves the transaction info locally in the browser, so that if the order is not done
 * in WooCommerce and the page was refreshed the transaction persists.
 * @param {number} amountUI
 * @param {string} memo
 * @param {string} signature
 */
export function saveTransactionLocally(amountUI, memo, signature) {
  localStorage.setItem(
    SAVE_TRANSACTION_NAME,
    JSON.stringify({ amountUI, memo, signature, date: Date.now() })
  );
}

/**
 * Remove the saved transaction.
 */
export function removeSavedTransactionLocally() {
  localStorage.removeItem(SAVE_TRANSACTION_NAME);
}

/**
 * Gets the saved transaction info.
 * @returns {{amountUI: number, date: number, memo: string, signature: string} | null }
 */
export function getLocallySavedTransaction() {
  const transaction = localStorage.getItem(SAVE_TRANSACTION_NAME);
  return transaction ? JSON.parse(transaction) : null;
}

/**
 * Checks if the saved transaction has expired, and it expires in these situations:
 * - After one day of saving the transaction.
 * @param {number} date Date time stamp in ms
 * @param {number} amountUI Order amount
 */
export function isExpiredTransaction(date, amountUI) {
  return isExpiredTransactionDate(date);
}

/**
 * Checks if the saved transaction date expired or not, and it expires after 1day.
 * @param {number} dateTimeStamp Date time stamp in ms
 * @returns {boolean}
 */
export function isExpiredTransactionDate(dateTimeStamp) {
  //86400000 = 1000ms * 60s * 60min * 24hours => 1day
  return Math.abs(Date.now() - dateTimeStamp) > 86400000;
}
