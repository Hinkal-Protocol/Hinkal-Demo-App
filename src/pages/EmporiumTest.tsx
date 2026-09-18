import { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useAppContext } from "../AppContext";
import { Spinner } from "../components/Spinner";
import { AccountPanel } from "../components/emporium/AccountPanel";
import { DeltaFields } from "../components/emporium/DeltaFields";
import { LogPanel } from "../components/emporium/LogPanel";
import { OpFields } from "../components/emporium/OpFields";
import {
  DeltaRow,
  OpRow,
  emptyDelta,
  emptyOp,
} from "../components/emporium/types";
import { chainIds } from "../constants/chains.constants";
import { networkRegistry } from "../constants/networkRegistry";
import { getTokenData } from "../constants/token-data";
import { useActionLog } from "../hooks/useActionLog";
import { useEmporiumAccount } from "../hooks/useEmporiumAccount";
import { useEmporiumCall } from "../hooks/useEmporiumCall";
import { getShieldedBalanceWei } from "../utils/balance.utils";

const fieldClass =
  "w-full bg-transparent border border-hinkal-blue-900 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-primary transition-colors";
const labelClass = "text-hinkal-white-300 text-xs mb-1 block";
const linkButtonClass =
  "text-xs text-primary hover:text-hinkal-lavender-100 bg-transparent border-none cursor-pointer disabled:opacity-40 transition-colors";
const primaryButtonClass =
  "w-full bg-primary rounded-lg py-3 font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-x-2 hover:bg-hinkal-lavender-100 transition-colors";
const sectionTitleClass = "text-white font-semibold text-sm";

/** Chains with an Emporium deployment this tab can drive. */
const supportedChainIds = [
  chainIds.base,
  chainIds.arbMainnet,
  chainIds.optimism,
  chainIds.polygon,
  chainIds.ethMainnet,
];

const patchRow = <T,>(rows: T[], index: number, patch: Partial<T>) =>
  rows.map((row, i) => (i === index ? { ...row, ...patch } : row));

export const EmporiumTest = () => {
  const { chainId, chainBalances } = useAppContext();
  const { lines, append, clear } = useActionLog();

  const [privateKey, setPrivateKey] = useState("");
  const [selectedChainId, setSelectedChainId] = useState<number>(chainIds.base);
  const [ops, setOps] = useState<OpRow[]>([{ ...emptyOp }]);
  const [deltas, setDeltas] = useState<DeltaRow[]>([{ ...emptyDelta }]);
  const [feeToken, setFeeToken] = useState("");

  const networks = useMemo(
    () =>
      supportedChainIds
        .map((id) => networkRegistry[id])
        .filter((network): network is NonNullable<typeof network> => !!network),
    [],
  );

  const account = useEmporiumAccount({ onLog: append });

  const activeChainId = account.isConnected
    ? chainId ?? selectedChainId
    : selectedChainId;

  const tokens = useMemo(() => getTokenData(activeChainId), [activeChainId]);

  const { call, isProcessing } = useEmporiumCall({ tokens, onLog: append });

  const balances = useMemo(
    () =>
      tokens
        .map((token) => ({
          token,
          wei: getShieldedBalanceWei(chainBalances, token),
        }))
        .filter(({ wei }) => wei > 0n),
    [tokens, chainBalances],
  );

  const handleConnect = useCallback(async () => {
    clear();
    try {
      const connected = await account.connect(privateKey, selectedChainId);
      if (connected) {
        setPrivateKey("");
        toast.success("Hinkal account created");
      }
    } catch (err) {
      toast.error(`Connect failed: ${err}`);
    }
  }, [account, privateKey, selectedChainId, clear]);

  const handleCall = useCallback(async () => {
    clear();
    try {
      await call(ops, deltas, feeToken);
      toast.success("Emporium call sent");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      append(`failed: ${message}`, "err");
      toast.error(message);
    }
  }, [call, ops, deltas, feeToken, clear, append]);

  return (
    <div className="px-5 pb-8 flex flex-col gap-y-5">
      <AccountPanel
        networks={networks}
        selectedChainId={selectedChainId}
        onSelectChain={setSelectedChainId}
        privateKey={privateKey}
        onPrivateKeyChange={setPrivateKey}
        onConnect={handleConnect}
        isConnecting={account.isConnecting}
        isConnected={account.isConnected}
        ethAddress={account.ethAddress}
        balances={balances}
        onRefresh={account.refreshBalances}
        isRefreshing={account.isRefreshing}
      />

      {account.isConnected && (
        <div className="flex flex-col gap-y-4 border-t border-hinkal-blue-900 pt-5">
          <span className={sectionTitleClass}>2. Call through Emporium</span>

          {ops.map((op, index) => (
            <OpFields
              key={index}
              op={op}
              index={index}
              canRemove={ops.length > 1}
              onChange={(patch) =>
                setOps((prev) => patchRow(prev, index, patch))
              }
              onRemove={() =>
                setOps((prev) => prev.filter((_, i) => i !== index))
              }
            />
          ))}
          <button
            type="button"
            className={linkButtonClass}
            onClick={() => setOps((prev) => [...prev, { ...emptyOp }])}
          >
            + add op
          </button>

          <div className="flex flex-col gap-y-2">
            <span className="text-white text-xs font-semibold">
              Token deltas
            </span>
            <p className="text-hinkal-white-300 text-[11px]">
              Human amounts. Minus = leaves your account, plus = comes back.
            </p>

            {deltas.map((delta, index) => (
              <DeltaFields
                key={index}
                delta={delta}
                canRemove={deltas.length > 1}
                onChange={(patch) =>
                  setDeltas((prev) => patchRow(prev, index, patch))
                }
                onRemove={() =>
                  setDeltas((prev) => prev.filter((_, i) => i !== index))
                }
              />
            ))}
            <button
              type="button"
              className={linkButtonClass}
              onClick={() => setDeltas((prev) => [...prev, { ...emptyDelta }])}
            >
              + add token
            </button>
          </div>

          <div>
            <label className={labelClass}>
              Fee token (blank = first delta token)
            </label>
            <input
              className={fieldClass}
              placeholder="0x..."
              value={feeToken}
              onChange={(e) => setFeeToken(e.target.value)}
            />
          </div>

          <button
            type="button"
            className={primaryButtonClass}
            disabled={isProcessing}
            onClick={handleCall}
          >
            {isProcessing && <Spinner styleSize="size-5 mr-0" />}
            Call Emporium
          </button>
        </div>
      )}

      <LogPanel lines={lines} />
    </div>
  );
};
