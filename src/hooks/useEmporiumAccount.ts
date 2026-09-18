import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { prepareEthersHinkal } from "@hinkal/common/providers/prepareEthersHinkal";
import { useAppContext } from "../AppContext";
import { createJsonRpcProvider } from "../utils/createJsonRpcProvider";

interface UseEmporiumAccountProps {
  onLog: (text: string, kind?: "info" | "ok" | "err") => void;
}

export const useEmporiumAccount = ({ onLog }: UseEmporiumAccountProps) => {
  const { hinkal, setHinkal, chainId, setChainId, setDataLoaded } =
    useAppContext();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ethAddress, setEthAddress] = useState("");
  const [shieldedKey, setShieldedKey] = useState("");

  const connect = useCallback(
    async (privateKey: string, targetChainId: number) => {
      const key = privateKey.trim();
      if (!key) return false;

      try {
        setIsConnecting(true);
        onLog("Creating Hinkal account...");

        const signer = new ethers.Wallet(
          key,
          createJsonRpcProvider(targetChainId),
        );
        const instance = await prepareEthersHinkal(signer);

        setHinkal(instance);
        setChainId(targetChainId);
        setDataLoaded(true);
        setEthAddress(await instance.getEthereumAddress());
        setShieldedKey(instance.getRecipientInfo());

        instance.refreshBalance({ chainIdToUpdate: targetChainId });
        onLog("Account ready", "ok");
        return true;
      } catch (err) {
        onLog(`Connect failed: ${err}`, "err");
        throw err;
      } finally {
        setIsConnecting(false);
      }
    },
    [onLog, setHinkal, setChainId, setDataLoaded],
  );

  const refreshBalances = useCallback(() => {
    if (!hinkal || !chainId) return;
    setIsRefreshing(true);
    hinkal.refreshBalance({ chainIdToUpdate: chainId });
    setTimeout(() => setIsRefreshing(false), 1500);
  }, [hinkal, chainId]);

  return {
    connect,
    refreshBalances,
    isConnecting,
    isRefreshing,
    ethAddress,
    shieldedKey,
    isConnected: !!shieldedKey,
  };
};
