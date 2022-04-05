import { ALERT_TYPE } from "../utils/enums";
import { getTemplateContents } from "./element-getters";

export class Alert {
  static COUNT = 0;

  message;
  type;
  element;

  constructor(message, type) {
    this.message = message;
    this.type = type;
  }

  static getAlertsWrapper() {
    return document.getElementById("solpress-alerts");
  }

  static dismiss(e) {
    if (Alert.isDismissButton(e.target)) {
      const alert = Alert.getAlertById(e.target.dataset.toggle);

      if (alert) {
        Alert.hide(alert, e.target);
      }
    }
  }

  static hide(alert, button) {
    alert.classList.add("fade-out");
    alert.addEventListener("transitionend", this.remove);
    button.setAttribute("aria-pressed", "true");
  }

  static remove() {
    this.remove();
  }

  static getAlertById(id) {
    return document.getElementById(id);
  }

  static isDismissButton(target) {
    if (target && target.classList) {
      return target.classList.contains("solpress__alert__dismiss");
    }
  }

  /**
   * @param {HTMLTemplateElement} template Represents the alert type template
   */
  addAlert(template) {
    this.element = this.create(template);

    if (this.element) {
      this.show();
    }
  }

  /**
   * Creates alert element
   */
  create(template) {
    if (!template) return;

    Alert.COUNT++;

    const id = "solpress-alert-" + Alert.COUNT;

    const element = getTemplateContents(template);
    const message = element.querySelector(".solpress__alert__message");
    const dismissBtn = element.querySelector(".solpress__alert__dismiss");

    element.id = id;
    dismissBtn.setAttribute("aria-controls", id);
    dismissBtn.dataset.toggle = id;
    message.textContent = this.message;

    if (this.message.length > 75) {
      element.classList.add("solpress__alert--long");
    }

    return element;
  }

  show() {
    const alertsWrapper = Alert.getAlertsWrapper();
    if (!alertsWrapper || !this.element) return;

    alertsWrapper.appendChild(this.element);
    this.element.classList.add("fade-in");
  }
}

class ErrorAlert extends Alert {
  constructor(message) {
    super(message, ALERT_TYPE.ERROR);
    super.addAlert(ErrorAlert.getTemplate());
  }

  static getTemplate() {
    return document.getElementById("solpress-alert-error");
  }
}

class SuccessAlert extends Alert {
  constructor(message) {
    super(message, ALERT_TYPE.SUCCESS);
    super.addAlert(SuccessAlert.getTemplate());
  }

  static getTemplate() {
    return document.getElementById("solpress-alert-success");
  }
}

class InfoAlert extends Alert {
  constructor(message) {
    super(message, ALERT_TYPE.SUCCESS);
    super.addAlert(InfoAlert.getTemplate());
  }

  static getTemplate() {
    return document.getElementById("solpress-alert-info");
  }
}

/**
 * A factory for creating and showing error alert.
 * @returns {ErrorAlert}
 */
export function createErrorAlert(message) {
  if (!message) return;
  return new ErrorAlert(message);
}

/**
 * A factory for creating and showing success  alert.
 * @returns {SuccessAlert}
 */
export function createSuccessAlert(message) {
  if (!message) return;
  return new SuccessAlert(message);
}

/**
 * A factory for creating and showing info alert.
 * @returns {InfoAlert}
 */
export function createInfoAlert(message) {
  if (!message) return;
  return new InfoAlert(message);
}
