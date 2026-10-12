import { ReceiveVaultNetwork } from "@hinkal/common";
import { isTronLike } from "../constants/tron-chain.constants";
import { chainIds } from "../constants/chains.constants";

// The SDK's Hinkal class doesn't expose a chainId -> ReceiveVaultNetwork
// mapping itself, so it's derived from the app's own chain constants.
export const receiveVaultNetworkOf = (chainId: number): ReceiveVaultNetwork => {
  if (isTronLike(chainId)) return ReceiveVaultNetwork.Tron;
  if (chainId === chainIds.solanaMainnet) return ReceiveVaultNetwork.Solana;
  return ReceiveVaultNetwork.Evm;
};
