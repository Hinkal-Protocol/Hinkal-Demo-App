import { useCallback, useEffect, useState } from "react";
import { ReceiveVaultBlockedFund, ReceiveVaultRecord } from "@hinkal/common";
import { useAppContext } from "../AppContext";

export const useReceiveVaultAccount = () => {
  const { hinkal } = useAppContext();
  const [entries, setEntries] = useState<ReceiveVaultRecord[]>([]);
  const [blockedFunds, setBlockedFunds] = useState<ReceiveVaultBlockedFund[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!hinkal) {
      setEntries([]);
      setBlockedFunds([]);
      return;
    }

    setIsLoading(true);
    try {
      const account = await hinkal.getReceiveVaultAccount();
      setEntries(account.entries);
      setBlockedFunds(account.blockedFunds);
    } catch (err) {
      console.error("Failed to load receive vault account:", err);
    } finally {
      setIsLoading(false);
    }
  }, [hinkal]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { entries, blockedFunds, isLoading, refresh };
};
