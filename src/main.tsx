import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import App from "./App";
import { getWagmiConfig } from "./wagmi.config";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig config={getWagmiConfig()}>
      <App />
    </WagmiConfig>
  </React.StrictMode>
);
