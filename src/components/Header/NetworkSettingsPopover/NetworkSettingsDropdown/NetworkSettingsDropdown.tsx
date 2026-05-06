import { NetworkDropdownItem } from "./NetworkDropdownItem";
import { useCallback, useMemo, useState } from "react";
import { networkRegistry } from "@hinkal/common";
import { useAppContext } from "../../../../AppContext";
import { SUPPORTED_CHAIN_IDS } from "../../../../constants/supported-chain-ids.constants";
import { Spinner } from "../../../Spinner";

interface NetworkSettingsDropdownProps {
  close: () => void;
}

export const NetworkSettingsDropdown = ({
  close,
}: NetworkSettingsDropdownProps) => {
  const [switchingChainId, setSwitchingChainId] = useState<number | null>(null);
  const { hinkal, setChainId, refreshBalances } = useAppContext();

  const networkList = useMemo(
    () =>
      Object.values(networkRegistry).filter((network) =>
        SUPPORTED_CHAIN_IDS.includes(network.chainId),
      ),
    [],
  );

  const switchNetwork = useCallback(
    async (chainId: number) => {
      const network = networkList.find((net) => net.chainId === chainId);
      if (network) {
        setSwitchingChainId(chainId);
        await hinkal.switchNetwork(network);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setChainId(network.chainId);
        setSwitchingChainId(null);
        close();
        await hinkal.resetMerkle();
        await refreshBalances();
      }
    },
    [networkList, hinkal, setChainId, close],
  );

  return (
    <div className="top-20 md:top-2 absolute text-white shadow-2xl border border-bgColor rounded-[12px] child:rounded-xl flex flex-col items-center gap-y-2 p-2 text-[16px] bg-modalBgColor font-pubsans font-medium left-0 md:left-auto right-0">
      {networkList.map(({ chainId, name }, index) => (
        <div key={chainId} className="w-full">
          <button
            type="button"
            disabled={switchingChainId !== null}
            onClick={() => switchNetwork(chainId)}
            className="py-1 px-2 hover:bg-white/10 w-full md:w-[220px] flex items-center justify-between rounded-lg"
          >
            <span>{name}</span>
            {switchingChainId === chainId && (
              <Spinner styleSize="size-5 mr-0" />
            )}
          </button>
          {index !== networkList.length - 1 && (
            <div className="border-b-[1px] mt-1 border-[#36393D] mx-[0.6rem]" />
          )}
        </div>
      ))}
    </div>
  );
};
