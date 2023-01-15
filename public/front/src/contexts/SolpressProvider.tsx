import { createContext, useEffect, useState } from "react";
import WooCommerceService from "../services/WooCommerce.service";

export const SolpressContext = createContext({
  solpressSelected: false,
  isTransactionDone: false,
  transactionAmount: 0,
  updateIsTransactionDone: () => {},
  updateTransactionAmount: (amount: number) => {},
});

interface SolpressProviderI {
  children: any;
}

declare const window: any;

function SolpressProvider({ children }: SolpressProviderI) {
  const [isSelected, setIsSelected] = useState(false);
  const [isTransactionDone, setIsTransactionDone] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState(0);

  useEffect(() => {
    updateSelected();

    window.addEventListener("change", updateSelected);

    function updateSelected() {
      const selected = isSolpressPaymentSelected();

      window.solpress_isSelected = selected;
      setIsSelected(selected);
    }

    return () => {
      window.removeEventListener("change", updateSelected);
    };
  }, []);

  useEffect(() => {
    WooCommerceService.togglePlaceOrderButton(!window.solpress_isSelected || isTransactionDone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelected]);

  useEffect(() => {
    if (isTransactionDone) {
      WooCommerceService.disableOtherPaymentMethods();
    }
  }, [isTransactionDone]);

  useEffect(() => {

    WooCommerceService.handleAJAXComplete((requestURL, statusCode, isFailed) => {
      if (WooCommerceService.isCheckoutAction(requestURL)) {
        WooCommerceService.handleCheckoutAJAXComplete(statusCode, isFailed);
      } else {
        WooCommerceService.togglePlaceOrderButton(!window.solpress_isSelected || isTransactionDone);
      }
    });

    if (isSelected && !isTransactionDone) {
      WooCommerceService.preventCheckoutFormSubmit();
    }

    return () => {
      WooCommerceService.allowCheckoutFormSubmit();
    };
  }, [isSelected, isTransactionDone]);

  /**
   * Updates transaction done status to true.
   */
  function updateIsTransactionDone() {
    window.solpress_isTransactionDone = true;
    setIsTransactionDone(true);
    WooCommerceService.updateTransactionStatus(true);
  }

  /**
   * Set transaction amount
   */
  function updateTransactionAmount(amount: number) {
    setTransactionAmount(amount);
  }

  return (
    <SolpressContext.Provider
      value={{
        solpressSelected: isSelected,
        isTransactionDone,
        transactionAmount,
        updateIsTransactionDone,
        updateTransactionAmount,
      }}
    >
      {isSelected ? children : null}
    </SolpressContext.Provider>
  );
}

/**
 * Checks whether pay with solpress is selected or not.
 */
function isSolpressPaymentSelected(): boolean {
  const input = document.getElementById("payment_method_wc_solpress_solana") as HTMLInputElement;

  return input ? input.checked : false;
}

export default SolpressProvider;
