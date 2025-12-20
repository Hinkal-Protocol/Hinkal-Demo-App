import { ERC20Token, getAmountInToken } from "@sabaaa1/common";
import { useEffect, useState } from "react";
import { useAppContext } from "../../AppContext";

interface SwapBalanceDisplayProps {
  token?: ERC20Token;
  onBalanceChange?: (balance: bigint) => void;
}

export const SwapBalanceDisplay = ({
  token,
  onBalanceChange,
}: SwapBalanceDisplayProps) => {
  const { balances } = useAppContext();
  const [balance, setBalance] = useState(0n);

  useEffect(() => {
    if (!token) {
      setBalance(0n);
      if (onBalanceChange) onBalanceChange(0n);
      return;
    }

    const tokenBalance = balances.find(
      (b) => b.token.erc20TokenAddress === token.erc20TokenAddress
    );

    const newBalance = tokenBalance?.balance ?? 0n;
    setBalance(newBalance);
    if (onBalanceChange) onBalanceChange(newBalance);
  }, [token, balances]);

  const displayBalance = token
    ? Number(getAmountInToken(token, balance)).toFixed(6)
    : "0.0000";

  return <p className="px-3 mr-[15px]">Balance: {displayBalance}</p>;
};
