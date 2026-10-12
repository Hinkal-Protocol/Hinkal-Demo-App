import { useState, useCallback } from "react";
import { FeeStructure } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { getAmountInWei } from "../utils/amount.utils";
import { waitForTransaction } from "../utils/waitForTransaction";
import { Token } from "../types";

type UseTransferOptions = {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
};

export const useTransfer = ({
  onError,
  onSuccess,
}: UseTransferOptions = {}) => {
  const { hinkal, dataLoaded, chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const transfer = useCallback(
    async (
      token: Token,
      amount: string,
      recipientAddress: string,
      feeStructure?: FeeStructure,
    ) => {
      try {
        setIsProcessing(true);

        if (!dataLoaded || !hinkal || !chainId)
          throw new Error("Hinkal not initialized");
        if (token.chainId !== chainId)
          throw new Error("Selected token does not belong to the active chain");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");
        if (!recipientAddress) throw new Error("Recipient address is required");

        const amountInBigInt = getAmountInWei(token, amount);
        // Pass the fee token explicitly. The SDK's remote-proof transfer path
        // (the default) forwards `feeToken` to getFeeStructure without
        // defaulting it to the transferred mint, so leaving it undefined falls
        // back to the EVM zero address and throws "failed to find feeToken".
        const txHash = await hinkal.transfer(
          chainId,
          [token.erc20TokenAddress],
          [-amountInBigInt],
          recipientAddress,
          token.erc20TokenAddress,
          feeStructure,
        );

        await waitForTransaction(chainId, txHash);

        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Transfer failed");
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, dataLoaded, chainId, onError, onSuccess],
  );

  return { transfer, isProcessing };
};
