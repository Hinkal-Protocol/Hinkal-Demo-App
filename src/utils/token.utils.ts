import { Token } from "../types";

export const isSameTokenAddress = (a?: string, b?: string): boolean =>
  a?.toLowerCase() === b?.toLowerCase();

export const findToken = (
  tokens: Token[],
  erc20Address?: string,
): Token | undefined =>
  tokens.find((token) =>
    isSameTokenAddress(token.erc20TokenAddress, erc20Address),
  );
