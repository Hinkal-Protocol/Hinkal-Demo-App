import { TokenBalance } from "@gurge/sdk";
import { getAmountInToken } from "../../utils/amount.utils";
import { useAppContext } from "../../AppContext";
import { findToken } from "../../utils/token.utils";
import { useMemo } from "react";

interface WalletInfoBalanceProps {
  tokenBalance: TokenBalance;
}

export const WalletInfoBalance = ({ tokenBalance }: WalletInfoBalanceProps) => {
  const { erc20List } = useAppContext();
  const token = useMemo(
    () => findToken(erc20List, tokenBalance.erc20Address),
    [erc20List, tokenBalance.erc20Address],
  );

  if (!token) return null;

  return (
    <div className="flex items-center space-x-4">
      <div>
        {token.logoURI && (
          <img src={token.logoURI} alt="tokenIcon" className="w-[26px]" />
        )}
      </div>
      <div>
        <p className="text-white text-[18px] font-semibold">
          {Number(getAmountInToken(token, tokenBalance.balance)).toFixed(4)}{" "}
          {token.symbol}
        </p>
      </div>
    </div>
  );
};
