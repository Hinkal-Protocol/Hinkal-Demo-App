import { useSwitchNetwork } from 'wagmi';
import { Spinner } from '../../../Spinner';

interface NetworkDropdownItemProps {
  chainId: number;
  logoPath?: string;
  networkName: string;
  onSelect: () => void;
}

export const NetworkDropdownItem = ({ chainId, logoPath, networkName, onSelect }: NetworkDropdownItemProps) => {
  const { isLoading, pendingChainId } = useSwitchNetwork({
    onError(err) {
      // eslint-disable-next-line no-console
      console.error(err);
    },
  });

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={onSelect}
      className={'py-1 px-2 hover:bg-[#4f4f4f] w-full md:w-[220px] flex flex-col'}
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex pb-1 flex-1 items-center justify-between">
          <div className="flex gap-x-2 items-center">
            {logoPath && <img src={logoPath} alt="Logo" className="w-[20px] h-[20px]" />}
            <span>{networkName}</span>
          </div>
          {isLoading && chainId === pendingChainId ? <Spinner /> : <></>}
        </div>
      </div>
      {isLoading && chainId === pendingChainId && <p className="text-[12px] text-[#aaabac] ">Approve in wallet</p>}
    </button>
  );
};
