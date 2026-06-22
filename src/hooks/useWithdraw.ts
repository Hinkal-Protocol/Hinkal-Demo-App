import { useCallback, useState } from "react";
import { ERC20Token, Hinkal, getAmountInWei } from "@hinkal/common";
import { useAppContext } from "../AppContext";

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
      token: ERC20Token,
      amount: string,
      recipientAddress: string,
      isRelayerOff: boolean,
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

        // Pay the fee in the transacted token itself; works on every chain,
        // including tempo which has no native gas token.
        const tx = await hinkal.withdraw(
          [token],
          [-amountInWei],
          recipientAddress,
          isRelayerOff,
          token.erc20TokenAddress,
          undefined,
          undefined,
        );

        const txHash = typeof tx === "string" ? tx : tx.hash;

        await hinkal.waitForTransaction(chainId, txHash);

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
