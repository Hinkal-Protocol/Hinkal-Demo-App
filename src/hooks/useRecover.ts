import { useCallback, useEffect, useState } from "react";
import { Hinkal } from "@hinkal/common";
import { useAppContext } from "../AppContext";

export type RecoverableBalance = Awaited<
  ReturnType<Hinkal<unknown>["getStuckBridgeBalances"]>
>[number];

export const recoverableBalanceKey = (balance: RecoverableBalance) =>
  "assetId" in balance
    ? `near:${balance.assetId}:${balance.isLegacy}`
    : `${balance.nonce}:${balance.token.chainId}:${balance.token.erc20TokenAddress}`;

interface UseRecoverProps {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export const useRecover = ({ onSuccess, onError }: UseRecoverProps) => {
  const { hinkal, chainId } = useAppContext();
  const [balances, setBalances] = useState<RecoverableBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveringKey, setRecoveringKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hinkal || !chainId) {
      setBalances([]);
      return;
    }

    setIsLoading(true);
    try {
      setBalances(await hinkal.getStuckBridgeBalances([chainId]));
    } catch (err) {
      console.error("Failed to load recoverable balances:", err);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [hinkal, chainId, onError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const recover = useCallback(
    async (balance: RecoverableBalance) => {
      if (!hinkal) return;

      setRecoveringKey(recoverableBalanceKey(balance));
      try {
        await hinkal.recoverStuckBridgeBalance(balance);
        onSuccess?.();
        await refresh();
      } catch (err) {
        console.error("Recover error:", err);
        onError?.(err);
      } finally {
        setRecoveringKey(null);
      }
    },
    [hinkal, onSuccess, onError, refresh],
  );

  return { balances, isLoading, refresh, recover, recoveringKey };
};
