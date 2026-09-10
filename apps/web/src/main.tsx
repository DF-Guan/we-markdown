import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { StorageProvider } from "./storage/StorageContext";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";
import { registerServiceWorker } from "./services/pwa/pwaService";

// 初始化注册 PWA 原生离线服务
registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <StorageProvider>
        <App />
      </StorageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
