import { useState, useCallback } from "react";
import {
  ERC20Token,
  ExternalActionId,
  FeeStructure,
  getFeeStructure,
} from "@gurg/hi-test";
import { useAppContext } from "../AppContext";

export const useFee = () => {
  const { chainId } = useAppContext();
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined,
  );
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  const calculateFee = useCallback(
    async (
      feeToken: ERC20Token,
      actionId: ExternalActionId,
      tokenAddresses: string[],
    ): Promise<FeeStructure | undefined> => {
      if (!chainId || !feeToken) return undefined;
      try {
        setIsFeeLoading(true);
        const result = await getFeeStructure(
          chainId,
          feeToken.erc20TokenAddress,
          tokenAddresses,
          actionId,
        );
        setFeeStructure(result);
        return result;
      } catch {
        setFeeStructure(undefined);
        return undefined;
      } finally {
        setIsFeeLoading(false);
      }
    },
    [chainId],
  );

  return { feeStructure, isFeeLoading, calculateFee };
};
