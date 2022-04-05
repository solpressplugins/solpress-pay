import { WP_LOCLIZED_TEXT } from "./enums";

/**
 * Gets the localized WP text.
 *
 * @param {WP_LOCLIZED_TEXT | string} key
 * @returns {string}
 */
export function getWPLocalizedText(key) {
  return window.solpress_text ? window.solpress_text[key] || "" : "";
}

/**
 * Scrolls element into view.
 *
 * @param {HTMLElement} element
 */
export function scrollToElement(element) {
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
    });
  }
}

/**
 * Checks if the returned status code is not an error code.
 * @param {number} statusCode
 */
export function isSuccessCode(statusCode) {
  if (!isNaN(statusCode)) {
    return statusCode < 400 && statusCode > 199;
  }
}

/**
 * Creates a promise that will resolve after the passed time.
 * @param {number} time Time to wait before resolve in milliseconds
 * @returns {Promise<void>}
 */
export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
