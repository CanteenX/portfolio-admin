import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./app/App";
import { AuthProvider } from "./core/auth/AuthContext";
import { I18nProvider } from "./core/i18n/I18nContext";
import { ThemeProvider, useTheme } from "./core/theme/ThemeContext";

function ThemedApp() {
  const { mode } = useTheme();
  return (
    <div className={mode}>
      <App />
      <Toaster position="bottom-right" theme={mode} richColors />
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing root container");
}

const ROUTER_BASENAME = process.env.PUBLIC_URL || "";

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter basename={ROUTER_BASENAME}>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <ThemedApp />
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
