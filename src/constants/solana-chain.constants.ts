import { chainIds } from "./chains.constants";

export const SOLANA_MAINNET_CHAIN_ID = chainIds.solanaMainnet;
export const SOLANA_LOCALNET_CHAIN_ID = 102;

export const isSolanaLike = (chainId: number | undefined): boolean =>
  chainId === SOLANA_MAINNET_CHAIN_ID || chainId === SOLANA_LOCALNET_CHAIN_ID;

export const SOLANA_NATIVE_MINT = "11111111111111111111111111111111";

export const resolveFeeOverride = <T>(
  chainId: number | undefined,
  feeStructure: T | undefined,
): T | undefined => (isSolanaLike(chainId) ? undefined : feeStructure);
