import { providers } from "ethers";
import { Dispatch, SetStateAction, useCallback } from "react";
import { isMobile } from "react-device-detect";
import { Connector, useConnect } from "wagmi";
import coinbaseLogo from "../assets/coinbaseWalletLogo.png";
import metamaskLogo from "../assets/metamaskWalletLogo.png";
import walletconnectLogo from "../assets/walletconnectWalletLogo.png";
import { Modal } from "./Modal";
import { Spinner } from "./Spinner";
import { ProviderAdapter } from "../data-structures";
import { useAppContext } from "../AppContext";

interface ChooseWalletProps {
  isOpen: boolean;
  onHide: () => void;
  setShieldedAddress: Dispatch<SetStateAction<string | undefined>>;
}

export const ChooseWallet = ({
  isOpen,
  onHide,
  setShieldedAddress,
}: ChooseWalletProps) => {
  const { connectors, pendingConnector } = useConnect();

  const { hinkal, setChainId } = useAppContext();

  const handleSelectConnector = useCallback(
    async (connector: Connector<providers.Provider>) => {
      const providerAdapter = new ProviderAdapter(connector);
      await hinkal.initProviderAdapter(connector, providerAdapter);
      await hinkal.initUserKeys();

      setShieldedAddress(hinkal.userKeys.getShieldedPublicKey());
      setChainId(hinkal.getCurrentChainId());
      await hinkal.resetMerkle();

      console.log("new chain id", hinkal.getSelectedNetwork());
      console.log("new hinkal", { hinkal });
      onHide();
    },
    []
  );

  return (
    <Modal
      xBtn
      xBtnAction={onHide}
      isOpen={isOpen}
      styleProps="md:w-[30%] md:ml-[5%] !bg-white rounded-[10px] "
      stylePropsBg=" bg-[#000000b2] "
      xBtnStyleProps="text-black font-black"
    >
      <h1 className="font-[500] text-2xl p-5">Select Wallet</h1>
      <div className="p-5 pb-10 flex flex-col items-center gap-y-5 ">
        {connectors
          .filter((connector) => {
            if (isMobile) return connector.name === "WalletConnect";
            return true;
          })
          .map((connector) => (
            <button
              className="bg-modal px-4 py-2 min-w-[180px] w-[80%] rounded-lg border-[2.5px] border-[#f0f0f0] hover:border-[#9c9c9c] font-bold duration-150 flex items-center justify-center gap-x-3"
              type="button"
              disabled={!connector.ready}
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
              {!connector.ready && "(not installed)"}
              {"isSigningIn" && connector.id === pendingConnector?.id && (
                <span>
                  {" "}
                  <Spinner />
                </span>
              )}
            </button>
          ))}
      </div>
    </Modal>
  );
};
