import { useCallback, useState } from "react";
import { FeeStructure, Hinkal } from "@hinkal/common";
import { getAmountInWei } from "../utils/amount.utils";
import { waitForTransaction } from "../utils/waitForTransaction";
import { useAppContext } from "../AppContext";
import { Token } from "../types";

interface UseWithdrawProps {
  hinkal: Hinkal<unknown> | undefined;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export const useWithdraw = ({
  hinkal,
  onSuccess,
  onError,
}: UseWithdrawProps) => {
  const { chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const withdraw = useCallback(
    async (
      token: Token,
      amount: string,
      recipientAddress: string,
      isRelayerOff: boolean,
      feeStructure?: FeeStructure,
    ) => {
      if (!hinkal) {
        throw new Error("Hinkal instance not initialized");
      }
      if (!chainId) {
        throw new Error("Chain ID not available");
      }
      if (token.chainId !== chainId) {
        throw new Error("Selected token does not belong to the active chain");
      }

      try {
        setIsProcessing(true);

        const amountInWei = getAmountInWei(token, amount);

        const tx = await hinkal.withdraw(
          chainId,
          [token.erc20TokenAddress],
          [-amountInWei],
          recipientAddress,
          isRelayerOff,
          undefined,
          feeStructure,
        );

        const txHash = typeof tx === "string" ? tx : tx.hash;

        await waitForTransaction(chainId, txHash);

        onSuccess?.();
      } catch (err) {
        console.error("Withdraw error:", err);
        onError?.(err);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, chainId, onSuccess, onError],
  );

  return {
    withdraw,
    isProcessing,
  };
};
