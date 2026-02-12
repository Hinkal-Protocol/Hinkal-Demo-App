import { Popover } from "@headlessui/react";
import { WalletSettingsBody } from "./WalletSettingsBody";

export const WalletSettingsPopover = ({
  shieldedAddress,
}: {
  shieldedAddress?: string;
}) => {
  return (
    <Popover>
      {({ open }) => (
        <WalletSettingsBody open={open} shieldedAddress={shieldedAddress} />
      )}
    </Popover>
  );
};
