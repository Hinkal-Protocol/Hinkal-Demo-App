import React from "react";
import ReactDOM from "react-dom/client";
import { WagmiConfig } from "wagmi";
import App from "./App";
import { getWagmiConfig } from "./wagmi.config";
import { AppContextProvider } from "./AppContext";
import { preProcessing } from "valtest-com-try-new-build-v";
import zkProofWorkerURL from 'valtest-com-try-new-build-v/assets/zkProofWorkerLauncher-Bpgoyahd?worker&url';
import snarkjsWorkerURL from 'valtest-com-try-new-build-v/assets/snarkjsWorkerLauncher-C2z99iR1?worker&url';
import utxoWorkerURL from 'valtest-com-try-new-build-v/assets/utxoWorkerLauncher-2jAmcwEA?worker&url';

(window as any).HinkalConfig = {
  zkProofWorkerURL,
  snarkjsWorkerURL,
  utxoWorkerURL,
}
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
