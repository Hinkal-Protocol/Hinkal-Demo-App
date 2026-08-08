import { NetworkDropdownItem } from "./NetworkDropdownItem";
import { useCallback, useMemo } from "react";
import { useAppContext } from "../../../../AppContext";
import { SUPPORTED_CHAIN_IDS } from "../../../../constants/supported-chain-ids.constants";
import { networkRegistry } from "../../../../constants/networkRegistry";
import { isTronLike } from "../../../../constants/tron-chain.constants";
import { isSolanaLike } from "../../../../constants/solana-chain.constants";

interface NetworkSettingsDropdownProps {
  close: () => void;
}

export const NetworkSettingsDropdown = ({
  close,
}: NetworkSettingsDropdownProps) => {
  const { hinkal, chainId, setChainId } = useAppContext();

  // Tron and Solana wallets cannot switch to an EVM chain, so pin the list to
  // the connected network instead of offering networks the wallet can't reach.
  const isSingleChainConnection = useMemo(
    () => !!chainId && (isTronLike(chainId) || isSolanaLike(chainId)),
    [chainId],
  );

  const networkList = useMemo(() => {
    if (isSingleChainConnection) {
      return Object.values(networkRegistry).filter(
        (network) => network.chainId === chainId,
      );
    }
    return Object.values(networkRegistry).filter(
      (network) =>
        SUPPORTED_CHAIN_IDS.includes(network.chainId) &&
        !isTronLike(network.chainId) &&
        !isSolanaLike(network.chainId),
    );
  }, [isSingleChainConnection, chainId]);

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      try {
        const network = networkList.find(
          (net) => net.chainId === targetChainId,
        );
        if (
          !network ||
          isTronLike(targetChainId) ||
          isSolanaLike(targetChainId) ||
          !hinkal
        )
          return;

        await hinkal.switchNetwork(targetChainId);
        await hinkal.resetMerkle();
        setChainId(network.chainId);
        close();
      } catch (err) {
        console.error("Network switch failed:", err);
      }
    },
    [hinkal, setChainId, close, networkList],
  );

  return (
    <div className="top-20 md:top-2 absolute text-white shadow-2xl border border-bgColor rounded-[12px] child:rounded-xl flex flex-col items-center gap-y-2 p-2 text-[16px] bg-modalBgColor font-generalSans font-medium left-0 md:left-auto right-0">
      {networkList.map(({ chainId, name }, index) => (
        <div key={chainId} className="w-full">
          <NetworkDropdownItem
            chainId={chainId}
            logoPath={""}
            networkName={name}
            onSelect={() => switchNetwork?.(chainId)}
          />
          {index !== networkList.length - 1 && (
            <div className="border-b-[1px] mt-1 border-hinkal-blue-900 mx-[0.6rem]" />
          )}
        </div>
      ))}
    </div>
  );
};
