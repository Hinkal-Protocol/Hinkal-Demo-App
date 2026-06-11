import { useEffect, useMemo, useState } from "react";
import { ERC20Token, getAmountInToken, getTokenPrices } from "@hinkal/common";
import { useAppContext } from "../AppContext";

export interface BalanceItem {
  token: ERC20Token;
  balanceWei: bigint;
  amount: number;
  usdValue: number;
}

/**
 * Fetches USD prices for the user's shielded balances and returns per-token
 * USD values, a total, and a lowercase-address → price map for reuse in
 * token dropdowns. Prices come from `@hinkal/common`'s `getTokenPrices`.
 */
export const useShieldedUsdBalances = () => {
  const { balances, chainId } = useAppContext();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Stable key so the price fetch only re-runs when the token set changes.
  const addressesKey = useMemo(
    () =>
      balances
        .map((b) => b.token.erc20TokenAddress.toLowerCase())
        .sort()
        .join(","),
    [balances],
  );

  useEffect(() => {
    if (!chainId || balances.length === 0) {
      setPrices({});
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    const addresses = balances.map((b) => b.token.erc20TokenAddress);
    getTokenPrices(chainId, addresses)
      .then(({ prices: priceArr }) => {
        if (cancelled) return;
        const map: Record<string, number> = {};
        addresses.forEach((a, i) => {
          map[a.toLowerCase()] = priceArr[i] ?? 0;
        });
        setPrices(map);
      })
      .catch(() => {
        if (!cancelled) setPrices({});
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId, addressesKey]);

  const items = useMemo<BalanceItem[]>(
    () =>
      balances
        .map((b) => {
          const amount = Number(getAmountInToken(b.token, b.balance));
          const price =
            prices[b.token.erc20TokenAddress.toLowerCase()] ?? 0;
          return {
            token: b.token,
            balanceWei: BigInt(b.balance),
            amount,
            usdValue: amount * price,
          };
        })
        .sort((a, b) => b.usdValue - a.usdValue),
    [balances, prices],
  );

  const totalUsd = useMemo(
    () => items.reduce((sum, i) => sum + i.usdValue, 0),
    [items],
  );

  return { items, totalUsd, isLoading, prices };
};
