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
import { prepareWagmiHinkal } from "@gurge/sdk/providers/prepareWagmiHinkal";
import { prepareTronHinkal } from "@gurge/sdk/providers/prepareTronHinkal";
import { TRON_CHAIN_ID } from "../constants/tron-chain.constants";
import { Wallet, useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { AdapterState } from "@tronweb3/tronwallet-abstract-adapter";
import toast from "react-hot-toast";
import { Hinkal } from "@gurge/sdk";

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

  const { setHinkal, setChainId, setDataLoaded } = useAppContext();

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const tronWallets = useMemo(
    () => wallets.filter((w) => w.state !== AdapterState.NotFound),
    [wallets],
  );

  const finalize = useCallback(
    (hinkal: Hinkal<unknown>, chainId: number) => {
      setHinkal(hinkal);
      setShieldedAddress(hinkal.getShieldedPublicKey());
      setChainId(chainId);
      setDataLoaded(true);
      onHide();
    },
    [setHinkal, setShieldedAddress, setChainId, setDataLoaded, onHide],
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
    [setIsConnecting, config, finalize],
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
          { tronChainOverride: TRON_CHAIN_ID },
        );
        finalize(hinkal, TRON_CHAIN_ID);
      } catch (err) {
        toast.error(`Tron wallet connection failed: ${err || "Unknown error"}`);
      } finally {
        setConnectingId(null);
        setIsConnecting?.(false);
      }
    },
    [finalize, setIsConnecting],
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
            isMobile ? connector.name === "WalletConnect" : true,
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
      </div>
    </Modal>
  );
};
