import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "react";
import MobileMessage from "./MobileMessage";

function Header() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if ("ontouchstart" in document.documentElement || /mobi/i.test(navigator.userAgent)) {
      setIsMobile(true);
      console.log("%cIs Mobile: " + true, "background: black; color: salmon");
    }
  }, []);

  return (
    <header id="solpress-header" className="solpress__header solpress__payment-control">
      <p className="solpress__header__warning">
        <strong>
          {__(
            "Don't close the page until redirected to the order received page or your transaction may be lost."
          )}
        </strong>
      </p>
      {isMobile ? <MobileMessage /> : null}
    </header>
  );
}

export default Header;
