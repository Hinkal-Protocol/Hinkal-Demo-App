import { Popover } from '@headlessui/react';
import { WalletSettingsBody } from './WalletSettingsBody';

export const WalletSettingsPopover = () => {
  return <Popover>{WalletSettingsBody}</Popover>;
};
