import {
  getPayButton,
  getTransactionErrorContent,
  getTransactionValueWrapper,
} from "./element-getters";
import { toggleTransactionError } from "./togglers";

/**
 * Set the transaction error message, the one that shows below the pay button
 * in case the error message is long, not the error alert.
 * @param {string} message
 */
export function setTransactionErrorMessage(message) {
  const content = getTransactionErrorContent();

  if (content) {
    content.textContent = message;

    toggleTransactionError(true);
  }
}

/**
 * Remove the pay button.
 */
export function removePayButton() {
  const button = getPayButton();

  if (button) {
    button.remove();
  }
}

/**
 * Sets the transaction value in the success message after the transaction is done.
 * @param {number} value
 */
export function setTransactionValue(value) {
  const wrapper = getTransactionValueWrapper();

  if (wrapper) {
    wrapper.textContent = value;
  }
}
