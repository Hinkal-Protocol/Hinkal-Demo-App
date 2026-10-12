import {
  arbitrum,
  mainnet,
  polygon,
  base,
  bsc,
  arc,
  arcTestnet,
  tempoMainnet,
} from "wagmi/chains";

// EVM chains only — Tron and Solana connect through their own adapters.
export const SUPPORTED_CHAINS = [
  mainnet, // 1
  polygon, // 137
  arbitrum, // 42161
  base, // 8453
  bsc, // 56
  arc, // 5042
  tempoMainnet, // 4217
  arcTestnet, // 5042002
] as const;

export const SUPPORTED_CHAIN_IDS: number[] = SUPPORTED_CHAINS.map(
  (chain) => chain.id
);
