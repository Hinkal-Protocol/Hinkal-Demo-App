import { ERC20Token, TokenBalance } from "@hinkal/common";

/**
 * Returns the shielded (in-app) balance in wei for the given token, or 0n if
 * the token has no shielded balance.
 */
export const getShieldedBalanceWei = (
  balances: TokenBalance[],
  token: ERC20Token | undefined,
): bigint => {
  if (!token) return 0n;
  const match = balances.find(
    (b) =>
      b.token.erc20TokenAddress.toLowerCase() ===
      token.erc20TokenAddress.toLowerCase(),
  );
  return match ? BigInt(match.balance) : 0n;
};
