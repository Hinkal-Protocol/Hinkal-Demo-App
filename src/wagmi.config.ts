import { arbitrum, avalanche, bsc, hardhat, mainnet, optimism, polygon } from 'wagmi/chains';
import { configureChains, createConfig, http } from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import { networkRegistry } from 'valtest-com-try-new-build-v';

const CHAINS = [mainnet, polygon, bsc, arbitrum, optimism, avalanche, hardhat];

export const getWagmiConfig = () => {
  const { chains, publicClient } = configureChains(CHAINS, [
    jsonRpcProvider({
      rpc: (chain) => {
        const networkData = networkRegistry[chain.id];
        return { http: networkData ? networkData.fetchRpcUrl! : '' };
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
