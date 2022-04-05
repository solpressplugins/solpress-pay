import { getWPLocalizedText } from "../utils/functions";
import { WP_LOCLIZED_TEXT } from "../utils/enums";

const $ = jQuery;

export async function getAPITotalAmount() {
  const url = window.solpress.ajax_url;
  const security = window.solpress.security;
  const action = window.solpress.get_total_order;
  const data = { action, security };

  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type: "POST",
      data,
      success: (res) => {
        if (res && res.data && res.data.total !== undefined) {
          resolve(+res.data.total);
        } else {
          reject(getWPLocalizedText(WP_LOCLIZED_TEXT.ORDER_AMOUNT_ERROR));
        }
      },
      error: (err) => {
        reject(getWPLocalizedText(WP_LOCLIZED_TEXT.ORDER_AMOUNT_ERROR));
      },
    });
  });
}
