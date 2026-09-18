import { chainIds } from "./chains.constants";

const explorerByChainId: Record<number, string> = {
  [chainIds.ethMainnet]: "https://etherscan.io",
  [chainIds.arbMainnet]: "https://arbiscan.io",
  [chainIds.optimism]: "https://optimistic.etherscan.io",
  [chainIds.polygon]: "https://polygonscan.com",
  [chainIds.base]: "https://basescan.org",
};

export const getTxExplorerUrl = (chainId: number, txHash: string) => {
  const base = explorerByChainId[chainId];
  return base ? `${base}/tx/${txHash}` : null;
};
