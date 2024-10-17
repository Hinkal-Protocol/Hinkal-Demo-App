import { Popover } from "@headlessui/react";
import VectorDown from "../../../assets/VectorDown.svg";
import { WalletInfoDropDown } from "../WalletInfoDropDown";
import { shortenAddress } from "../../../utils/shortenAddress";

type WalletSettingsBodyProps = {
  open: boolean;
  shieldedAddress?: string;
};

export const WalletSettingsBody = ({
  open,
  shieldedAddress,
}: WalletSettingsBodyProps) => {
  return (
    <>
      <Popover.Button
        as="button"
        type="button"
        className="flex flex-row gap-2 items-center border-[2px] border-solid border-[#624BFF] rounded-xl text-white text-base py-3 px-4 relative z-20"
      >
        <span>{shortenAddress(shieldedAddress ?? "")}</span>

        <div className={`hidden min-[375px]:block ${open ? "rotate-180" : ""}`}>
          <VectorDown />
        </div>
      </Popover.Button>
      <Popover.Panel className="md:relative z-20">
        <WalletInfoDropDown />
      </Popover.Panel>
    </>
  );
};
