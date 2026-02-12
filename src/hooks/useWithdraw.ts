import { useCallback, useState } from "react";
import { ERC20Token, getAmountInWei } from "@hinkal/common";

interface UseWithdrawProps {
  hinkal: any;
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export const useWithdraw = ({
  hinkal,
  onSuccess,
  onError,
}: UseWithdrawProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const withdraw = useCallback(
    async (
      token: ERC20Token,
      amount: string,
      recipientAddress: string,
      isRelayerOff: boolean
    ) => {
      if (!hinkal) {
        throw new Error("Hinkal instance not initialized");
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
          undefined,
          undefined,
          false
        );

        if (typeof tx === "bigint") {
          onSuccess?.();
          return;
        }

        if ("hash" in tx) await hinkal.waitForTransaction(tx.hash);

        onSuccess?.();
      } catch (err) {
        console.error("Withdraw error:", err);
        onError?.(err);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, onSuccess, onError]
  );

  return {
    withdraw,
    isProcessing,
  };
};
