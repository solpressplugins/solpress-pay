import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

function AlertsPortal({ children }: { children: any }) {
  const [elem] = useState(() => {
    const ul = document.createElement("ul");
    ul.classList.add("solpress__alerts__list");
    return ul;
  });

  useEffect(() => {
    const alertsRoot = getAlertsRoot();

    if (alertsRoot) {
      alertsRoot.appendChild(elem);
    }

    return () => {
      if (alertsRoot) {
        alertsRoot.removeChild(elem);
      }
    };
  }, [elem]);

  return ReactDOM.createPortal(children, elem);
}

function getAlertsRoot() {
  return document.getElementById("solpress-alerts-root");
}

export default AlertsPortal;
