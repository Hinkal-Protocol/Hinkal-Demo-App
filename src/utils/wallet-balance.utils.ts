import { ethers } from "ethers";
import { networkRegistry } from "@hinkal/common";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

const getJsonRpcProvider = (chainId: number): ethers.JsonRpcProvider => {
  const rpcUrl = networkRegistry[chainId]?.fetchRpcUrl;
  if (!rpcUrl) throw new Error(`No RPC URL configured for chain ${chainId}`);
  return new ethers.JsonRpcProvider(rpcUrl);
};

export const getNativeBalance = async (
  chainId: number,
  address: string,
): Promise<bigint> => getJsonRpcProvider(chainId).getBalance(address);

export const getErc20Balance = async (
  chainId: number,
  tokenAddress: string,
  walletAddress: string,
): Promise<bigint> => {
  const contract = new ethers.Contract(
    tokenAddress,
    ERC20_ABI,
    getJsonRpcProvider(chainId),
  );
  return contract.balanceOf(walletAddress);
};
