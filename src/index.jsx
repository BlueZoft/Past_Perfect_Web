import React from "react";
// Import createRoot from react-dom/client
import { createRoot } from "react-dom/client";
import "./index.css";
import { I18nProvider } from "./i18n";
import App from "./App";

// Create root element
const root = createRoot(document.getElementById("root"));

// Render app using root.render
root.render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
);
