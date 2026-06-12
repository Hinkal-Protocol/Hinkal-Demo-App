import { JsonRpcProvider } from "ethers";
import { networkRegistry } from "../constants/networkRegistry";

export const createJsonRpcProvider = (chainId: number) => {
  const { fetchRpcUrl } = networkRegistry[chainId];
  if (!fetchRpcUrl)
    throw new Error("RPC URL not found for the specified chain ID");

  return new JsonRpcProvider(fetchRpcUrl, chainId, { staticNetwork: true });
};
