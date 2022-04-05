/**
 * @enum
 */

export const ALERT_TYPE = {
  SUCCESS: "SUCCESS",
  ERROR: "ERROR",
  WARNING: "WARNING",
  INFO: "INFO",
};

/**
 * @enum
 */

export const WP_LOCLIZED_TEXT = {
  GLOBAL: "global",
  RECIPIENT_ACC_NOT_FOUND: "recipient_acc_not_found",
  PAYER_ACC_NOT_FOUND: "payer_acc_not_found",
  ACCOUNT_NOT_FOUND: "account_not_found",
  ORDER_AMOUNT_ERROR: "order_amount_error",
  TRANSACTION_NOT_FOUND: "transaction_not_found",
  INVALID_WC_CHECKOUT_FORM: "invalid_wc_checkout_form",

  WALLET_CONNECTED: "wallet_connected",
  SENDING_TRANSACTION: "sending_transaction",
  TRANSACTION_CONFIRMED: "transaction_confirmed",
  TRANSACTION_CREATED: "transaction_created",
  PLACING_ORDER: "placing_order",
  PAID_ORDER_PART_1: "paid_order_part_1",
  PAID_ORDER_PART_2: "paid_order_part_2",
  CONFIRMATION_FAILED: "confirmation_failed",
};

/**
 * @enum
 */

export const PAYMENT_STEPS = {
  CONNECT_WALLET: 1,
  PAY: 2,
  DONE: 3,
};
