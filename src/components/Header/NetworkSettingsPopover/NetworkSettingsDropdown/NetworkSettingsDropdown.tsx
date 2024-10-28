import { NetworkDropdownItem } from "./NetworkDropdownItem";
import { useCallback, useMemo } from "react";
import { networkRegistry } from "valtest-com-try-new-build-v";
import { useAppContext } from "../../../../AppContext";

interface NetworkSettingsDropdownProps {
  close: () => void;
}

export const NetworkSettingsDropdown = ({
  close,
}: NetworkSettingsDropdownProps) => {
  const { hinkal, setChainId } = useAppContext();
  const networkList = useMemo(() => Object.values(networkRegistry), []);

  const switchNetwork = useCallback(
    async (chainId: number) => {
      const network = networkList.find((net) => net.chainId === chainId);
      if (network) {
        await hinkal.switchNetwork(network);
        setChainId(network.chainId);
        close();
      }
    },
    [networkList]
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
