import { useCallback, useState } from "react";
import { ERC20Token, getAmountInWei, ExternalActionId } from "@sabaaa1/common";
import { useAppContext } from "../AppContext";
import {
  convertScheduleToMs,
  ScheduleOption,
} from "../constants/schedule.constants";

interface UseMultiSendProps {
  onError: (err: Error) => void;
  onSuccess: () => void;
}

export const useMultiSend = ({ onError, onSuccess }: UseMultiSendProps) => {
  const { hinkal } = useAppContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fee, setFee] = useState<bigint | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState<boolean>(false);

  const calculateFee = useCallback(
    async (token: ERC20Token) => {
      if (!hinkal || !token) return;

      try {
        setIsFeeLoading(true);
        const chainId = hinkal.getCurrentChainId();

        // const feeStructure = await getFeeStructure(
        //   chainId,
        //   token.erc20TokenAddress,
        //   [token.erc20TokenAddress],
        //   ExternalActionId.Transact,
        //   [],
        //   0n
        // );

        // const totalFee = feeStructure.fee * 2n;
        // setFee(totalFee);
      } catch (err) {
        console.error("Error calculating fee:", err);
        setFee(null);
      } finally {
        setIsFeeLoading(false);
      }
    },
    [hinkal]
  );

  const multiSend = useCallback(
    async (
      token: ERC20Token,
      address1: string,
      amount1: string,
      address2: string,
      amount2: string,
      schedule: ScheduleOption,
      intervalBetweenTxs: ScheduleOption
    ) => {
      if (!hinkal) {
        throw new Error("Hinkal not initialized");
      }

      try {
        setIsProcessing(true);

        const amount1Wei = getAmountInWei(token, amount1);
        const amount2Wei = getAmountInWei(token, amount2);

        const recipientAmounts: Record<string, bigint> = {
          [address1]: amount1Wei,
          [address2]: amount2Wei,
        };

        const txScheduleTime = Date.now() + convertScheduleToMs(schedule);
        const txMakingIntervalTime = convertScheduleToMs(intervalBetweenTxs);

        console.log("token:", token);
        console.log("recipientAmounts:", recipientAmounts);
        console.log("txScheduleTime:", txScheduleTime);
        console.log("txMakingIntervalTime:", txMakingIntervalTime);

        // const result = await hinkal.depositAndWithdraw(
        //   token,
        //   recipientAmounts,
        //   txScheduleTime,
        //   txMakingIntervalTime
        // );

        // if (Array.isArray(result)) {
        //   for (const tx of result) {
        //     if (tx.hash) {
        //       await hinkal.waitForTransaction(tx.hash);
        //     }
        //   }
        // }

        onSuccess();
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, onError, onSuccess]
  );

  return {
    multiSend,
    isProcessing,
    fee,
    isFeeLoading,
    calculateFee,
  };
};
