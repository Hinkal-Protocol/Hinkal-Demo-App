import { Token } from "../types";

interface FeeDisplayProps {
  fee: bigint | undefined;
  isFeeLoading: boolean;
  selectedToken?: Token;
}

export const FeeDisplay = ({
  fee,
  isFeeLoading,
  selectedToken,
}: FeeDisplayProps) => {
  if (fee === undefined || !selectedToken) return null;

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
