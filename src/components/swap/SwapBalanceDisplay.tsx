import { ERC20Token, getAmountInToken } from "valtest-com-try-new-build-v";
import { useEffect, useState } from "react";

interface SwapBalanceDisplayProps {
  token?: ERC20Token;
  onBalanceChange?: (balance: bigint) => void;
}

export const SwapBalanceDisplay = ({
  token,
  onBalanceChange,
}: SwapBalanceDisplayProps) => {
  const [balance, setBalance] = useState(0n);

  return <p className="px-3 mr-[15px]">Balance:</p>;
};
