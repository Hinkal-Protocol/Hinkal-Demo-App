import {
  isSolanaLike,
  SOLANA_NATIVE_MINT,
} from "./constants/solana-chain.constants";

export const zeroAddress = `0x${"00".repeat(20)}`;

export const getNativeTokenAddress = (chainId: number | undefined): string =>
  isSolanaLike(chainId) ? SOLANA_NATIVE_MINT : zeroAddress;
