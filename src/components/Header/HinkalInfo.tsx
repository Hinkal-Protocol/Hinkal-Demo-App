import { Popover } from "@headlessui/react";
import { WalletSettingsPopover } from "./WalletSettingsPopover/WalletSettingsPopover";
import { NetworkSettingsBody } from "./NetworkSettingsPopover/NetworkSettingsBody";

export const HinkalInfo = ({
  shieldedAddress,
}: {
  shieldedAddress?: string;
}) => {
  return (
    <div className="flex justify-center items-center mt-5 md:mt-0 font-pubsans font-medium">
      <div className="relative flex gap-4">
        <Popover>{NetworkSettingsBody}</Popover>
        <WalletSettingsPopover shieldedAddress={shieldedAddress} />
      </div>
    </div>
  );
};
