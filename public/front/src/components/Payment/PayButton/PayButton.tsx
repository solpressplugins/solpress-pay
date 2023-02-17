import Loader from "./Loader";
import solanaPayLogo from "../../../images/solana-sol-logo.svg";
import { __ } from "@wordpress/i18n";
import { getCustomBtnClasses } from "../../../utils/functions";

interface PayButtonI {
  isLoading: boolean;
  sendTransaction: () => void;
  isQr: "qr" | "popup"
}



function PayButton({ isLoading, sendTransaction, isQr }: PayButtonI) {
  const {custom_pay_btn_class, custom_qr_btn_class} = getCustomBtnClasses()
  if (isQr === "popup") {
    return (
      <button
        disabled={isLoading}
        onClick={sendTransaction}
        type="button"
        aria-hidden="true"
        className={`solpress__payment-control solpress__payment-control--btn solpress__payment-control__place-order ${custom_pay_btn_class}`}
      > 
        {__("Complete here with")}
        <img
          className="solpress__payment-control__place-order-image"
          src={solanaPayLogo}
          alt={__("Solana")}
          title={__("Solana")}
        />
        {__("Pay")}
        {isLoading ? <Loader /> : null}
    </button>)
  }

  if (isQr === "qr") {
    return (<button
      disabled={isLoading}
      onClick={sendTransaction}
      type="button"
      aria-hidden="true"
      className={`solpress__payment-control solpress__payment-control--btn solpress__payment-control__place-order qr-btn ${custom_qr_btn_class}`}
    >
      {__("Scan QR to use")}
      <img
        className="solpress__payment-control__place-order-image"
        src={solanaPayLogo}
        alt={__("Solana")}
        title={__("Solana")}
      />
      {__("Pay")}
      {isLoading ? <Loader /> : null}
    </button>)
  }  

  return <p>No Option Returned</p>
}

export default PayButton;
