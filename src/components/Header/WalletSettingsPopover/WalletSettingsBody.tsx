import { Popover } from '@headlessui/react';
import { useEffect } from 'react';
import VectorDown from '../../../assets/VectorDown.svg';
import { usePopoverDimStore } from '../../../hooks';
import { shortenAddress } from '../../../utils/shortenAddress';
import { WalletInfoDropDown } from '../WalletInfoDropDown';

type WalletSettingsBodyProps = {
  open: boolean;
};

export const WalletSettingsBody = ({ open }: WalletSettingsBodyProps) => {
  const { shieldedAddress } = useHinkalContext();
  const { updatePopoverStatus } = usePopoverDimStore();
  useEffect(() => {
    updatePopoverStatus({ id: 'WalletInfoPopover', status: open });
  }, [open, updatePopoverStatus]);
  return (
    <>
      <Popover.Button
        as="button"
        type="button"
        className="flex flex-row gap-2 items-center border-[2px] border-solid border-[#624BFF] rounded-xl text-white text-base py-3 px-4 relative z-20"
      >
        <span>{shieldedAddress ? shortenAddress(shieldedAddress) : ''}</span>

        <div className={`hidden min-[375px]:block ${open ? 'rotate-180' : ''}`}>
          <VectorDown />
        </div>
      </Popover.Button>
      <Popover.Panel className="md:relative z-20">
        <WalletInfoDropDown />
      </Popover.Panel>
    </>
  );
};
