import { TokenBalanceWithUsd } from "@gurge/sdk";
import { Token } from "../types";

export const getShieldedBalance = (
  balances: TokenBalanceWithUsd[],
  token: Token | undefined,
) => {
  if (!token) return undefined;
  const match = balances.find(
    (b) =>
      b.erc20Address.toLowerCase() === token.erc20TokenAddress.toLowerCase(),
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
