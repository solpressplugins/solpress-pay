import { initSolana } from "./payment/payment";
import { removeSavedTransactionLocally } from "./payment/saveTransaction";
import { toggleWooCommerceOriginalControls } from "./ui/togglers";
import { isSuccessCode } from "./utils/functions";

(($) => {
  $(document).ajaxComplete(function (event, xhr, settings) {
    const requestURL = settings.url;

    if (isCheckoutAction(requestURL)) {
      handleCheckoutAJAXComplete(xhr.status);
    } else {
      // Re init markup, as WC removes and readds it on some AJAX requests
      initSolana();
    }

    /**
     * Handles after WooCommerce place order AJAX completes.
     * @param {string} requestURL Requested URL.
     */
    function handleCheckoutAJAXComplete(statusCode) {
      if (isSuccessCode(statusCode)) {
        handleCheckoutSuccess();
      } else handleCheckoutFailure();
    }

    /**
     * Handles after the checkout success i.e. after WooCommerce place order AJAX
     * completed successfully.
     */
    function handleCheckoutSuccess() {
      removeSavedTransactionLocally();
    }

    /**
     * Handles after the checkout failure i.e. after WooCommerce place order AJAX fails.
     */
    function handleCheckoutFailure() {
      toggleWooCommerceOriginalControls(true);
    }

    /**
     * Checks whether the AJAX completed is a checkout request.
     * @param {string} requestURL
     * @returns {boolean}
     */
    function isCheckoutAction(requestURL) {
      return requestURL && requestURL.indexOf("wc-ajax=checkout") >= 0;
    }
  });
})(jQuery);
