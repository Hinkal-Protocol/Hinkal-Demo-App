
import { mediaUrls } from '../../constants';
import { Spinner } from '../Spinner';

export enum NotificationBarMode {
  Loading = 'loading',
  Success = 'success',
  Error = 'error',
}

interface NotificationBarProps {
  notificationTitle: string;
  transactionHash?: string;
  mode?: NotificationBarMode;
  isOpen: boolean;
  wrapperStyle?: string;
  onHide: () => void;
}

export const NotificationBar = ({
  mode,
  transactionHash,
  notificationTitle,
  isOpen,
  wrapperStyle,
  onHide,
}: NotificationBarProps) => {
  const { selectedNetwork } = useHinkalContext();
  const currentChainId = selectedNetwork?.chainId;
  return (
    <div
      className={`absolute p-4 rounded-[6px] bg-[#353535] flex items-center gap-x-4 ${
        isOpen ? 'opacity-[1] translate-y-[0%] ' : 'bg-red-400 opacity-[0] translate-y-[-200%] hidden'
      } transition-all duration-500 ${wrapperStyle} `}
    >
      {mode === NotificationBarMode.Loading && <Spinner styleSize="!w-8 !h-8" />}
      {mode === NotificationBarMode.Success && <i className="bi bi-check-circle-fill text-green-500 text-[30px] " />}
      {mode === NotificationBarMode.Error && <i className="bi bi-x-circle-fill text-red-500 text-[30px] " />}

      <div className="">
        <p className="text-[16px] text-white">{notificationTitle}</p>
        {transactionHash?.length === 66 ? (
          <a
            href={`${
              currentChainId === chainIds.sepolia ? mediaUrls.SEPOLIA_SCAN : mediaUrls.POLY_SCAN
            }tx/${transactionHash}`}
            target="_blank"
            rel="noreferrer"
            className="text-[14px] text-[#94febf]"
          >
            View on {currentChainId === chainIds.sepolia ? 'etherscan' : 'polygonscan'}
          </a>
        ) : (
          <></>
        )}
      </div>
      <button type="button" onClick={onHide} className="ml-5 text-[25px] cursor-pointer">
        <i className="bi bi-x text-[26px] hover:text-[#acaaaa]" />{' '}
      </button>
    </div>
  );
};
