import { ReactNode, useCallback, useMemo } from "react";
import { WalletProvider } from "@tronweb3/tronwallet-adapter-react-hooks";
import {
  WalletError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import { MetaMaskAdapter } from "@tronweb3/tronwallet-adapter-metamask-tron";
import { OkxWalletAdapter } from "@tronweb3/tronwallet-adapter-okxwallet";
import { TrustAdapter } from "@tronweb3/tronwallet-adapter-trust";

export const TronWalletProvider = ({ children }: { children: ReactNode }) => {
  const adapters = useMemo(
    () => [
      new TronLinkAdapter({
        openUrlWhenWalletNotFound: false,
        checkTimeout: 3000,
        dappName: "Hinkal Demo",
      }),
      new MetaMaskAdapter(),
      new OkxWalletAdapter(),
      new TrustAdapter(),
    ],
    [],
  );

  const onError = useCallback((e: WalletError) => {
    if (e instanceof WalletNotFoundError) return;
    console.error(e);
  }, []);

  return (
    <WalletProvider adapters={adapters} onError={onError} autoConnect={false}>
      {children}
    </WalletProvider>
  );
};
