import { ethers } from "ethers";
import { zeroAddress } from "../constants";
import { createJsonRpcProvider } from "./createJsonRpcProvider";
import { ERC20ABI } from "../externalABIs/swaoABI";

export const getPublicBalanceByTokenAddress = async (
  chainId: number,
  ethereumAddress: string,
  tokenAddress: string,
): Promise<bigint | null> => {
  try {
    const provider = createJsonRpcProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20ABI, provider);
    let fetchedBalance;
    if (tokenAddress !== zeroAddress) {
      fetchedBalance = await contract?.["balanceOf"](ethereumAddress);
    } else {
      fetchedBalance = await provider.getBalance(ethereumAddress);
    }
    return fetchedBalance;
  } catch {
    console.log(
      `Failed to fetch public balance for address ${ethereumAddress}`,
    );
    return null;
  }
};
