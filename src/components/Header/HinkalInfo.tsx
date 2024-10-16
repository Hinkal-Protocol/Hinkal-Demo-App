import { NetworkSettingsPopover } from "./NetworkSettingsPopover/NetworkSettingsPopover";
import { WalletSettingsPopover } from "./WalletSettingsPopover/WalletSettingsPopover";

export const HinkalInfo = ({
  shieldedAddress,
}: {
  shieldedAddress?: string;
}) => {
  return (
    <div className="flex justify-center items-center mt-5 md:mt-0 font-pubsans font-medium">
      <div className="relative flex gap-4">
        <NetworkSettingsPopover />
        <WalletSettingsPopover shieldedAddress = {shieldedAddress}/>
      </div>
    </div>
  );
};
