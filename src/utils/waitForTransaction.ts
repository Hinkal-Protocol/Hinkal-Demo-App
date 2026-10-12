import { Connection } from "@solana/web3.js";
import { chainIds } from "../constants/chains.constants";
import { networkRegistry } from "../constants/networkRegistry";
import { createJsonRpcProvider } from "./createJsonRpcProvider";

const CONFIRMATIONS = 1;
const TIMEOUT_MS = 2 * 60 * 1000;

const normalizeEvmTxHash = (txHash: string) =>
  txHash.startsWith("0x") ? txHash : `0x${txHash}`;

const waitForEvmTransaction = async (chainId: number, txHash: string) => {
  const provider = createJsonRpcProvider(chainId);
  const receipt = await provider.waitForTransaction(
    normalizeEvmTxHash(txHash),
    CONFIRMATIONS,
    TIMEOUT_MS,
  );

  if (!receipt || receipt.status !== 1) {
    throw new Error("Transaction not confirmed");
  }
};

const waitForSolanaTransaction = async (chainId: number, txHash: string) => {
  const { fetchRpcUrl } = networkRegistry[chainId];
  if (!fetchRpcUrl) {
    throw new Error("RPC URL not found for the specified chain ID");
  }

  const connection = new Connection(fetchRpcUrl, "confirmed");
  const result = await connection.confirmTransaction(txHash, "confirmed");

  if (result.value.err) {
    throw new Error("Transaction failed");
  }
};

export const waitForTransaction = async (chainId: number, txHash: string) => {
  if (chainId === chainIds.solanaMainnet) {
    await waitForSolanaTransaction(chainId, txHash);
    return;
  }

  await waitForEvmTransaction(chainId, txHash);
};
