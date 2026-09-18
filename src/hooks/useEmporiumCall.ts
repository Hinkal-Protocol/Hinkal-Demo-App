import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { useAppContext } from "../AppContext";
import { Token } from "../types";
import { DeltaRow, LogKind, OpRow } from "../components/emporium/types";
import { parseDeltaRows, parseOpRow } from "../utils/emporium.utils";
import { getTxExplorerUrl } from "../constants/explorer.constants";

interface UseEmporiumCallProps {
  tokens: Token[];
  onLog: (text: string, kind?: LogKind) => void;
}

export const useEmporiumCall = ({ tokens, onLog }: UseEmporiumCallProps) => {
  const { hinkal, chainId } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const call = useCallback(
    async (ops: OpRow[], deltas: DeltaRow[], feeTokenInput: string) => {
      if (!hinkal || !chainId) throw new Error("Account not connected");

      try {
        setIsProcessing(true);

        const encodedOps = ops.map((op, index) => {
          const { address, signature, args, contract, functionName } =
            parseOpRow(op, index);
          onLog(`op${index + 1}: ${address} ${signature}`);
          return hinkal.emporiumOp(contract, functionName, args);
        });
        if (!encodedOps.length) throw new Error("no ops");

        const { tokenAddresses, deltaAmounts, described } = parseDeltaRows(
          deltas,
          tokens,
        );
        if (!tokenAddresses.length) throw new Error("no token deltas");
        described.forEach((d) => onLog(`delta: ${d}`));

        const feeToken = feeTokenInput.trim() || tokenAddresses[0];
        if (!ethers.isAddress(feeToken))
          throw new Error("invalid fee token address");

        onLog(`sending ${encodedOps.length} op(s)...`);

        const txHash = await hinkal.actionPrivateWallet(
          chainId,
          tokenAddresses,
          deltaAmounts,
          tokenAddresses.map(() => false),
          encodedOps,
          feeToken,
        );

        onLog(`sent: ${txHash}`, "ok");
        const explorerUrl = getTxExplorerUrl(chainId, txHash);
        if (explorerUrl) onLog(explorerUrl, "ok");

        return txHash;
      } finally {
        setIsProcessing(false);
      }
    },
    [hinkal, chainId, tokens, onLog],
  );

  return { call, isProcessing };
};
