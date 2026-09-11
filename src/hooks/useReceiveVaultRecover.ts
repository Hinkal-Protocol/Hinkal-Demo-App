import { useCallback, useState } from "react";
import { ReceiveVaultBlockedFund } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { waitForTransaction } from "../utils/waitForTransaction";

interface UseReceiveVaultRecoverProps {
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
}

export const receiveVaultBlockedFundKey = (fund: ReceiveVaultBlockedFund) =>
  `${fund.record.vaultAddress}:${fund.erc20Address}`.toLowerCase();

export const useReceiveVaultRecover = ({
  onSuccess,
  onError,
}: UseReceiveVaultRecoverProps) => {
  const { hinkal, chainId } = useAppContext();
  const [recoveringKey, setRecoveringKey] = useState<string | null>(null);

  const recover = useCallback(
    async (fund: ReceiveVaultBlockedFund) => {
      if (!hinkal) return;
      // recoverReceiveVault signs with the active chain's connected signer, so the
      // fund's chain must already be the active one — the caller switches first.
      if (fund.chainId !== chainId) {
        onError?.(new Error("Switch to the fund's network to recover it"));
        return;
      }

      setRecoveringKey(receiveVaultBlockedFundKey(fund));
      try {
        const recipientAddress = await hinkal.getEthereumAddress();
        const hash = (await hinkal.recoverReceiveVault(
          fund.record,
          fund.erc20Address,
          fund.chainId,
          recipientAddress,
        )) as string;

        await waitForTransaction(fund.chainId, hash);
        onSuccess?.();
      } catch (err) {
        console.error("Receive vault recovery error:", err);
        onError?.(err);
      } finally {
        setRecoveringKey(null);
      }
    },
    [hinkal, chainId, onSuccess, onError],
  );

  return { recover, recoveringKey };
};
