import { Token } from "../types";
import { isSolanaLike } from "../constants/solana-chain.constants";

export const isSameTokenAddress = (
  a?: string,
  b?: string,
  chainId?: number,
): boolean => {
  if (a === undefined || b === undefined) return a === b;
  if (isSolanaLike(chainId)) return a === b;
  return a.toLowerCase() === b.toLowerCase();
};

export const findToken = (
  tokens: Token[],
  erc20Address?: string,
  chainId?: number,
): Token | undefined =>
  tokens.find((token) =>
    isSameTokenAddress(token.erc20TokenAddress, erc20Address, chainId),
  );
