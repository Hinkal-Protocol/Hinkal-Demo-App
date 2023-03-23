import { NetworkSettingsPopover } from './NetworkSettingsPopover/NetworkSettingsPopover';
import { WalletSettingsPopover } from './WalletSettingsPopover/WalletSettingsPopover';

export const HinkalInfo = () => {
  return (
    <div className="flex justify-center items-center mt-5 md:mt-0 font-pubsans font-medium">
      <div className="relative flex gap-4">
        <NetworkSettingsPopover />
        <WalletSettingsPopover />
      </div>
    </div>
  );
};
