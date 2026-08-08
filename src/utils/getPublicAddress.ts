import { Hinkal } from "@hinkal/common";
import { isSolanaLike } from "../constants/solana-chain.constants";

export const getPublicAddress = async (
  hinkal: Hinkal<unknown>,
  chainId: number | undefined,
): Promise<string | undefined> => {
  if (isSolanaLike(chainId)) {
    return hinkal.getSolanaPublicKey()?.toBase58();
  }
  return hinkal.getEthereumAddress();
};
