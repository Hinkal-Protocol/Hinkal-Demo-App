import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import App from "./App";
import { getWagmiConfig } from "./wagmi.config";
import { AppContextProvider } from "./AppContext";
import { preProcessing } from "@hinkal/common";

preProcessing();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={getWagmiConfig()}>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </WagmiConfig>
  </React.StrictMode>
);
