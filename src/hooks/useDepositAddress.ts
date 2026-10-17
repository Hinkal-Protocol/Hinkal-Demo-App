import { useCallback, useRef, useState } from "react";
import { ReceiveVaultRecord } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { receiveVaultNetworkOf } from "../utils/receiveVaultNetwork";

// Unlike useReceiveVault, which follows the connected chain, this hands out a
// deposit address for any chain on demand (e.g. a private bridge destination).
export const useDepositAddress = () => {
  const { hinkal } = useAppContext();
  const [record, setRecord] = useState<ReceiveVaultRecord | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  // Guards a stale response from overwriting a newer one when the chain
  // changes or generate() is called again while a request is still in flight.
  const requestIdRef = useRef(0);

  const generate = useCallback(
    async (chainId: number, forceFresh: boolean) => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;

      if (!hinkal) return;

      setIsLoading(true);
      setError(undefined);

      try {
        const claimed = await hinkal.createReceiveAddress(
          receiveVaultNetworkOf(chainId),
          forceFresh,
        );
        if (requestIdRef.current === requestId) setRecord(claimed);
      } catch (err) {
        if (requestIdRef.current === requestId) {
          setRecord(undefined);
          setError(
            err instanceof Error
              ? err.message
              : "Could not create a deposit address",
          );
        }
      } finally {
        if (requestIdRef.current === requestId) setIsLoading(false);
      }
    },
    [hinkal],
  );

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setRecord(undefined);
    setError(undefined);
    setIsLoading(false);
  }, []);

  return { record, isLoading, error, generate, reset };
};
