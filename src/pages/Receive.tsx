import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";
import { ReceiveVaultBlockReason, ReceiveVaultBlockedFund } from "@hinkal/common";
import { Spinner } from "../components/Spinner";
import { useAppContext } from "../AppContext";
import { useReceiveVault } from "../hooks/useReceiveVault";
import { useReceiveVaultAccount } from "../hooks/useReceiveVaultAccount";
import {
  receiveVaultBlockedFundKey,
  useReceiveVaultRecover,
} from "../hooks/useReceiveVaultRecover";
import { copyToClipboard } from "../utils/copyToClipboard";
import { getAmountInToken } from "../utils/amount.utils";
import { getTokenData } from "../constants/token-data";
import { findToken } from "../utils/token.utils";
import { networkRegistry } from "../constants/networkRegistry";

const BLOCK_REASON_LABEL: Record<string, string> = {
  [ReceiveVaultBlockReason.NotShieldable]: "token can't be shielded",
  [ReceiveVaultBlockReason.RiskySender]: "sender flagged",
};

const useBlockedFundToken = (fund: ReceiveVaultBlockedFund) =>
  useMemo(
    () => findToken(getTokenData(fund.chainId), fund.erc20Address),
    [fund.chainId, fund.erc20Address],
  );

const BlockedFundRow = ({
  fund,
  activeChainId,
  isRecovering,
  isRecoverDisabled,
  onRecover,
}: {
  fund: ReceiveVaultBlockedFund;
  activeChainId: number | undefined;
  isRecovering: boolean;
  isRecoverDisabled: boolean;
  onRecover: () => void;
}) => {
  const token = useBlockedFundToken(fund);
  const onWrongChain = fund.chainId !== activeChainId;
  const networkName = networkRegistry[fund.chainId]?.name ?? `chain ${fund.chainId}`;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center space-x-4">
        {token?.logoURI && (
          <img src={token.logoURI} alt={token.symbol} className="w-[26px]" />
        )}
        <div>
          <p className="text-white text-[16px] font-semibold">
            {token
              ? `${Number(getAmountInToken(token, fund.amount)).toFixed(4)} ${token.symbol}`
              : fund.amount.toString()}
          </p>
          <p className="text-hinkal-white-300 text-[11px]">
            {networkName} — {BLOCK_REASON_LABEL[fund.reason] ?? fund.reason}
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={isRecoverDisabled}
        title={onWrongChain ? `Switch to ${networkName} to recover` : undefined}
        onClick={onRecover}
        className="rounded-md bg-primary px-3 py-1 text-[12px] font-semibold text-white hover:bg-hinkal-purple-200 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRecovering ? (
          <span className="flex items-center gap-x-1">
            Recover <Spinner />
          </span>
        ) : (
          "Recover"
        )}
      </button>
    </div>
  );
};

export const Receive = () => {
  const { hinkal, chainId } = useAppContext();
  const { record, isLoading, error, regenerate } = useReceiveVault();
  const { blockedFunds, refresh: refreshAccount } = useReceiveVaultAccount();
  const { recover, recoveringKey } = useReceiveVaultRecover({
    onSuccess: () => {
      toast.success("Funds sent");
      refreshAccount();
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Receive address recovery failed",
      );
    },
  });

  const isSupported = !!hinkal && !!chainId && hinkal.isReceiveVaultSupported(chainId);

  const handleCopyAddress = useCallback(() => {
    if (!record) return;
    copyToClipboard(record.vaultAddress);
    toast.success("Deposit address copied to clipboard");
  }, [record]);

  const isCopyDisabled = !record || isLoading;

  return (
    <div className="text-white">
      <div className="w-[96%] mx-auto mb-4">
        <label
          htmlFor="receiveAddress"
          className="text-white text-[14px] font-[300]"
        >
          Deposit address
        </label>
        <input
          id="receiveAddress"
          type="text"
          readOnly
          placeholder={
            !isSupported
              ? "Not available on this network"
              : isLoading
                ? "Creating address…"
                : "No deposit address"
          }
          className="bg-hinkal-blue-900 h-10 w-full rounded-lg text-[16px] pl-2 outline-none placeholder:text-[13.5px] mt-1 text-white"
          value={record?.vaultAddress ?? ""}
        />
        {error && <p className="text-hinkal-red-100 text-[13px] mt-1">{error}</p>}
      </div>

      <div className="w-[96%] mx-auto mb-4 text-[12px] text-hinkal-gray-100">
        <p>
          Send any supported token to this address on any supported chain, the
          way you would to any other wallet: what arrives is shielded into
          your private balance. Anything else sent here can only be recovered
          to your own wallet, below.
        </p>
      </div>

      <div className="w-[90%] mx-auto mb-4 mt-[20px] h-[1px] bg-hinkal-blue-900" />
      <div className="border-solid">
        <button
          type="button"
          disabled={isCopyDisabled}
          onClick={handleCopyAddress}
          className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
            !isCopyDisabled
              ? "bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300"
              : "bg-hinkal-blue-900 text-hinkal-gray-200 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-x-2">
              <span>Creating address</span> <Spinner />
            </div>
          ) : (
            <span>Copy address</span>
          )}
        </button>
        <button
          type="button"
          disabled={!isSupported || isLoading}
          onClick={() => regenerate()}
          className="w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none border border-hinkal-blue-900 text-white hover:bg-hinkal-blue-900 transition-all duration-300 disabled:cursor-not-allowed disabled:text-hinkal-gray-200"
        >
          Generate new address
        </button>
      </div>

      {blockedFunds.length > 0 && (
        <>
          <div className="w-[90%] mx-auto mb-4 mt-2 h-[1px] bg-hinkal-blue-900" />
          <div className="w-[90%] mx-auto mb-4">
            <p className="text-hinkal-white-300 text-[12px] mb-3">
              Blocked funds
            </p>
            <div className="flex flex-col gap-3">
              {blockedFunds.map((fund) => {
                const key = receiveVaultBlockedFundKey(fund);

                return (
                  <BlockedFundRow
                    key={key}
                    fund={fund}
                    activeChainId={chainId}
                    isRecovering={recoveringKey === key}
                    isRecoverDisabled={
                      fund.chainId !== chainId || recoveringKey !== null
                    }
                    onRecover={() => recover(fund)}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
