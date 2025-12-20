import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { isMobile } from "react-device-detect";
import { useConfig, useConnect, useConnectors } from "wagmi";
import type { Connector } from "wagmi";
import coinbaseLogo from "../assets/coinbaseWalletLogo.png";
import metamaskLogo from "../assets/metamaskWalletLogo.png";
import walletconnectLogo from "../assets/walletconnectWalletLogo.png";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { useAppContext } from "../AppContext";
import { prepareWagmiHinkal } from "@sabaaa1/common/providers/prepareWagmiHinkal";
import toast from "react-hot-toast";

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

  const { setHinkal, setChainId, setDataLoaded } = useAppContext();

  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleSelectConnector = useCallback(
    async (connector: Connector) => {
      try {
        setIsConnecting?.(true);
        setConnectingId(connector.id);
        const hinkal = await prepareWagmiHinkal(connector, config);
        setHinkal(hinkal);
        setShieldedAddress(hinkal.userKeys.getShieldedPublicKey());
        setChainId(hinkal.getCurrentChainId());
        setDataLoaded(true);
        onHide();
      } catch (err) {
        toast.error("Wallet connection failed");
      } finally {
        setConnectingId(null);
        setIsConnecting?.(false);
      }
    },
    [config, setHinkal, setChainId, setShieldedAddress, setDataLoaded, onHide]
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
              {connectingId === connector.id && <Spinner />}
            </button>
          ))}
      </div>
    </Modal>
  );
};
