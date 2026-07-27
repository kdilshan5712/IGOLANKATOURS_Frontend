import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.jsx";
import ErrorBoundary from "./components/shared/ErrorBoundary.jsx";
import { PromotionsProvider } from "./context/PromotionsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <PromotionsProvider>
          <App />
        </PromotionsProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);
