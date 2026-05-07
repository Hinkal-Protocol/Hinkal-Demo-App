import { ERC20Token } from "@gurg/hi-test";

interface FeeDisplayProps {
  fee: bigint | null;
  isFeeLoading: boolean;
  selectedToken?: ERC20Token;
}

export const FeeDisplay = ({
  fee,
  isFeeLoading,
  selectedToken,
}: FeeDisplayProps) => {
  if (fee === null || !selectedToken) return null;

  return (
    <div className="text-gray-200 text-[12px] pl-[5%] mt-1">
      Fee:{" "}
      {isFeeLoading
        ? "Loading..."
        : `${(Number(fee) / 10 ** (selectedToken.decimals || 18)).toFixed(8)} ${
            selectedToken.symbol
          }`}
    </div>
  );
};
