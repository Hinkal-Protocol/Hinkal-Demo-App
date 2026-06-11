import { NetworkDropdownItem } from "./NetworkDropdownItem";
import { useCallback, useMemo } from "react";
import { useAppContext } from "../../../../AppContext";
import { SUPPORTED_CHAIN_IDS } from "../../../../constants/supported-chain-ids.constants";
import { networkRegistry } from "../../../../constants/networkRegistry";
import { isTronLike } from "../../../../constants/tron-chain.constants";

interface NetworkSettingsDropdownProps {
  close: () => void;
}

export const NetworkSettingsDropdown = ({
  close,
}: NetworkSettingsDropdownProps) => {
  const { hinkal, chainId, setChainId } = useAppContext();

  const isTronConnection = useMemo(
    () => !!chainId && isTronLike(chainId),
    [chainId],
  );

  const networkList = useMemo(() => {
    if (isTronConnection) {
      return Object.values(networkRegistry).filter(
        (network) => network.chainId === chainId,
      );
    }
    return Object.values(networkRegistry).filter(
      (network) =>
        SUPPORTED_CHAIN_IDS.includes(network.chainId) &&
        !isTronLike(network.chainId),
    );
  }, [isTronConnection, chainId]);

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      try {
        const network = networkList.find(
          (net) => net.chainId === targetChainId,
        );
        if (!network || isTronLike(targetChainId) || !hinkal) return;

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
    <div className="top-20 md:top-2 absolute text-white shadow-2xl border border-bgColor rounded-[12px] child:rounded-xl flex flex-col items-center gap-y-2 p-2 text-[16px] bg-modalBgColor font-pubsans font-medium left-0 md:left-auto right-0">
      {networkList.map(({ chainId, name }, index) => (
        <div key={chainId} className="w-full">
          <NetworkDropdownItem
            chainId={chainId}
            logoPath={""}
            networkName={name}
            onSelect={() => switchNetwork?.(chainId)}
          />
          {index !== networkList.length - 1 && (
            <div className="border-b-[1px] mt-1 border-[#36393D] mx-[0.6rem]" />
          )}
        </div>
      ))}
    </div>
  );
};
