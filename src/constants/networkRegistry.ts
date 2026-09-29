import { Network } from "../types";
import { chainIds } from "./chains.constants";

export const networkRegistry: Record<number, Network> = {
  [chainIds.ethMainnet]: {
    name: "Ethereum",
    chainId: chainIds.ethMainnet,
    fetchRpcUrl: "https://ethereum-rpc.publicnode.com",
  },
  [chainIds.arbMainnet]: {
    name: "Arbitrum",
    chainId: chainIds.arbMainnet,
    fetchRpcUrl: "https://arb1.arbitrum.io/rpc",
  },
  [chainIds.optimism]: {
    name: "Optimism",
    chainId: chainIds.optimism,
    fetchRpcUrl: "https://mainnet.optimism.io",
  },
  [chainIds.polygon]: {
    name: "Polygon",
    chainId: chainIds.polygon,
    fetchRpcUrl: "https://polygon.drpc.org",
  },
  [chainIds.base]: {
    name: "Base",
    chainId: chainIds.base,
    fetchRpcUrl: "https://mainnet.base.org",
  },
  [chainIds.arcMainnet]: {
    name: "Arc",
    chainId: chainIds.arcMainnet,
    fetchRpcUrl: "https://rpc.mainnet.arc.io",
  },
  [chainIds.arcTestnet]: {
    name: "Arc Testnet",
    chainId: chainIds.arcTestnet,
    fetchRpcUrl: "https://rpc.testnet.arc.network",
  },
  [chainIds.solanaMainnet]: {
    name: "Solana",
    chainId: chainIds.solanaMainnet,
    fetchRpcUrl: "https://solana-rpc.publicnode.com",
  },
  [chainIds.tronNile]: {
    name: "Tron Nile",
    chainId: chainIds.tronNile,
    fetchRpcUrl: "https://nile.trongrid.io/jsonrpc",
  },
  [chainIds.tronMainnet]: {
    name: "Tron",
    chainId: chainIds.tronMainnet,
    fetchRpcUrl: "https://api.trongrid.io/jsonrpc",
  },
};
