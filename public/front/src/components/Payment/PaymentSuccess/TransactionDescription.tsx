import { __ } from "@wordpress/i18n";

function TransactionDescription({ amount = 0 }: { amount: number }) {
  return (
    <p className="solpress__payment-control__sucess__desc">
      {__("Transaction with")}
      <span className="solpress__payment-control__sucess__amount-value-wrapper text-med">
        <span
          id="solpress-transaction-value"
          className="solpress__payment-control__sucess__amount-value"
        >
          {" "}
          {__(amount.toString())}
        </span>
        <span className="solpress__payment-control__sucess__amount-value-unit"> {__("USDC")} </span>
      </span>
      {__("is made successfully")}
    </p>
  );
}

export default TransactionDescription;
