import { useContext } from "react";
import { AlertsContext, AlertsContextI } from "../contexts/AlertsProvider";

function useAlert(): AlertsContextI {
  return useContext(AlertsContext);
}

export default useAlert;
