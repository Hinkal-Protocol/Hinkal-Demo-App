import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import App from "./App";
import { getWagmiConfig } from "./wagmi.config";
import { AppContextProvider } from "./AppContext";
import { preProcessing } from "@sabaaa1/common";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TronWalletProvider } from "./components/TronWalletProvider";

preProcessing();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <TronWalletProvider>
          <AppContextProvider>
            <App />
          </AppContextProvider>
        </TronWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
