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
    undefined,
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
          undefined,
        );
        if (priceOfTransactionInToken !== undefined) {
          setFee(priceOfTransactionInToken * 2n);
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
      if (!hinkal) throw new Error("Hinkal not initialized");

      try {
        setIsProcessing(true);

        const amount1Wei = getAmountInWei(token, amount1);
        const amount2Wei = getAmountInWei(token, amount2);
        const txScheduleTime = Date.now() + convertScheduleToMs(schedule);

        console.log("[MultiSend] calling depositAndWithdraw", {
          token: token.symbol,
          amounts: [amount1Wei.toString(), amount2Wei.toString()],
          addresses: [address1, address2],
          txScheduleTime,
          feeStructure,
        });

        const result = await hinkal.depositAndWithdraw(
          token,
          [amount1Wei, amount2Wei],
          [address1, address2],
          txScheduleTime,
          feeStructure,
        );

        console.log("[MultiSend] depositAndWithdraw result", result);

        onSuccess();
      } catch (err) {
        console.error("[MultiSend] error", err);
        onError(err as Error);
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, feeStructure, onError, onSuccess],
  );

  return { multiSend, isProcessing, fee, isFeeLoading, calculateFee };
};
