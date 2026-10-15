import { useCallback } from "react";
import toast from "react-hot-toast";
import { formatUnits } from "ethers";
import { Spinner } from "../components/Spinner";
import { recoverableBalanceKey, useRecover } from "../hooks/useRecover";

const buttonClass =
  "rounded-lg h-9 px-4 text-sm font-semibold outline-none bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300 disabled:cursor-not-allowed disabled:bg-hinkal-blue-900 disabled:text-hinkal-gray-200";

export const Recover = () => {
  const onError = useCallback((err: unknown) => {
    const message = err instanceof Error ? err.message : "Unknown error";
    toast.error(message, { id: message });
  }, []);
  const onSuccess = useCallback(() => toast.success("Recovery submitted"), []);

  const { balances, isLoading, refresh, recover, recoveringKey } = useRecover({
    onSuccess,
    onError,
  });

  return (
    <div className="text-white w-[96%] mx-auto">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold">Recoverable balances (failed bridge/swap)</p>
        <button
          type="button"
          className={buttonClass}
          disabled={isLoading || recoveringKey !== null}
          onClick={refresh}
        >
          {isLoading ? <Spinner /> : "Refresh"}
        </button>
      </div>
      <p className="text-[12px] text-hinkal-gray-200 mb-4">
        Temporary wallets show up ~3 minutes after the bridge (in-transit
        window).
      </p>

      {!isLoading && balances.length === 0 && (
        <p className="text-sm text-hinkal-gray-200">Nothing to recover.</p>
      )}

      <div className="flex flex-col gap-2">
        {balances.map((balance) => {
          const key = recoverableBalanceKey(balance);
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-hinkal-blue-900 text-sm"
            >
              <div className="min-w-0">
                <p className="font-semibold">
                  {formatUnits(balance.balance, balance.token.decimals)}{" "}
                  {balance.token.symbol}
                </p>
                <p className="text-[12px] text-hinkal-gray-200 break-all">
                  {"assetId" in balance
                    ? "NEAR Intents refund"
                    : `Temp wallet ${balance.ethAddress} (${balance.recoveryDestination})`}
                </p>
              </div>
              <button
                type="button"
                className={buttonClass}
                disabled={recoveringKey !== null}
                onClick={() => recover(balance)}
              >
                {recoveringKey === key ? <Spinner /> : "Recover"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
