import { ERC20Token, getAmountInToken } from '@hinkal/react-hooks';
import { useEffect, useState } from 'react';

interface SwapBalanceDisplayProps {
  token?: ERC20Token;
  onBalanceChange?: (balance: bigint) => void;
}

export const SwapBalanceDisplay = ({ token, onBalanceChange }: SwapBalanceDisplayProps) => {
  const [balance, setBalance] = useState(0n);
  const { tokenBalances } = useHinkalBalances();
  useEffect(() => {
    const newBalance =
      tokenBalances.find((tokenBalance) => tokenBalance.token.erc20TokenAddress === token?.erc20TokenAddress)
        ?.balance || 0n;
    setBalance(newBalance);
  }, [tokenBalances, token]);
  useEffect(() => {
    onBalanceChange?.(balance);
  }, [balance, onBalanceChange]);

  return <p className="px-3 mr-[15px]">Balance: {Number(token ? getAmountInToken(token, balance) : 0).toFixed(4)}</p>;
};
