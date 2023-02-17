import { PublicKey } from "@solana/web3.js";
import SolpressVar, { Env } from "../types/SolpressVars";
import TokenAddress from "../types/TokenAddress";

declare const window: any;

// sets a cookie 
export function setCookie(name: string,value: any,days: number) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export function getSolpressGlobalVars(): SolpressVar {
  return window.solpress_payment || {};
}

/**
 * Checkes whether we are in test mode or not depending on a wp global variable.
 */
export function isTestMode(): boolean {
  return getSolpressGlobalVars().test_mode === Env.Test;
}

/**
 * Scrolls element into view.
 */
export function scrollToElement(element: HTMLElement) {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
    });
  }
}

/**
 * Checks if the returned status code is not an error code.
 */
export function isSuccessCode(statusCode: number) {
  if (!isNaN(statusCode)) {
    return statusCode < 400 && statusCode > 199;
  }
}

/**
 * Creates a promise that will resolve after the passed time.
 * @param {number} time Time to wait before resolve in milliseconds
 * @returns {Promise<void>}
 */
export function sleep(time: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, time));
}


  /**
   * Gets the address for USDC or a fake token for testing.
   */
export function getUSDCTokenAddress() {
    return isTestMode() ? TokenAddress.Dummy : TokenAddress.USDC;
}

  /**
   * Gets the public key USDC as default or the saved custom SPL token if available.
   * It returns undefined if Sols address is saved as a custom token.
   */
export function getSplTokenKey() {
    const globalVars = getSolpressGlobalVars() 
    let publicKey: string | undefined = (
        globalVars.custom_spl_token && 
        globalVars.custom_spl_token?.length > 0 &&
        globalVars.custom_spl_enabled !== "no"
      )
      ? globalVars.custom_spl_token : getUSDCTokenAddress()
    
    if (publicKey !== "So11111111111111111111111111111111111111112") {
      // publicKey = undefined
      return new PublicKey( 
        publicKey
        );
    }
    
  }


/**
 * Gets the custom classes.
 */
export function getCustomBtnClasses() {
    const {custom_qr_btn_class, custom_pay_btn_class} = getSolpressGlobalVars() 
  
    return {
      custom_qr_btn_class,
      custom_pay_btn_class
    }
  }