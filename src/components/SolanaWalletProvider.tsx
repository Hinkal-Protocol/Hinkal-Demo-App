import { ReactNode, useCallback, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletError } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { networkRegistry } from "../constants/networkRegistry";
import { chainIds } from "../constants/chains.constants";

export const SolanaWalletProvider = ({ children }: { children: ReactNode }) => {
  const endpoint = useMemo(
    () => networkRegistry[chainIds.solanaMainnet].fetchRpcUrl,
    []
  );

  const adapters = useMemo(() => [new PhantomWalletAdapter()], []);

  const onError = useCallback((e: WalletError) => {
    // WalletSignTransactionError wraps the wallet's real failure in `error`;
    // logging only the wrapper hides why the wallet refused to sign.
    console.error(e, "cause:", (e as WalletError & { error?: unknown }).error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={adapters} onError={onError} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
};
