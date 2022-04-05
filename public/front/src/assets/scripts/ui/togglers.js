import {
  getConnectWalletButton,
  getInfoHeader,
  getPhantomLink,
  getPayButton,
  getPayButtonLoader,
  getTransactionError,
  getWooCommercePlaceOrderButton,
  getTransactionSuccess,
} from "./element-getters";

/**
 * Shows/hides the WooCommerce original controls.
 * @param {boolean} show Whether to show or hide.
 */
export function toggleWooCommerceOriginalControls(show) {
  toggleWooCommercePlaceOrderButton(show);
}

/**
 * Shows/hides the WooCommerce original place order button.
 * @param {boolean} show Whether to show or hide.
 */
export function toggleWooCommercePlaceOrderButton(show) {
  const button = getWooCommercePlaceOrderButton();

  if (button) {
    button.setAttribute("aria-hidden", !show);
  }
}

/**
 * Shows/hides the information header.
 * @param {boolean} show Whether to show or hide.
 */
export function toggleInfoHeader(show) {
  const header = getInfoHeader();

  if (header) {
    header.setAttribute("aria-hidden", !show);
  }
}

/**
 * Shows/hides the Solana place order button.
 * @param {boolean} show Whether to show or hide.
 */
export function togglePayButton(show) {
  const button = getPayButton();

  if (button) {
    button.setAttribute("aria-hidden", !show);
  }
}

/**
 * Shows/hides the Solana connect to wallet button.
 * @param {boolean} show Whether to show or hide.
 */
export function toggleConnectWalletButton(show) {
  const button = getConnectWalletButton();

  if (button) {
    button.setAttribute("aria-hidden", !show);
  }

  // Make sure that the link is hidden when the connect button is shown
  if (show) togglePhantomLink(false);
}

/**
 * Shows/hides the place order loaders.
 * @param {boolean} show Whether to show or hide.
 */
export function togglePayButtonLoader(show) {
  const button = getPayButtonLoader();

  if (button) {
    button.setAttribute("loading", show);
  }
}

/**
 * Shows/hides the Phantom link.
 * @param {boolean} show Whether to show or hide.
 */
export function togglePhantomLink(show) {
  const link = getPhantomLink();

  if (link) {
    link.setAttribute("aria-hidden", !show);
  }

  // Make sure that the connect wallet button is hidden when the link is shown
  if (show) toggleConnectWalletButton(false);
}

/**
 * Hides the Solana payment controls.
 */
export function hideSolanaControls() {
  const controls = document.querySelectorAll(".solpress__payment-control");

  if (controls) {
    for (let control of controls) {
      control.setAttribute("aria-hidden", "true");
    }
  }
}

/**
 * Show transaction success
 */
export function showTransactionSuccess() {
  const elem = getTransactionSuccess();

  if (elem) {
    elem.setAttribute("aria-hidden", false);
  }
}

/**
 * Shows/hides the transaction error message.
 * @param {boolean} show Whether to show or hide.
 */
export function toggleTransactionError(show) {
  const errorMessage = getTransactionError();

  if (errorMessage) {
    errorMessage.setAttribute("aria-hidden", !show);
  }
}
