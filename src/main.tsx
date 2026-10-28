import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import AlertModalProvider from "./components/ui/AlertModalProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AlertModalProvider><App /></AlertModalProvider>
  </StrictMode>
);
