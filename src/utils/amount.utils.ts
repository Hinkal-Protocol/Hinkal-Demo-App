import { Token } from "../types";
import { ethers } from "ethers";

export const getAmountInToken = (token: Token, amount: bigint): string =>
  ethers.formatUnits(amount, token.decimals);

export const getAmountInWei = (token: Token, amount: string): bigint => {
  try {
    return ethers.parseUnits(amount, token.decimals);
  } catch (err) {
    throw new Error("Invalid amount");
  }
};
