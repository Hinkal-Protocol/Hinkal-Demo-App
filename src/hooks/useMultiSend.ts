import { useCallback, useEffect, useState } from "react";
import {
  ERC20Token,
  getAmountInWei,
  ExternalActionId,
  FeeStructure,
  processGasEstimates,
} from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { getTxScheduleTime, ScheduleOption } from "../constants/schedule.constants";

interface ScheduleTxStatus {
  status: string;
  scheduledTime: string;
  txHash: string | null;
}

interface UseMultiSendProps {
  onError: (err: Error) => void;
  onSuccess: () => void;
}

export const useMultiSend = ({ onError, onSuccess }: UseMultiSendProps) => {
  const { hinkal, chainId } = useAppContext();
  const [isDepositing, setIsDepositing] = useState(false);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleStatuses, setScheduleStatuses] = useState<ScheduleTxStatus[]>(
    [],
  );
  const [fee, setFee] = useState<bigint | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState(false);
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!scheduleId || !hinkal) return undefined;

    let active = true;
    let intervalId: ReturnType<typeof setInterval>;

    const checkStatus = async () => {
      try {
        const data = await hinkal.checkSendTransactionStatus(scheduleId);

        if (!active) return;

        setScheduleStatuses(data.transactions);

        const done = data.transactions.every(
          (tx) => tx.status === "completed" || tx.status === "failed",
        );
        if (done) clearInterval(intervalId);
      } catch (err) {
        console.error("Status poll error:", err);
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [scheduleId, hinkal]);

  const calculateFee = useCallback(
    async (token: ERC20Token) => {
      if (!hinkal || !token || !chainId) return;

      try {
        setIsFeeLoading(true);

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
    [hinkal, chainId],
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
      if (!chainId) return;

      try {
        setScheduleId(null);
        setScheduleStatuses([]);
        setIsDepositing(true);

        const txScheduleTime = getTxScheduleTime(schedule);

        const { depositTxHash, scheduleId: newScheduleId } =
          await hinkal.depositAndWithdrawExtended(
            token,
            [getAmountInWei(token, amount1), getAmountInWei(token, amount2)],
            [address1, address2],
            txScheduleTime,
            feeStructure,
          );

        await hinkal.waitForTransaction(chainId, depositTxHash);

        setScheduleId(newScheduleId);
        onSuccess();
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsDepositing(false);
      }
    },
    [hinkal, chainId, feeStructure, onError, onSuccess],
  );

  return {
    multiSend,
    isDepositing,
    scheduleId,
    scheduleStatuses,
    fee,
    isFeeLoading,
    calculateFee,
  };
};
