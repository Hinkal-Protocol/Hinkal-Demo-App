import { useCallback, useEffect, useRef, useState } from "react";
import { ReceiveVaultRecord } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { receiveVaultNetworkOf } from "../utils/receiveVaultNetwork";

export const useReceiveVault = () => {
  const { hinkal, chainId } = useAppContext();
  const [record, setRecord] = useState<ReceiveVaultRecord | undefined>(
    undefined,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  // Guards a stale response from overwriting a newer one when the chain
  // changes or regenerate() is called while a request is still in flight.
  const requestIdRef = useRef(0);

  const handOutAddress = useCallback(
    async (forceFresh: boolean) => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;

      if (!hinkal || !chainId || !hinkal.isReceiveVaultSupported(chainId)) {
        setRecord(undefined);
        setError(undefined);
        setIsLoading(false);
        return;
      }

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
    [hinkal, chainId],
  );

  useEffect(() => {
    setRecord(undefined);
    setError(undefined);
    handOutAddress(false);
  }, [handOutAddress]);

  const regenerate = useCallback(() => handOutAddress(true), [handOutAddress]);

  return { record, isLoading, error, regenerate };
};
