import Loader from "./Loader";
import solanaPayLogo from "../../../images/solana-sol-logo.svg";
import { __ } from "@wordpress/i18n";

interface PayButtonI {
  isLoading: boolean;
  sendTransaction: () => void;
}

function PayButton({ isLoading, sendTransaction }: PayButtonI) {
  return (
    <button
      disabled={isLoading}
      onClick={sendTransaction}
      type="button"
      aria-hidden="true"
      className="solpress__payment-control solpress__payment-control--btn solpress__payment-control__place-order"
    >
      {__("Pay with")}
      <img
        className="solpress__payment-control__place-order-image"
        src={solanaPayLogo}
        alt={__("Solana")}
        title={__("Solana")}
      />
      {__("Pay")}
      {isLoading ? <Loader /> : null}
    </button>
  );
}

export default PayButton;
