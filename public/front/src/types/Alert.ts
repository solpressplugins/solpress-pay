enum Alert {
  Success = "success",
  Info = "info",
  Warning = "warning",
  Error = "error",
}

export interface AlertI {
  id: string;
  type: Alert;
  content: string;
}

export default Alert;
