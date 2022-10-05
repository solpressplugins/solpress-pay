import useAlert from "../../hooks/useAlert";
import { AlertI } from "../../types/Alert";
import Alert from "./Alert";

function Alerts() {
  const { alerts } = useAlert();

  const alertsJSX = alerts
    ? alerts.map((alert: AlertI) => {
        return <Alert key={"alert-" + alert.id} {...alert} />;
      })
    : null;

  return <>{alertsJSX}</>;
}

export default Alerts;
