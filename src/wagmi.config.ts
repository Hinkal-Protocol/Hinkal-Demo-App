import { chainIds } from '@hinkal/react-hooks';
import { Chain, chain, configureChains, createClient, defaultChains } from 'wagmi';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { publicProvider } from 'wagmi/providers/public';

// Configure chains for connectors to support

export const localNode: Chain = {
  id: chainIds.localhost,
  name: 'Localhost 8545',
  network: 'Localhost 8545',
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: 'http://127.0.0.1:8545/',
  },
  testnet: true,
};

const { provider, webSocketProvider } = configureChains(defaultChains, [publicProvider()]);

const chains = [chain.sepolia, chain.polygon, localNode];

// configuration for wagmi
// configs supported chains and wallets
export const wagmiClient = createClient({
  connectors: [
    new MetaMaskConnector({
      chains,
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
  ],
  provider,
  webSocketProvider,
});
