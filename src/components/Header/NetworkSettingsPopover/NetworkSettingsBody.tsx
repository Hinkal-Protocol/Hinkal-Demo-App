import { Popover } from "@headlessui/react";
import { useEffect, useState } from "react";
import VectorDown from "../../../assets/VectorDown.svg";
import { networkLogos } from "../../../constants";
import { NetworkSettingsDropdown } from "./NetworkSettingsDropdown";
import { EthereumNetwork } from "@hinkal/common";
import { useAppContext } from "../../../AppContext";

type NetworkSettingsBodyProps = {
  open: boolean;
};
export const NetworkSettingsBody = ({ open }: NetworkSettingsBodyProps) => {
  const { hinkal } = useAppContext();
  const currentNetwork = hinkal.getSelectedNetwork();

  const [selectedNetwork, setSelectedNetwork] = useState<
    EthereumNetwork | undefined
  >(currentNetwork);

  useEffect(() => {
    setSelectedNetwork(currentNetwork);
  }, [currentNetwork]);

  const logoPath =
    selectedNetwork && selectedNetwork.chainId in networkLogos
      ? networkLogos[selectedNetwork.chainId as keyof typeof networkLogos]
      : "";

  return (
    <>
      <Popover.Button
        as="button"
        type="button"
        className="rounded-[12px] text-white font-semibold flex items-center gap-2 cursor-pointer duration-500 px-3 min-[375px]:px-4 py-[0.875rem] text-base bg-[#2c2a2a] relative z-20"
      >
        {!selectedNetwork && (
          <i className="bi bi-exclamation-triangle text-white" />
        )}

        {logoPath && (
          <img src={logoPath} alt="Logo" className="w-[20px] h-[20px]" />
        )}

        <div>{selectedNetwork?.name || "Unsupported"}</div>
        <div className={`hidden min-[375px]:block ${open ? "rotate-180" : ""}`}>
          <VectorDown />
        </div>
      </Popover.Button>
      <Popover.Panel className="md:relative z-20">
        {({ close }) => (
          <NetworkSettingsDropdown
            close={close}
            setSelectedNetwork={setSelectedNetwork}
          />
        )}
      </Popover.Panel>
    </>
  );
};
