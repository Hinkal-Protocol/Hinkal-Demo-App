import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiConfig } from 'wagmi';
import App from './App';
import { PopoverDimStoreContextProvider } from './popover/PopoverDimStore';
import { wagmiClient } from './wagmi.config';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <HinkalContextProvider isSandboxMode>
        <HinkalTransactionContextProvider>
          <PopoverDimStoreContextProvider>
            <App />
          </PopoverDimStoreContextProvider>
        </HinkalTransactionContextProvider>
      </HinkalContextProvider>
    </WagmiConfig>
  </React.StrictMode>,
);
