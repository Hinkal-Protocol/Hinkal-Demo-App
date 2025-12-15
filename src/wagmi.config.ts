import {
  arbitrum,
  avalanche,
  bsc,
  hardhat,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";
import { configureChains, createConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { publicProvider } from "wagmi/providers/public";
import { networkRegistry } from "@sabaaa1/common";
const CHAINS = [mainnet, polygon, bsc, arbitrum, optimism, avalanche, hardhat];

export const getWagmiConfig = () => {
  const { chains, publicClient } = configureChains(CHAINS, [
    jsonRpcProvider({
      rpc: (chain) => {
        const networkData = networkRegistry[chain.id];
        return { http: networkData ? networkData.fetchRpcUrl! : "" };
      },
    }),
    publicProvider(),
  ]);
  const metaMaskConnector = new MetaMaskConnector({ chains, options: {} });

  return createConfig({
    autoConnect: false,
    connectors: [metaMaskConnector],
    publicClient,
  });
};
