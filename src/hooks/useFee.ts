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
  const [fee, setFee] = useState<bigint | null>(null);
  const [feeStructure, setFeeStructure] = useState<FeeStructure | undefined>(
    undefined,
  );
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  const calculateFee = useCallback(
    async (
      token: ERC20Token,
      actionId: ExternalActionId = ExternalActionId.Transact,
    ): Promise<FeeStructure | undefined> => {
      if (!chainId || !token) return undefined;
      try {
        setIsFeeLoading(true);
        const result = await getFeeStructure(
          chainId,
          token.erc20TokenAddress,
          [token.erc20TokenAddress],
          actionId,
        );
        setFee(result.flatFee);
        setFeeStructure(result);
        return result;
      } catch {
        setFee(null);
        setFeeStructure(undefined);
        return undefined;
      } finally {
        setIsFeeLoading(false);
      }
    },
    [chainId],
  );

  return { fee, feeStructure, isFeeLoading, calculateFee };
};
