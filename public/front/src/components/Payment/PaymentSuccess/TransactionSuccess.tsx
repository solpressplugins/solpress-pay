import { __ } from "@wordpress/i18n";
import SuccessIcon from "./SuccessIcon";
import TransactionDescription from "./TransactionDescription";

function TransactionSuccess({ amount }: { amount: number }) {
  return (
    <div
      className="solpress__payment-control solpress__payment-control__sucess"
      aria-hidden="true"
      role="alert"
    >
      <SuccessIcon />
      <h3 className="solpress__payment-control__sucess__heading">{__("Transaction Done")}</h3>
      <TransactionDescription amount={amount} />
    </div>
  );
}

export default TransactionSuccess;
