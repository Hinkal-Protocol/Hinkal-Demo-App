import { useState, useCallback, useEffect } from "react";
import {
  ERC20Token,
  ExternalActionId,
  FeeStructure,
  getFeeStructure,
} from "@gurge/sdk";
import { useAppContext } from "../AppContext";

export const useFee = (
  feeToken: ERC20Token | undefined,
  actionId: ExternalActionId,
  tokenAddresses: (string | undefined)[],
) => {
  const { chainId } = useAppContext();
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined,
  );
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetch = async () => {
      if (!chainId || !feeToken) return;
      try {
        setIsFeeLoading(true);
        const result = await getFeeStructure(
          chainId,
          feeToken.erc20TokenAddress,
          tokenAddresses.filter((address) => address !== undefined),
          actionId,
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
  }, [chainId, feeToken, actionId, tokenAddresses]);

  return { feeStructure, isFeeLoading };
};
