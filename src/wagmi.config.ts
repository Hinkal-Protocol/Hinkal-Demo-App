import {
  arbitrum,
  avalanche,
  bsc,
  hardhat,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";
import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { networkRegistry } from "@sabaaa1/common";

const CHAINS = [
  mainnet,
  polygon,
  bsc,
  arbitrum,
  optimism,
  avalanche,
  hardhat,
] as const;

export const getWagmiConfig = () => {
  const transports = CHAINS.reduce((acc, chain) => {
    const networkData = networkRegistry[chain.id];
    acc[chain.id] = http(networkData?.fetchRpcUrl || undefined);
    return acc;
  }, {} as Record<number, ReturnType<typeof http>>);

  return createConfig({
    chains: CHAINS,
    connectors: [metaMask()],
    transports,
  });
};
