import { useCallback, useState } from "react";
import {
  ERC20Token,
  getAmountInWei,
  ExternalActionId,
  FeeStructure,
  processGasEstimates,
} from "@hinkal/common";
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
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined
  );

  const calculateFee = useCallback(
    async (token: ERC20Token) => {
      if (!hinkal || !token) return;

      try {
        setIsFeeLoading(true);
        const chainId = hinkal.getCurrentChainId();

        const { priceOfTransactionInToken } = await processGasEstimates(
          chainId,
          token,
          ExternalActionId.Transact,
          1,
          undefined,
          undefined
        );

        if (priceOfTransactionInToken !== undefined) {
          const totalFee = priceOfTransactionInToken * 2n;
          setFee(totalFee);

          setFeeStructure({
            variableRate: 0n,
            feeToken: token.erc20TokenAddress,
            flatFee: priceOfTransactionInToken,
          });
        }
      } catch (err) {
        console.error("Error calculating fee:", err);
        setFee(null);
        setFeeStructure(undefined);
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

        console.log("token:", token);
        console.log("recipientAmounts:", recipientAmounts);
        console.log("txScheduleTime:", txScheduleTime);

        const result = await hinkal.depositAndWithdraw(
          token,
          recipientAmounts,
          txScheduleTime,
          feeStructure
        );

        if (result) await hinkal.waitForTransaction(result);

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
