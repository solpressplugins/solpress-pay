import { createContext, useState } from "react";
import Alert, { AlertI } from "../types/Alert";
import { v4 as uuidv4 } from "uuid";

export interface AlertsContextI {
  alerts: [AlertI] | null;
  addSuccessAlert: (content: string) => void;
  addErrorAlert: (content: string) => void;
  addInfoAlert: (content: string) => void;
  removeAlert: (id: string) => void;
}

//@ts-ignore
export const AlertsContext: React.Context<AlertsContextI> = createContext({
  alerts: null,
  addSuccessAlert: (content: string) => {},
  addErrorAlert: (content: string) => {},
  addInfoAlert: (content: string) => {},
  removeAlert: (id: string) => {},
});

function AlertsProvider({ children }: { children: any }) {
  const [alerts, setAlerts]: [[AlertI] | null, any] = useState(null);

  function getAlertId(): string {
    return uuidv4();
  }

  function addAlert(alert: AlertI) {
    setAlerts((currentAlerts: [AlertI] | null) => {
      return currentAlerts ? [...currentAlerts, alert] : [alert];
    });
  }

  function addSuccessAlert(content: string) {
    addAlert({ type: Alert.Success, content, id: getAlertId() });
  }

  function addErrorAlert(content: string) {
    addAlert({ type: Alert.Error, content, id: getAlertId() });
  }

  function addInfoAlert(content: string) {
    addAlert({ type: Alert.Info, content, id: getAlertId() });
  }

  function removeAlert(id: string) {
    setAlerts((currentAlerts: [AlertI] | null) => {
      if (!currentAlerts) return null;

      const filtered = currentAlerts.filter((alert: AlertI) => {
        return alert.id !== id;
      });

      return filtered.length ? filtered : null;
    });
  }

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        addSuccessAlert,
        addErrorAlert,
        addInfoAlert,
        removeAlert,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
}

export default AlertsProvider;
