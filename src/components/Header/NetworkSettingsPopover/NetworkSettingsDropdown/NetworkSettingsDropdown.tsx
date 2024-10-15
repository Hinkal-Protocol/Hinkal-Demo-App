import toast from 'react-hot-toast';
import { networkLogos } from '../../../../constants';
import { NetworkDropdownItem } from './NetworkDropdownItem';

interface NetworkSettingsDropdownProps {
  close: () => void;
}

export const NetworkSettingsDropdown = ({ close }: NetworkSettingsDropdownProps) => {
  const { networkList, switchNetwork } = useNetworkState({
    onSuccess: () => {
      close();
    },
    onError: () => {
      toast.error('An error occurred during network change.');
      close();
    },
  });
  return (
    <div className="top-20 md:top-2 absolute text-white shadow-2xl border border-bgColor rounded-[12px] child:rounded-xl flex flex-col items-center gap-y-2 p-2 text-[16px] bg-modalBgColor font-pubsans font-medium left-0 md:left-auto right-0">
      {networkList.map(({ chainId, name }, index) => (
        <div key={chainId} className="w-full">
          <NetworkDropdownItem
            chainId={chainId}
            logoPath={chainId in networkLogos ? networkLogos[chainId as keyof typeof networkLogos] : ''}
            networkName={name}
            onSelect={() => switchNetwork?.(chainId)}
          />
          {index !== networkList.length - 1 && <div className="border-b-[1px] mt-1 border-[#36393D] mx-[0.6rem]" />}
        </div>
      ))}
    </div>
  );
};
