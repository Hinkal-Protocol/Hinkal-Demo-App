import { useCallback, useEffect, useState } from "react";
import { FeeStructure } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { getTxScheduleTime } from "../utils/getTxScheduleTime";
import { ScheduleDelayOption, Token } from "../types";
import { getAmountInWei } from "../utils/amount.utils";

export interface MultiSendRecipient {
  address: string;
  amount: string;
}

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
    []
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
          (tx) => tx.status === "completed" || tx.status === "failed"
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

  const multiSend = useCallback(
    async (
      token: Token,
      recipients: MultiSendRecipient[],
      selectedScheduleDelay: ScheduleDelayOption,
      feeStructure?: FeeStructure
    ) => {
      if (!hinkal) throw new Error("Hinkal not initialized");
      if (!chainId) return;

      try {
        setScheduleId(null);
        setScheduleStatuses([]);
        setIsDepositing(true);

        const txScheduleTime = getTxScheduleTime(selectedScheduleDelay);

        // Every recipient goes out in a single depositAndWithdraw, matching the
        // pay app. The SDK confirms the deposit internally before returning, so
        // there is no receipt to await here.
        const { scheduleId: newScheduleId } = await hinkal.depositAndWithdraw(
          chainId,
          token.erc20TokenAddress,
          recipients.map((r) => getAmountInWei(token, r.amount)),
          recipients.map((r) => r.address),
          txScheduleTime,
          feeStructure
        );

        setScheduleId(newScheduleId ?? null);
        onSuccess();
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsDepositing(false);
      }
    },
    [hinkal, chainId, onError, onSuccess]
  );

  return {
    multiSend,
    isDepositing,
    scheduleId,
    scheduleStatuses,
  };
};
