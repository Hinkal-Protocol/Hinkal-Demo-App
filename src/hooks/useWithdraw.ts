import { useCallback, useState } from "react";
import { ERC20Token, FeeStructure, Hinkal } from "@gurg/hi-test";
import { getAmountInWei } from "../utils/amount.utils";
import { useAppContext } from "../AppContext";
import { Connector } from "wagmi";

interface UseWithdrawProps {
  hinkal: Hinkal<Connector>;
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
      token: ERC20Token,
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

      try {
        setIsProcessing(true);

        const amountInWei = getAmountInWei(token, amount);

        const tx = await hinkal.withdraw(
          [token],
          [-amountInWei],
          recipientAddress,
          isRelayerOff,
          undefined,
          feeStructure,
        );

        if (typeof tx === "bigint") {
          onSuccess?.();
          return;
        }

        if (typeof tx === "string")
          await hinkal.waitForTransaction(chainId, tx);

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
