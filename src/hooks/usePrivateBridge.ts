import { useState, useCallback } from "react";
import { Hinkal } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { waitForTransaction } from "../utils/waitForTransaction";
import { Token } from "../types";

export type PrivateBridgeResult = Awaited<
  ReturnType<Hinkal<unknown>["bridgePrivateToPrivate"]>
>;

type UsePrivateBridgeOptions = {
  onError?: (error: Error) => void;
  onSuccess?: (result: PrivateBridgeResult, destinationToken: Token) => void;
};

export const usePrivateBridge = ({
  onError,
  onSuccess,
}: UsePrivateBridgeOptions = {}) => {
  const { hinkal, dataLoaded, chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const bridge = useCallback(
    async (
      token: Token,
      destinationToken: Token,
      amount: string,
      recipientAddress?: string,
      slippagePercent?: number,
    ) => {
      try {
        setIsProcessing(true);

        if (!dataLoaded || !hinkal || !chainId)
          throw new Error("Hinkal not initialized");
        if (token.chainId !== chainId)
          throw new Error("Selected token does not belong to the active chain");
        if (!amount || parseFloat(amount) <= 0)
          throw new Error("Invalid amount");

        // Without a recipient the SDK bridges to the caller's own deposit
        // address on the destination chain. The SDK takes slippage as a decimal.
        const result = await hinkal.bridgePrivateToPrivate(
          chainId,
          token.erc20TokenAddress,
          destinationToken.chainId,
          destinationToken.erc20TokenAddress,
          amount,
          recipientAddress,
          slippagePercent === undefined ? undefined : slippagePercent / 100,
        );

        await waitForTransaction(chainId, result.sourceTxHash);

        onSuccess?.(result, destinationToken);
      } catch (err) {
        console.error("hinkal.bridgePrivateToPrivate failed:", err);
        const error = err instanceof Error ? err : new Error("Bridge failed");
        onError?.(error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, dataLoaded, chainId, onError, onSuccess],
  );

  return { bridge, isProcessing };
};
