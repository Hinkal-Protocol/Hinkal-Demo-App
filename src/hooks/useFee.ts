import { useState, useEffect } from "react";
import { ExternalActionId, FeeStructure } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { SolanaTransactionParams, Token } from "../types";

export const useFee = (
  feeToken: Token | undefined,
  actionId: ExternalActionId,
  tokenAddresses: (string | undefined)[],
  solanaTransactionParams?: SolanaTransactionParams,
) => {
  const { hinkal, chainId } = useAppContext();
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined,
  );
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetch = async () => {
      if (!hinkal || !chainId || !feeToken) return;
      if (feeToken.chainId !== chainId) return;
      try {
        setIsFeeLoading(true);
        const result = await hinkal.getFeeStructure(
          chainId,
          feeToken.erc20TokenAddress,
          tokenAddresses.filter(
            (address): address is string => address !== undefined,
          ),
          actionId,
          undefined,
          undefined,
          solanaTransactionParams,
        );
        if (!isCancelled) setFeeStructure(result);
      } catch {
        if (!isCancelled) setFeeStructure(undefined);
      } finally {
        if (!isCancelled) setIsFeeLoading(false);
      }
    };
    fetch();

    return () => {
      isCancelled = true;
    };
  }, [
    hinkal,
    chainId,
    feeToken,
    actionId,
    tokenAddresses,
    solanaTransactionParams,
  ]);

  return { feeStructure, isFeeLoading };
};
