import { ERC20Token } from "@gurge/sdk";
import { ethers } from "ethers";

export const getAmountInToken = (token: ERC20Token, amount: bigint): string =>
  ethers.formatUnits(amount, token.decimals);

export const getAmountInWei = (token: ERC20Token, amount: string): bigint => {
  const decimalsToRemove = 10 ** (18 - token.decimals);
  try {
    return ethers.parseUnits(amount) / BigInt(decimalsToRemove);
  } catch (err) {
    throw new Error("Invalid amount");
  }
};
