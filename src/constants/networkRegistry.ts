import { Network } from "../types";
import { chainIds } from "./chains.constants";

export const ALCHEMY_API_KEY = "X4IiEZsSzGOrJq8tzq7Y3";

export const networkRegistry: Record<number, Network> = {
  [chainIds.ethMainnet]: {
    name: "Ethereum",
    chainId: chainIds.ethMainnet,
    fetchRpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [chainIds.arbMainnet]: {
    name: "Arbitrum",
    chainId: chainIds.arbMainnet,
    fetchRpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [chainIds.polygon]: {
    name: "Polygon",
    chainId: chainIds.polygon,
    fetchRpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [chainIds.base]: {
    name: "Base",
    chainId: chainIds.base,
    fetchRpcUrl: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [chainIds.bnbMainnet]: {
    name: "BNB Chain",
    chainId: chainIds.bnbMainnet,
    fetchRpcUrl: `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [chainIds.tempo]: {
    name: "Tempo",
    chainId: chainIds.tempo,
    fetchRpcUrl: "https://rpc.tempo.xyz",
  },
  [chainIds.arcTestnet]: {
    name: "Arc Testnet",
    chainId: chainIds.arcTestnet,
    fetchRpcUrl: `https://arc-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
  },
  [chainIds.tronNile]: {
    name: "Tron Nile",
    chainId: chainIds.tronNile,
    fetchRpcUrl: "https://nile.trongrid.io",
  },
  [chainIds.tronMainnet]: {
    name: "Tron",
    chainId: chainIds.tronMainnet,
    fetchRpcUrl: "https://api.trongrid.io",
  },
  [chainIds.solanaMainnet]: {
    name: "Solana",
    chainId: chainIds.solanaMainnet,
    fetchRpcUrl:
      "https://mainnet.helius-rpc.com/?api-key=54ad9ec9-dad6-41de-b961-e3e8ea7a7188",
  },
};
