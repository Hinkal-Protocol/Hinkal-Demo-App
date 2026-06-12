import { useState, useCallback } from "react";
import { ExternalActionId, FeeStructure } from "@gurge/sdk";
import { useAppContext } from "../AppContext";
import { getAmountInWei } from "../utils/amount.utils";
import { Token } from "../types";

type UseSwapOptions = {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
};

export const useSwap = ({ onError, onSuccess }: UseSwapOptions = {}) => {
  const { hinkal, chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const swap = useCallback(
    async (
      tokenIn: Token,
      tokenOut: Token,
      amountIn: string,
      expectedAmountOut: bigint,
      swapData: string,
      feeStructure?: FeeStructure,
    ) => {
      try {
        setIsProcessing(true);

        if (!hinkal || !chainId) throw new Error("Hinkal not initialized");
        if (!amountIn || parseFloat(amountIn) <= 0)
          throw new Error("Invalid amount");
        if (!expectedAmountOut || expectedAmountOut <= 0n)
          throw new Error("Invalid output amount");

        const amountInWei = getAmountInWei(tokenIn, amountIn);

        const txHash = await hinkal.swap(
          chainId,
          [tokenIn.erc20TokenAddress, tokenOut.erc20TokenAddress],
          [-amountInWei, expectedAmountOut],
          ExternalActionId.Uniswap,
          swapData,
          undefined,
          feeStructure,
        );

        await hinkal.waitForTransaction(chainId, txHash);

        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Swap failed");
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, chainId, onError, onSuccess],
  );

  return { swap, isProcessing };
};
