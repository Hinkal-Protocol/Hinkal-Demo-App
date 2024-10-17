import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import App from "./App";
import { getWagmiConfig } from "./wagmi.config";
import { fakeRun } from "./constants";
import { AppContextProvider } from "./AppContext";
import { preProcessing } from "@hinkal/common";

fakeRun();
preProcessing();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppContextProvider>
      <WagmiConfig config={getWagmiConfig()}>
        <App />
      </WagmiConfig>
    </AppContextProvider>
  </React.StrictMode>
);
