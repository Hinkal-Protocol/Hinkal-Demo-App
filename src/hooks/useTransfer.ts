import { useState, useCallback } from "react";
import { FeeStructure } from "@gurge/sdk";
import { useAppContext } from "../AppContext";
import { getAmountInWei } from "../utils/amount.utils";
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
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");
        if (!recipientAddress) throw new Error("Recipient address is required");

        const amountInBigInt = getAmountInWei(token, amount);
        const txHash = await hinkal.transfer(
          chainId,
          [token.erc20TokenAddress],
          [-amountInBigInt],
          recipientAddress,
          undefined,
          feeStructure,
        );

        await hinkal.waitForTransaction(chainId, txHash);

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
