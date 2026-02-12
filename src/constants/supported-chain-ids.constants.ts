import { arbitrum, mainnet, optimism, polygon, base } from "wagmi/chains";

export const SUPPORTED_CHAINS = [
  mainnet, // 1
  polygon, // 137
  arbitrum, // 42161
  optimism, // 10
  base, // 8453
] as const;

export const SUPPORTED_CHAIN_IDS: number[] = SUPPORTED_CHAINS.map(
  (chain) => chain.id
);
