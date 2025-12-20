import { http, createConfig } from "wagmi";
import { metaMask } from "wagmi/connectors";
import { networkRegistry } from "@sabaaa1/common";
import { SUPPORTED_CHAINS } from "./constants/supported-chain-ids.constants";

export const getWagmiConfig = () => {
  const transports = SUPPORTED_CHAINS.reduce((acc, chain) => {
    const networkData = networkRegistry[chain.id];
    acc[chain.id] = http(networkData?.fetchRpcUrl || undefined);
    return acc;
  }, {} as Record<number, ReturnType<typeof http>>);

  return createConfig({
    chains: SUPPORTED_CHAINS,
    connectors: [metaMask()],
    transports,
  });
};
