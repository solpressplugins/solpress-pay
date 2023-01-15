export enum Env {
  Test = "1",
}

interface SolpressVar {
  active_currency: string;
  ajax_url: string;
  confirm_transaction: string;
  get_total_order: string;
  memo: string;
  order_total: string;
  security: string;
  signature_storage: string;
  test_mode: Env;
  to_public_key: string;
  network_url: string;
  custom_spl_token?: string;
}

export default SolpressVar;
