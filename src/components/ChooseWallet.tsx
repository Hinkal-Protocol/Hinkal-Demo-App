import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from "react";
import { isMobile } from "react-device-detect";
import { useConfig, useConnectors } from "wagmi";
import type { Connector } from "wagmi";
import coinbaseLogo from "../assets/coinbaseWalletLogo.png";
import metamaskLogo from "../assets/metamaskWalletLogo.png";
import walletconnectLogo from "../assets/walletconnectWalletLogo.png";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { useAppContext } from "../AppContext";
import { prepareWagmiHinkal } from "@hinkal/common/providers/prepareWagmiHinkal";
import { prepareTronHinkal } from "@hinkal/common/providers/prepareTronHinkal";
import { prepareSolanaHinkal } from "@hinkal/common/providers/prepareSolanaHinkal";
import { TRON_CHAIN_ID } from "../constants/tron-chain.constants";
import { Wallet, useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { AdapterState } from "@tronweb3/tronwallet-abstract-adapter";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import type { Adapter as SolanaAdapter } from "@solana/wallet-adapter-base";
import { WalletReadyState } from "@solana/wallet-adapter-base";
import { chainIds } from "../constants/chains.constants";
import toast from "react-hot-toast";
import { Hinkal } from "@hinkal/common";

interface ChooseWalletProps {
  isOpen: boolean;
  onHide: () => void;
  setShieldedAddress: Dispatch<SetStateAction<string | undefined>>;
  setIsConnecting?: Dispatch<SetStateAction<boolean>>;
}

export const ChooseWallet = ({
  isOpen,
  onHide,
  setShieldedAddress,
  setIsConnecting,
}: ChooseWalletProps) => {
  const connectors = useConnectors();
  const config = useConfig();
  const { wallets } = useWallet();
  const { wallets: solanaWallets, select: selectSolanaWallet } =
    useSolanaWallet();

  const { setHinkal, setChainId, setDataLoaded } = useAppContext();

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const tronWallets = useMemo(
    () => wallets.filter((w) => w.state !== AdapterState.NotFound),
    [wallets]
  );

  const solanaAdapters = useMemo(
    () =>
      solanaWallets
        .map((w) => w.adapter)
        .filter(
          (adapter) =>
            adapter.readyState === WalletReadyState.Installed ||
            adapter.readyState === WalletReadyState.Loadable
        ),
    [solanaWallets]
  );

  const finalize = useCallback(
    (hinkal: Hinkal<unknown>, chainId: number) => {
      setHinkal(hinkal);
      setShieldedAddress(hinkal.getShieldedPublicKey());
      setChainId(chainId);
      setDataLoaded(true);
      onHide();
    },
    [setHinkal, setShieldedAddress, setChainId, setDataLoaded, onHide]
  );

  const handleSelectConnector = useCallback(
    async (connector: Connector) => {
      try {
        setIsConnecting?.(true);
        setConnectingId(connector.id);
        const hinkal = await prepareWagmiHinkal(connector, config);
        const providerAdapter = hinkal.getProviderAdapter();
        const chainId = providerAdapter.getChainId();
        if (!chainId) throw new Error("Chain id not found");
        finalize(hinkal, chainId);
      } catch (err) {
        toast.error(`Wallet connection failed: ${err || "Unknown error"}`);
      } finally {
        setConnectingId(null);
        setIsConnecting?.(false);
      }
    },
    [setIsConnecting, config, finalize]
  );

  const handleSelectTronAdapter = useCallback(
    async (walletItem: Wallet) => {
      const tronId = `tron-${walletItem.adapter.name}`;
      try {
        setIsConnecting?.(true);
        setConnectingId(tronId);
        await walletItem.adapter.connect();
        const { address } = walletItem.adapter;
        if (!address) throw new Error("Tron address not available");

        const hinkal = await prepareTronHinkal(
          {
            address,
            signerAdapter: walletItem.adapter,
          } as any,
          { tronChainOverride: TRON_CHAIN_ID }
        );
        finalize(hinkal, TRON_CHAIN_ID);
      } catch (err) {
        toast.error(`Tron wallet connection failed: ${err || "Unknown error"}`);
      } finally {
        setConnectingId(null);
        setIsConnecting?.(false);
      }
    },
    [finalize, setIsConnecting]
  );

  const handleSelectSolanaAdapter = useCallback(
    async (adapter: SolanaAdapter) => {
      const solanaId = `solana-${adapter.name}`;
      try {
        setIsConnecting?.(true);
        setConnectingId(solanaId);

        if (!adapter.connected) await adapter.connect();
        const { publicKey } = adapter;
        if (!publicKey) throw new Error("Solana public key not available");

        if (!("signTransaction" in adapter) || !("signMessage" in adapter)) {
          throw new Error(
            `${adapter.name} does not support message/transaction signing`
          );
        }

        const signerAdapter = adapter as SolanaAdapter & {
          signTransaction: (tx: unknown) => Promise<unknown>;
          signAllTransactions: (txs: unknown[]) => Promise<unknown[]>;
          signMessage: (message: Uint8Array) => Promise<Uint8Array>;
        };

        const hinkal = await prepareSolanaHinkal({
          publicKey,
          adapter,
          // TEMP DIAGNOSTICS — surfaces the wallet's real rejection, which the
          // adapter otherwise buries inside WalletSignTransactionError.
          signTransaction: async (tx: unknown) => {
            const anyTx = tx as {
              instructions?: { data?: Uint8Array }[];
              serialize?: (o?: unknown) => Uint8Array;
            };
            /* eslint-disable no-console */
            console.group("[sign] signTransaction");
            console.log("instructions:", anyTx.instructions?.length);
            console.log(
              "instruction data sizes:",
              anyTx.instructions?.map((i) => i.data?.length)
            );
            try {
              const size = anyTx.serialize?.({
                requireAllSignatures: false,
                verifySignatures: false,
              })?.length;
              console.log("serialized tx bytes:", size, "(limit 1232)");
            } catch (e) {
              console.log("serialize failed:", e);
            }
            console.groupEnd();
            try {
              return await signerAdapter.signTransaction(tx);
            } catch (e) {
              console.error("[sign] wallet rejected:", e);
              throw e;
            }
            /* eslint-enable no-console */
          },
          signAllTransactions: (txs: unknown[]) =>
            signerAdapter.signAllTransactions(txs),
          signMessage: async (message: Uint8Array) => ({
            signature: await signerAdapter.signMessage(message),
            publicKey,
          }),
        } as any);

        // Keep the wallet-adapter context in sync with the adapter we connected.
        selectSolanaWallet(adapter.name);
        finalize(hinkal, chainIds.solanaMainnet);
      } catch (err) {
        toast.error(
          `Solana wallet connection failed: ${err || "Unknown error"}`
        );
      } finally {
        setConnectingId(null);
        setIsConnecting?.(false);
      }
    },
    [finalize, setIsConnecting, selectSolanaWallet]
  );

  return (
    <Modal
      xBtn
      xBtnAction={onHide}
      isOpen={isOpen}
      styleProps="md:w-[30%] md:ml-[5%] !bg-white rounded-[10px]"
      stylePropsBg="bg-[#000000b2]"
      xBtnStyleProps="text-black font-black"
    >
      <h1 className="font-[500] text-2xl p-5">Select Wallet</h1>
      <div className="p-5 pb-10 flex flex-col items-center gap-y-5">
        {connectors
          .filter((connector) =>
            isMobile ? connector.name === "WalletConnect" : true
          )
          .map((connector) => (
            <button
              className="bg-modal px-4 py-2 min-w-[180px] w-[80%] rounded-lg border-[2.5px] border-[#f0f0f0] hover:border-[#9c9c9c] font-bold duration-150 flex items-center justify-center gap-x-3"
              type="button"
              disabled={!!connectingId}
              key={connector.id}
              onClick={() => handleSelectConnector(connector)}
            >
              {connector.name === "Coinbase Wallet" && (
                <img
                  src={coinbaseLogo}
                  alt="Logo"
                  className="w-[26px] h-[26px]"
                />
              )}
              {connector.name === "MetaMask" && (
                <img
                  src={metamaskLogo}
                  alt="Logo"
                  className="w-[26px] h-[26px]"
                />
              )}
              {connector.name === "WalletConnect" && (
                <img
                  src={walletconnectLogo}
                  alt="Logo"
                  className="w-[26px] h-[26px]"
                />
              )}
              <span>{connector.name}</span>
              {connectingId === connector.id && (
                <Spinner styleSize="size-5 mr-0" />
              )}
            </button>
          ))}

        {tronWallets.length > 0 && (
          <>
            {tronWallets.map((walletItem) => {
              const tronId = `tron-${walletItem.adapter.name}`;
              return (
                <button
                  className="bg-modal px-4 py-2 min-w-[180px] w-[80%] rounded-lg border-[2.5px] border-[#f0f0f0] hover:border-[#9c9c9c] font-bold duration-150 flex items-center justify-center gap-x-3"
                  type="button"
                  disabled={!!connectingId}
                  key={tronId}
                  onClick={() => handleSelectTronAdapter(walletItem)}
                >
                  {walletItem.adapter.icon && (
                    <img
                      src={walletItem.adapter.icon}
                      alt="Logo"
                      className="w-[26px] h-[26px]"
                    />
                  )}
                  <span>{walletItem.adapter.name} (Tron)</span>
                  {connectingId === tronId && <Spinner />}
                </button>
              );
            })}
          </>
        )}

        {solanaAdapters.length > 0 && (
          <>
            {solanaAdapters.map((adapter) => {
              const solanaId = `solana-${adapter.name}`;
              return (
                <button
                  className="bg-modal px-4 py-2 min-w-[180px] w-[80%] rounded-lg border-[2.5px] border-[#f0f0f0] hover:border-[#9c9c9c] font-bold duration-150 flex items-center justify-center gap-x-3"
                  type="button"
                  disabled={!!connectingId}
                  key={solanaId}
                  onClick={() => handleSelectSolanaAdapter(adapter)}
                >
                  {adapter.icon && (
                    <img
                      src={adapter.icon}
                      alt="Logo"
                      className="w-[26px] h-[26px]"
                    />
                  )}
                  <span>{adapter.name} (Solana)</span>
                  {connectingId === solanaId && <Spinner />}
                </button>
              );
            })}
          </>
        )}
      </div>
    </Modal>
  );
};
