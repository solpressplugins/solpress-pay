const $ = jQuery;

/**
 * Gets the original place order button of WooCommerce
 * @returns {HTMLButtonElement}
 */
export function getWooCommercePlaceOrderButton() {
  return document.getElementById("place_order");
}

/**
 * Gets the connect wallet button
 * @returns {HTMLButtonElement}
 */
export function getConnectWalletButton() {
  return document.getElementById("solpress-connect-wallet");
}

/**
 * Gets the pay with Solpress button.
 * @returns {HTMLButtonElement}
 */
export function getPayButton() {
  return document.getElementById("solpress-place-order");
}

/**
 * Gets the Phantom application link.
 * @returns {HTMLAnchorElement}
 */
export function getPhantomLink() {
  return document.getElementById("solpress-phantom-link");
}

/**
 * Gets the pay with Solpress radio input.
 * @returns {HTMLInputElement}
 */
export function getPayWithSolanaInput() {
  return document.getElementById("payment_method_wc_solpress_solana");
}

/**
 * Gets the transaction error element, this element is used instead of
 * error alert if the error message is long.
 */
export function getTransactionError() {
  return document.getElementById("solpress-transaction-error");
}

/**
 * Gets the transaction error element content wrapper.
 */
export function getTransactionErrorContent() {
  return document.getElementById("solpress-transaction-error-content");
}

/**
 * Gets the pay button loader.
 */
export function getPayButtonLoader() {
  return document.getElementById("solpress-place-order-loader");
}

/**
 * Gets the info header of Solpress payment.
 */
export function getInfoHeader() {
  return document.getElementById("solpress-header");
}

/**
 * Gets the Solpress payment controls wrapper section.
 */
export function getSolpressContainer() {
  return document.getElementById("solpress-payment-container");
}

/**
 * Gets the transaction success element, where the transaction is done message
 * should persist when a transaction is made successfully.
 */
export function getTransactionSuccess() {
  return document.getElementById("solpress-transaction-success");
}

/**
 * Gets the transaction value wrapping element located in
 * the transaction success element.
 */
export function getTransactionValueWrapper() {
  return document.getElementById("solpress-transaction-value");
}

/**
 * Gets the WooCommerce form inputs selected using JQuery to allow for applying
 * JQuery operatons on it.
 */
export function getJQueryFormInputs() {
  const inputs = $("form.woocommerce-checkout input");

  if (inputs && inputs.length) {
    return inputs;
  }
}

/**
 * Gets the first child element of the template.
 * @param {string | HTMLTemplateElement} templateId or template element
 * @returns
 */
export function getTemplateContents(temp) {
  const template = typeof temp === "string" ? document.getElementById(temp) : temp;

  if (template && template.content) {
    return template.content.cloneNode(true).firstElementChild;
  }
}
