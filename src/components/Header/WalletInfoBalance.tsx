import { TokenBalance, getAmountInToken } from "@hinkal/common";
import { useMemo } from "react";

interface WalletInfoBalanceProps {
  tokenBalance: TokenBalance;
}

const formatBalance = (amount: number): string => {
  if (amount > 0 && amount < 0.0001) return "< 0.0001";
  return String(Math.trunc(amount * 10000) / 10000);
};

export const WalletInfoBalance = ({ tokenBalance }: WalletInfoBalanceProps) => {
  const amount = useMemo(
    () => Number(getAmountInToken(tokenBalance.token, tokenBalance.balance)),
    [tokenBalance.token, tokenBalance.balance],
  );

  return (
    <div className="flex items-center space-x-4">
      <div>
        <img
          src={tokenBalance.token.logoURI}
          alt="tokenIcon"
          className="w-[26px]"
        />
      </div>
      <div>
        <p className="text-white text-[18px] font-semibold">
          {formatBalance(amount)} {tokenBalance.token.symbol}
        </p>
      </div>
    </div>
  );
};
