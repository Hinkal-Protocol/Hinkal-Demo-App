import { http, createConfig } from "wagmi";
import { metaMask, walletConnect } from "wagmi/connectors";
import { SUPPORTED_CHAINS } from "./constants/supported-chain-ids.constants";
import { networkRegistry } from "./constants/networkRegistry";

export const getWagmiConfig = () => {
  const transports = SUPPORTED_CHAINS.reduce((acc, chain) => {
    const networkData = networkRegistry[chain.id];
    acc[chain.id] = http(networkData?.fetchRpcUrl || undefined);
    return acc;
  }, {} as Record<number, ReturnType<typeof http>>);

  return createConfig({
    chains: SUPPORTED_CHAINS,
    connectors: [
      metaMask(),
      walletConnect({ projectId: "6c5e68094017e64428795a28e4c6aef1" }),
    ],
    transports,
  });
};
