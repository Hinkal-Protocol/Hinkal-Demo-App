import { useCallback, useState } from "react";
import {
  ERC20Token,
  ExternalActionId,
  FeeStructure,
  getFeeStructure,
} from "@gurg/hi-test";
import { useAppContext } from "../AppContext";
import {
  convertScheduleToMs,
  ScheduleOption,
} from "../constants/schedule.constants";
import { getAmountInWei } from "../utils/amount.utils";

interface UseMultiSendProps {
  onError: (err: Error) => void;
  onSuccess: () => void;
}

export const useMultiSend = ({ onError, onSuccess }: UseMultiSendProps) => {
  const { hinkal, chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [fee, setFee] = useState<bigint | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState<boolean>(false);
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined,
  );

  const calculateFee = useCallback(
    async (token: ERC20Token) => {
      if (!hinkal || !token || !chainId) return;

      try {
        setIsFeeLoading(true);
        const fee = await getFeeStructure(
          chainId,
          token.erc20TokenAddress,
          [token.erc20TokenAddress],
          ExternalActionId.Transact,
        );

        setFeeStructure({
          variableRate: fee.variableRate,
          feeToken: token.erc20TokenAddress,
          flatFee: fee.flatFee,
        });
      } catch (err) {
        console.error("Error calculating fee:", err);
        setFee(null);
        setFeeStructure(undefined);
      } finally {
        setIsFeeLoading(false);
      }
    },
    [hinkal],
  );

  const multiSend = useCallback(
    async (
      token: ERC20Token,
      address1: string,
      amount1: string,
      address2: string,
      amount2: string,
      schedule: ScheduleOption,
    ) => {
      if (!hinkal) {
        throw new Error("Hinkal not initialized");
      }
      if (!chainId) return;

      try {
        setIsProcessing(true);

        const amount1Wei = getAmountInWei(token, amount1);
        const amount2Wei = getAmountInWei(token, amount2);

        const recipientAmounts: Record<string, bigint> = {
          [address1]: amount1Wei,
          [address2]: amount2Wei,
        };

        const txScheduleTime = Date.now() + convertScheduleToMs(schedule);

        console.log("token:", token);
        console.log("recipientAmounts:", recipientAmounts);
        console.log("txScheduleTime:", txScheduleTime);

        const result = await hinkal.depositAndWithdraw(
          token,
          Object.values(recipientAmounts),
          Object.keys(recipientAmounts),
          txScheduleTime,
          feeStructure,
        );

        if (result) await hinkal.waitForTransaction(chainId, result);

        onSuccess();
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, onError, onSuccess],
  );

  return {
    multiSend,
    isProcessing,
    fee,
    isFeeLoading,
    calculateFee,
  };
};
