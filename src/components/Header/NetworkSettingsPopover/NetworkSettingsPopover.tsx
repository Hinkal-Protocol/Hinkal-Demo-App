import { Popover } from '@headlessui/react';
import { NetworkSettingsBody } from './NetworkSettingsBody';

export const NetworkSettingsPopover = () => {
  return <Popover>{NetworkSettingsBody}</Popover>;
};
