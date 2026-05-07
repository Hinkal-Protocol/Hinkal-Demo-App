import { useCallback, useState } from "react";
import {
  ERC20Token,
  ExternalActionId,
  FeeStructure,
  getFeeStructure,
} from "@gurg/hi-test";
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
        const calculatedFee = await getFeeStructure(
          chainId,
          token.erc20TokenAddress,
          [token.erc20TokenAddress],
          ExternalActionId.Transact,
        );

        setFeeStructure({
          variableRate: calculatedFee.variableRate,
          feeToken: token.erc20TokenAddress,
          flatFee: calculatedFee.flatFee,
        });
        setFee(calculatedFee.flatFee);
      } catch (err) {
        console.error("Error calculating fee:", err);
        setFee(null);
        setFeeStructure(undefined);
      } finally {
        setIsFeeLoading(false);
      }
    },
    [hinkal, chainId],
  );

  const multiSend = useCallback(
    async (
      token: ERC20Token,
      address1: string,
      amount1: string,
      address2: string,
      amount2: string,
      selectedScheduleDelay: ScheduleDelayOption,
    ) => {
      if (!hinkal) throw new Error("Hinkal not initialized");
      if (!chainId) return;

      try {
        setIsProcessing(true);

        const amountsInBigInt = [
          getAmountInWei(token, amount1),
          getAmountInWei(token, amount2),
        ];

        const filteredAddresses = [address1, address2];

        const txScheduleTime = getTxScheduleTime(selectedScheduleDelay);

        await hinkal.depositAndWithdraw(
          token,
          amountsInBigInt,
          filteredAddresses,
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
    [hinkal, chainId, feeStructure, onError, onSuccess],
  );

  return {
    multiSend,
    isProcessing,
    fee,
    isFeeLoading,
    calculateFee,
  };
};
