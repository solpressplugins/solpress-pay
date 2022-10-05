import { __ } from "@wordpress/i18n";

function MobileMessage() {
  return (
    <p className="solpress__header__warning solpress__mobile-msg">
      {__("If mobile, please use your wallet browser or QR code.")}
    </p>
  );
}

export default MobileMessage;
