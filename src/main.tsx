import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import App from "./App";
import { getWagmiConfig } from "./wagmi.config";
import { AppContextProvider } from "./AppContext";
import { preProcessing } from "@hinkal/common";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

preProcessing();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiProvider config={getWagmiConfig()}>
      <QueryClientProvider client={queryClient}>
        <AppContextProvider>
          <App />
        </AppContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
