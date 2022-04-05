import { getJQueryFormInputs } from "../ui/element-getters";
import { scrollToElement } from "../utils/functions";

const $ = jQuery;

/**
 * Validates the WooCommerce form
 */
export function validateWCCheckoutForm() {
  const inputs = getJQueryFormInputs();

  if (inputs) inputs.trigger("validate");
  else return true;

  const invalidInput = getFirstInvalidInput();

  if (!invalidInput) return true;
  else {
    scrollToElement(invalidInput);
    return false;
  }
}

/**
 * Gets the first invalid field in the WooCommerce form.
 * @returns {HTMLInputElement}
 */
function getFirstInvalidInput() {
  const invalids = $("form.woocommerce-checkout .woocommerce-invalid");

  if (invalids) return invalids[0];
}
