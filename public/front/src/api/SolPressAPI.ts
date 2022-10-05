import { __ } from "@wordpress/i18n";
import { getSolpressGlobalVars } from "../utils/functions";

declare const window: any;

const $: any = window.jQuery;

export class SolpressAPI {
  async getAPIOrderAmount(): Promise<number> {
    const globalVars = getSolpressGlobalVars();
    const url = globalVars.ajax_url;
    const security = globalVars.security;
    const action = globalVars.get_total_order;
    const data = { action, security };

    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        type: "POST",
        data,
        success: (res: any) => {
          if (res && res.data && res.data.total !== undefined) {
            resolve(+res.data.total);
          } else {
            reject(__("Failed to get order amount"));
          }
        },
        error: (err: any) => {
          reject(__("Failed to get order amount"));
        },
      });
    });
  }
}

export default  new SolpressAPI();
