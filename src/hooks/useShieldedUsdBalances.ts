import { useMemo } from "react";
import { useAppContext } from "../AppContext";
import { getAmountInToken } from "../utils/amount.utils";
import { findToken } from "../utils/token.utils";
import { Token } from "../types";

export interface BalanceItem {
  token: Token;
  balanceWei: bigint;
  amount: number;
  usdValue: number;
}

/** Builds display rows from SDK private balances (usd values already included). */
export const useShieldedUsdBalances = () => {
  const { chainBalances, erc20List } = useAppContext();

  const isLoading = chainBalances.some(
    (balance) => balance.isUsdValueLoading || balance.isBalanceLoading,
  );

  const items = useMemo<BalanceItem[]>(() => {
    return chainBalances
      .filter((balance) => balance.balance > 0n)
      .map((balance) => {
        const token = findToken(erc20List, balance.erc20Address);
        if (!token) return null;

        return {
          token,
          balanceWei: balance.balance,
          amount: Number(getAmountInToken(token, balance.balance)),
          usdValue: balance.usdValue ?? 0,
        };
      })
      .filter((item): item is BalanceItem => item !== null)
      .sort((a, b) => b.usdValue - a.usdValue);
  }, [chainBalances, erc20List]);

  const totalUsd = useMemo(
    () => items.reduce((sum, item) => sum + item.usdValue, 0),
    [items],
  );

  return { items, totalUsd, isLoading };
};
