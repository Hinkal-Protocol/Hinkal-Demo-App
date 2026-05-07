import { useState, useCallback } from "react";
import { ERC20Token, FeeStructure } from "@gurg/hi-test";
import { useAppContext } from "../AppContext";
import { getAmountInWei } from "../utils/amount.utils";

type UseTransferOptions = {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
};

export const useTransfer = ({
  onError,
  onSuccess,
}: UseTransferOptions = {}) => {
  const { hinkal, dataLoaded } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const transfer = useCallback(
    async (
      token: ERC20Token,
      amount: string,
      recipientAddress: string,
      feeStructure?: FeeStructure,
    ) => {
      try {
        setIsProcessing(true);

        if (!dataLoaded || !hinkal) throw new Error("Hinkal not initialized");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");
        if (!recipientAddress) throw new Error("Recipient address is required");

        const amountInBigInt = getAmountInWei(token, amount);
        await hinkal.transfer(
          [token],
          [-amountInBigInt],
          recipientAddress,
          undefined,
          feeStructure,
        );

        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Transfer failed");
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, dataLoaded, onError, onSuccess],
  );

  return { transfer, isProcessing };
};
