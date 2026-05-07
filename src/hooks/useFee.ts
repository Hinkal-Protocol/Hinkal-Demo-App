import { useState, useCallback } from "react";
import { ERC20Token, ExternalActionId, getFeeStructure } from "@gurg/hi-test";
import { useAppContext } from "../AppContext";

export const useFee = () => {
  const { chainId } = useAppContext();
  const [fee, setFee] = useState<bigint | null>(null);
  const [isFeeLoading, setIsFeeLoading] = useState(false);

  const calculateFee = useCallback(
    async (
      token: ERC20Token,
      actionId: ExternalActionId = ExternalActionId.Transact,
    ) => {
      if (!chainId || !token) return;
      try {
        setIsFeeLoading(true);
        const result = await getFeeStructure(
          chainId,
          token.erc20TokenAddress,
          [token.erc20TokenAddress],
          actionId,
        );
        setFee(result.flatFee);
      } catch {
        setFee(null);
      } finally {
        setIsFeeLoading(false);
      }
    },
    [chainId],
  );

  return { fee, isFeeLoading, calculateFee };
};
