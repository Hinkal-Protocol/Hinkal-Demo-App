import { useState, useCallback } from "react";
import { ERC20Token, ExternalActionId, FeeStructure } from "@gurg/hi-test";
import { useAppContext } from "../AppContext";
import { getAmountInWei } from "../utils/amount.utils";

type UseSwapOptions = {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
};

export const useSwap = ({ onError, onSuccess }: UseSwapOptions = {}) => {
  const { hinkal } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const swap = useCallback(
    async (
      tokenIn: ERC20Token,
      tokenOut: ERC20Token,
      amountIn: string,
      expectedAmountOut: bigint,
      fee: string,
      feeStructure?: FeeStructure,
    ) => {
      try {
        setIsProcessing(true);

        if (!hinkal) throw new Error("Hinkal not initialized");
        if (!amountIn || parseFloat(amountIn) <= 0)
          throw new Error("Invalid amount");
        if (!expectedAmountOut || expectedAmountOut <= 0n)
          throw new Error("Invalid output amount");

        const amountInWei = getAmountInWei(tokenIn, amountIn);

        await hinkal.swap(
          [tokenIn, tokenOut],
          [-amountInWei, expectedAmountOut],
          ExternalActionId.Uniswap,
          fee,
          undefined,
          feeStructure,
        );

        onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Swap failed");
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, onError, onSuccess],
  );

  return { swap, isProcessing };
};
