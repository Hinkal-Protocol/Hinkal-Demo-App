import { useSwitchChain } from "wagmi";
import { Spinner } from "../../../Spinner";

interface NetworkDropdownItemProps {
  chainId: number;
  logoPath?: string;
  networkName: string;
  onSelect: () => void;
}

export const NetworkDropdownItem = ({
  chainId,
  logoPath,
  networkName,
  onSelect,
}: NetworkDropdownItemProps) => {
  const { isPending, variables } = useSwitchChain({
    mutation: {
      onError(err) {
        // eslint-disable-next-line no-console
        console.error(err);
      },
    },
  });

  const isCurrentChainPending = isPending && variables?.chainId === chainId;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onSelect}
      className={
        "py-1 px-2 hover:bg-[#4f4f4f] w-full md:w-[220px] flex flex-col"
      }
    >
      <div className="w-full flex items-center justify-between">
        <div className="flex pb-1 flex-1 items-center justify-between">
          <div className="flex gap-x-2 items-center">
            {logoPath && (
              <img src={logoPath} alt="Logo" className="w-[20px] h-[20px]" />
            )}
            <span>{networkName}</span>
          </div>
          {isCurrentChainPending ? <Spinner /> : <></>}
        </div>
      </div>
      {isCurrentChainPending && (
        <p className="text-[12px] text-[#aaabac]">Approve in wallet</p>
      )}
    </button>
  );
};
