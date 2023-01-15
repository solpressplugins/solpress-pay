import { __ } from "@wordpress/i18n";
import { isSuccessCode, scrollToElement } from "../utils/functions";

declare const window: any;
const $ = window.jQuery;

class WooCommerce {
  transactionIsDone = false;

  /**
   * Validates the WooCommerce form
   */
  validateWCCheckoutForm() {
    const inputs = this.getJQueryFormInputs();

    //@ts-ignore
    if (inputs) inputs.trigger("validate");
    else return true;

    const invalidInput = this.getFirstInvalidInput();

    if (!invalidInput) return true;
    else {
      scrollToElement(invalidInput);

      throw new Error(__("Please complete the form"));
    }
  }

  /**
   * Updates the transaction status.
   */
  updateTransactionStatus(isDone: boolean) {
    this.transactionIsDone = isDone;
  }

  /**
   * Gets the WooCommerce form inputs selected using JQuery to allow for applying
   * JQuery operatons on it.
   */
  getJQueryFormInputs(): [JQuery<HTMLElement>] | undefined {
    const inputs = $("form.woocommerce-checkout input");

    if (inputs && inputs.length) {
      return inputs;
    }
  }

  /**
   * Gets the first invalid field in the WooCommerce form.
   */
  getFirstInvalidInput(): HTMLElement | undefined {
    const invalids = $("form.woocommerce-checkout .woocommerce-invalid");

    if (invalids) return invalids[0];
  }

  /**
   * Subscibes to JQuery AJAX complete event, and excutes the passed callback on
   * each AJAX complete.
   * @param callback A function to be called after the AJAX is completed
   */
  handleAJAXComplete(
    callback: (requestURL: string, statusCode: number, isFailed: boolean) => void
  ) {
    $(document).ajaxComplete(function (event: any, xhr: any, settings: any) {
      const requestURL = settings.url;
      const isFailed = xhr.responseJSON?.result === "failure";

      callback(requestURL, xhr.status, isFailed);
    });
  }

  /**
   * Handles after an WC checkout AJAX request is complete.
   * @param statusCode Response status code
   * @param isFailed Whether checkout failed or not as success code does not mean
   * the checkout succeeds.
   */
  handleCheckoutAJAXComplete(statusCode: number, isFailed: boolean) {
    if (isFailed || !isSuccessCode(statusCode)) {
      this.togglePlaceOrderButton(true);
    }
  }

  /**
   * Disables checkout form inputs.
   */
  disableCheckoutFormInputs() {
    this.toggleCheckoutInputsDisableState(true);
  }

  /**
   * Enables checkout form inputs.
   */
  enableCheckoutFormInputs() {
    this.toggleCheckoutInputsDisableState(false);
  }

  /**
   * Toggles checkout form inputs disable state on/off.
   * @param disabled Whether to disable the inputs or not
   */
  toggleCheckoutInputsDisableState(disabled: boolean) {
    const inputs = this.getJQueryFormInputs();

    if (inputs) {
      for (let input of inputs) {
        //@ts-ignore
        input.disabled = disabled;
      }
    }
  }

  /**
   * Shows/hides the WooCommerce original place order button.
   * @param {boolean} show Whether to show or hide.
   */
  togglePlaceOrderButton(show: boolean) {
    const button = this.getPlaceOrderButton();

    if (button) {
      button.setAttribute("aria-hidden", (!show).toString());
    }
  }

  /**
   * Gets the original place order button of WooCommerce
   */
  getPlaceOrderButton(): HTMLElement | null {
    return document.getElementById("place_order");
  }

  /**
   * Prevent WC form submit before the payment is done.
   */
  preventCheckoutFormSubmit() {
    const formInputs: [JQuery<HTMLElement>] | undefined = this.getJQueryFormInputs();

    if (formInputs) {
      for (let input of formInputs) {
        //@ts-ignore
        input.addEventListener("keydown", this.preventSubmitOnEnter);
      }
    }
  }

  /**
   * Allow WC form submit as the default behavior.
   */
  allowCheckoutFormSubmit() {
    const formInputs: [JQuery<HTMLElement>] | undefined = this.getJQueryFormInputs();

    if (formInputs) {
      for (let input of formInputs) {
        //@ts-ignore
        input.removeEventListener("keydown", this.preventSubmitOnEnter);
      }
    }
  }

  /**
   * Prevent the WC input from triggering the submit on pressing 'Enter' on keyboard
   * if the transaction is not done.
   */
  preventSubmitOnEnter(e: KeyboardEvent) {
    if ((e.key === "Enter" || e.keyCode === 13) && !this.transactionIsDone) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  }

  /**
   * Toggles other payment methods disable state on/off.
   * @param disabled Whether to disable other methods or not.
   */
  toggleOtherPaymentMethodsDisableState(disabled: boolean) {
    const inputs = this.getPaymentMethodsInputs();

    if (inputs) {
      for (let input of inputs) {
        input.disabled = disabled;
      }
    }
  }

  /**
   * Disable payment methods other than Solpress
   */
  disableOtherPaymentMethods() {
    this.toggleOtherPaymentMethodsDisableState(true);
  }

  /**
   * Enables payment methods other than Solpress
   */
  enableOtherPaymentMethods() {
    this.toggleOtherPaymentMethodsDisableState(false);
  }

  /**
   * Triggers the WooCommerce order by clicking the WooCommerce place order button.
   */
  triggerWCOrder() {
    const placeOrderButton = this.getWooCommercePlaceOrderButton();

    if (placeOrderButton) {
      setTimeout(() => {
        placeOrderButton.click();
      }, 1000);
    }
  }

  /**
   * Checks whether the AJAX completed is a checkout request.
   */
  isCheckoutAction(requestURL: string) {
    return requestURL && requestURL.indexOf("wc-ajax=checkout") >= 0;
  }

  /**
   * Gets the original place order button of WooCommerce
   */
  getWooCommercePlaceOrderButton(): HTMLElement | null {
    return document.getElementById("place_order");
  }

  /**
   * Gets payment methods radio input
   */
  getPaymentMethodsInputs(): NodeListOf<HTMLInputElement> | null {
    return document.querySelectorAll(".payment_methods input[name='payment_method'][type='radio']");
  }
}

export default new WooCommerce();
