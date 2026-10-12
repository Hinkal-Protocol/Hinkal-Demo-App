import { TokenBalanceWithUsd } from "@hinkal/common";
import { Token } from "../types";
import { isSameTokenAddress } from "./token.utils";

export const getShieldedBalance = (
  balances: TokenBalanceWithUsd[],
  token: Token | undefined,
) => {
  if (!token) return undefined;
  const match = balances.find((b) =>
    isSameTokenAddress(b.erc20Address, token.erc20TokenAddress, token.chainId),
  );
  return match;
};

/**
 * Returns the shielded (in-app) balance in wei for the given token, or 0n if
 * the token has no shielded balance.
 */
export const getShieldedBalanceWei = (
  balances: TokenBalanceWithUsd[],
  token: Token | undefined,
): bigint => {
  const match = getShieldedBalance(balances, token);
  return match ? BigInt(match.balance) : 0n;
};
