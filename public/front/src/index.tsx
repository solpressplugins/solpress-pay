import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./styles/app.scss";

import * as buffer from "buffer";
window.Buffer = buffer.Buffer;

const root = document.getElementById("solpress-payment-root");

// Render the app conditionally
if (root) {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    root
  );
}
