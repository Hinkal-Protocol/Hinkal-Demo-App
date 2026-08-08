import {
  arbitrum,
  mainnet,
  polygon,
  base,
  bsc,
  tempoMainnet,
} from "wagmi/chains";
import { defineChain } from "viem";
import { ALCHEMY_API_KEY } from "./networkRegistry";

// Arc has no wagmi/chains entry, so it is defined locally.
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { name: "USD Coin", symbol: "USDC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [`https://arc-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`],
    },
  },
});

// EVM chains only — Tron and Solana connect through their own adapters.
export const SUPPORTED_CHAINS = [
  mainnet, // 1
  polygon, // 137
  arbitrum, // 42161
  base, // 8453
  bsc, // 56
  tempoMainnet, // 4217
  arcTestnet, // 5042002
] as const;

export const SUPPORTED_CHAIN_IDS: number[] = SUPPORTED_CHAINS.map(
  (chain) => chain.id
);
