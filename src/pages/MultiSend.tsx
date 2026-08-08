import {
  SyntheticEvent,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { SelectToken } from "../components/swap/SelectToken";
import { ExternalActionId } from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { MultiSendRecipient, useMultiSend } from "../hooks/useMultiSend";
import { ButtonGroupWithLabel } from "../utils/buttonGroupWithLabel";
import { RecipientInputRow } from "../utils/recipientInfoRow";
import { getNativeTokenAddress } from "../constants";
import { Token, ScheduleDelayOption } from "../types";
import { useFee } from "../hooks/useFee";
import { isSameTokenAddress } from "../utils/token.utils";
import {
  isSolanaLike,
  resolveFeeOverride,
} from "../constants/solana-chain.constants";

const NON_NATIVE_GAS_TOKENS = ["USDC", "USDT", "DAI"];
const SCHEDULE_DELAY_OPTIONS = Object.values(ScheduleDelayOption);

const emptyRecipient = (): MultiSendRecipient => ({ address: "", amount: "" });

export const MultiSend = () => {
  const { hinkal, chainId, erc20List } = useAppContext();
  const isSolana = isSolanaLike(chainId);

  const allowedTokens = useMemo(() => {
    const nativeToken = erc20List.find(
      (token) => token.erc20TokenAddress === getNativeTokenAddress(chainId)
    );
    const stablecoins = erc20List.filter((token) =>
      NON_NATIVE_GAS_TOKENS.includes(token.symbol)
    );

    return nativeToken ? [nativeToken, ...stablecoins] : stablecoins;
  }, [erc20List, chainId]);

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    undefined
  );

  const [recipients, setRecipients] = useState<MultiSendRecipient[]>([
    emptyRecipient(),
  ]);

  const [selectedScheduleDelay, setSelectedScheduleDelay] =
    useState<ScheduleDelayOption>(ScheduleDelayOption.INSTANTLY);

  const updateRecipient = useCallback(
    (index: number, field: keyof MultiSendRecipient, value: string) => {
      setRecipients((prev) =>
        prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const addRecipient = useCallback(
    () => setRecipients((prev) => [...prev, emptyRecipient()]),
    []
  );

  const removeRecipient = useCallback(
    (index: number) =>
      setRecipients((prev) => prev.filter((_, i) => i !== index)),
    []
  );

  const tokenAddresses = useMemo(() => {
    return [selectedToken?.erc20TokenAddress];
  }, [selectedToken]);

  const solanaTransactionParams = useMemo(
    () =>
      isSolana
        ? {
            mintTo: selectedToken?.erc20TokenAddress,
            recipient: recipients[0]?.address || undefined,
          }
        : undefined,
    [isSolana, selectedToken, recipients]
  );

  const { isFeeLoading, feeStructure } = useFee(
    selectedToken,
    ExternalActionId.Transact,
    tokenAddresses,
    solanaTransactionParams
  );

  const { multiSend, isDepositing, scheduleId, scheduleStatuses } =
    useMultiSend({
      onError: (err) => {
        const raw = err instanceof Error ? err.message : "Unknown error";

        let message = raw;
        if (raw.includes("transfer amount exceeds balance")) {
          message = "Insufficient balance";
        } else if (raw.includes("execution reverted")) {
          const match = raw.match(/reason="([^"]+)"/);
          message = match ? match[1] : "Transaction reverted";
        }

        toast.error(message, { id: message });
      },
      onSuccess: async () => {
        toast.success("Deposit confirmed");
        setRecipients([emptyRecipient()]);
      },
    });

  useEffect(() => {
    setRecipients([emptyRecipient()]);
  }, [chainId]);

  useEffect(() => {
    if (!chainId) {
      setSelectedToken(undefined);
      return;
    }

    if (selectedToken) {
      const isTokenStillValid = allowedTokens.some((token) =>
        isSameTokenAddress(
          token.erc20TokenAddress,
          selectedToken.erc20TokenAddress,
          chainId
        )
      );

      if (!isTokenStillValid) setSelectedToken(allowedTokens[0] || undefined);
    }
  }, [chainId, allowedTokens, selectedToken]);

  const handleAmountChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      if (/^[0-9]*[.]?[0-9]*$/.test(event.target.value)) {
        updateRecipient(index, "amount", event.target.value);
      }
    },
    [updateRecipient]
  );

  const handleMultiSend = useCallback(async () => {
    if (!selectedToken) return;
    await multiSend(
      selectedToken,
      recipients,
      selectedScheduleDelay,
      resolveFeeOverride(chainId, feeStructure)
    );
  }, [
    multiSend,
    selectedToken,
    recipients,
    selectedScheduleDelay,
    feeStructure,
    chainId,
  ]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () =>
      !hinkal ||
      !selectedToken ||
      recipients.length === 0 ||
      recipients.some((r) => !r.address || !r.amount) ||
      isDepositing,
    [hinkal, selectedToken, recipients, isDepositing]
  );

  return (
    <div className="text-white">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 w-[96%] mx-auto mb-4">
          <SelectToken
            swapToken={selectedToken}
            onTokenChange={(prev, cur) => setSelectedToken(cur)}
            disabled={isDepositing}
            tokenFilter={(token) =>
              allowedTokens.some((allowedToken) =>
                isSameTokenAddress(
                  allowedToken.erc20TokenAddress,
                  token.erc20TokenAddress,
                  token.chainId
                )
              )
            }
          />
        </div>

        {recipients.map((recipient, index) => (
          <RecipientInputRow
            // Rows have no stable id; index is the identity here.
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            addressValue={recipient.address}
            amountValue={recipient.amount}
            onAddressChange={(e) =>
              updateRecipient(index, "address", e.target.value)
            }
            onAmountChange={(event) => handleAmountChange(index, event)}
            disabled={isDepositing}
            onRemove={
              recipients.length > 1 ? () => removeRecipient(index) : undefined
            }
            removeLabel={`Remove recipient ${index + 1}`}
          />
        ))}

        <div className="w-[96%] mx-auto mb-4 px-3">
          <button
            type="button"
            onClick={addRecipient}
            disabled={isDepositing}
            className="text-[13px] text-primary hover:text-hinkal-purple-200 transition-all duration-300 disabled:cursor-not-allowed disabled:text-hinkal-gray-200"
          >
            + Add recipient
          </button>
        </div>

        <ButtonGroupWithLabel
          label="Transaction Schedule"
          options={SCHEDULE_DELAY_OPTIONS}
          selected={selectedScheduleDelay}
          onSelect={(option) =>
            setSelectedScheduleDelay(option as ScheduleDelayOption)
          }
          disabled={isDepositing}
        />

        {feeStructure !== undefined && selectedToken && (
          <div className="w-[90%] mx-auto mb-2 text-sm text-gray-400 text-right">
            Fee:{" "}
            {isFeeLoading
              ? "Loading..."
              : `${(
                  Number(feeStructure.flatFee) /
                  10 ** (selectedToken.decimals || 18)
                ).toFixed(4)} ${selectedToken.symbol}`}
          </div>
        )}

        <div className="border-solid">
          <button
            type="submit"
            disabled={isDisabled}
            onClick={handleMultiSend}
            className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              !isDisabled
                ? "bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300"
                : "bg-hinkal-blue-900 text-hinkal-gray-200 cursor-not-allowed"
            }`}
          >
            {isDepositing ? (
              <div className="flex items-center justify-center gap-x-2">
                <span>Depositing</span> <Spinner />
              </div>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </form>

      {scheduleId && (
        <div className="w-[90%] mx-[5%] mt-2 p-3 rounded-lg bg-hinkal-blue-900 text-sm">
          <p className="font-semibold mb-2">Scheduled sends</p>
          {scheduleStatuses.length === 0 ? (
            <p className="text-hinkal-gray-200">Loading status...</p>
          ) : (
            scheduleStatuses.map((tx, i) => (
              <p key={i} className="text-hinkal-gray-200">
                Send {i + 1}: {tx.status}
                {tx.txHash ? ` (${tx.txHash.slice(0, 10)}...)` : ""}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
};
