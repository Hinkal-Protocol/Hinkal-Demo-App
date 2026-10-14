import { useCallback, useEffect, useState } from "react";
import { FeeStructure, Hinkal } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { getTxScheduleTime } from "../utils/getTxScheduleTime";
import { ScheduleDelayOption, Token } from "../types";
import { getAmountInWei } from "../utils/amount.utils";
import { MultiSendRecipient } from "./useMultiSend";

export type BridgeQuote = Awaited<
  ReturnType<Hinkal<unknown>["getDepositAndBridgeQuote"]>
>;

interface ScheduleTxStatus {
  status: string;
  scheduledTime: string;
  txHash: string | null;
}

interface UseBridgeProps {
  onError: (err: Error) => void;
  onSuccess: () => void;
}

export const useBridge = ({ onError, onSuccess }: UseBridgeProps) => {
  const { hinkal, chainId } = useAppContext();
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
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

  const getQuote = useCallback(
    async (
      token: Token,
      destinationToken: Token,
      recipients: MultiSendRecipient[],
      selectedScheduleDelay: ScheduleDelayOption,
      slippagePercent?: number
    ) => {
      if (!hinkal) throw new Error("Hinkal not initialized");
      if (!chainId) return;

      try {
        setQuote(null);
        setIsQuoting(true);
        setQuote(
          await hinkal.getDepositAndBridgeQuote(
            chainId,
            token.erc20TokenAddress,
            destinationToken.chainId,
            destinationToken.erc20TokenAddress,
            recipients.map((r) => getAmountInWei(token, r.amount)),
            recipients.map((r) => r.address),
            slippagePercent,
            getTxScheduleTime(selectedScheduleDelay)
          )
        );
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsQuoting(false);
      }
    },
    [hinkal, chainId, onError]
  );

  const bridge = useCallback(
    async (
      token: Token,
      selectedScheduleDelay: ScheduleDelayOption,
      feeStructure?: FeeStructure
    ) => {
      if (!hinkal) throw new Error("Hinkal not initialized");
      if (!chainId || !quote) return;

      try {
        setScheduleId(null);
        setScheduleStatuses([]);
        setIsBridging(true);

        const { scheduleId: newScheduleId } =
          await hinkal.depositAndBridgeWithQuote(
            chainId,
            token.erc20TokenAddress,
            quote,
            getTxScheduleTime(selectedScheduleDelay),
            feeStructure
          );

        setScheduleId(newScheduleId ?? null);
        setQuote(null);
        onSuccess();
      } catch (err) {
        onError(err as Error);
      } finally {
        setIsBridging(false);
      }
    },
    [hinkal, chainId, quote, onError, onSuccess]
  );

  return {
    quote,
    setQuote,
    getQuote,
    isQuoting,
    bridge,
    isBridging,
    scheduleId,
    scheduleStatuses,
  };
};
