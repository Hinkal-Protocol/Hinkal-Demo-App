import { useCallback, useState } from "react";
import { ERC20Token, FeeStructure } from "@gurg/hi-test";
import { useAppContext } from "../AppContext";
import { getAmountInWei } from "../utils/amount.utils";
import { getTxScheduleTime } from "../utils/getTxScheduleTime";
import { ScheduleDelayOption } from "../types";

interface UseMultiSendProps {
  onError: (err: Error) => void;
  onSuccess: () => void;
}

export const useMultiSend = ({ onError, onSuccess }: UseMultiSendProps) => {
  const { hinkal, chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const multiSend = useCallback(
    async (
      token: ERC20Token,
      address1: string,
      amount1: string,
      address2: string,
      amount2: string,
      selectedScheduleDelay: ScheduleDelayOption,
      feeStructure?: FeeStructure,
    ) => {
      if (!hinkal) throw new Error("Hinkal not initialized");
      if (!chainId) return;

      try {
        setIsProcessing(true);

        const amountsInBigInt = [
          getAmountInWei(token, amount1),
          getAmountInWei(token, amount2),
        ];
        const txScheduleTime = getTxScheduleTime(selectedScheduleDelay);

        await hinkal.depositAndWithdraw(
          token,
          amountsInBigInt,
          [address1, address2],
          txScheduleTime,
          feeStructure,
        );

        onSuccess();
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, chainId, onError, onSuccess],
  );

  return {
    multiSend,
    isProcessing,
  };
};
