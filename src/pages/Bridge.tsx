import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatUnits } from "ethers";
import { Spinner } from "../components/Spinner";
import { SelectToken } from "../components/swap/SelectToken";
import { useAppContext } from "../AppContext";
import { MultiSendRecipient } from "../hooks/useMultiSend";
import { useBridge } from "../hooks/useBridge";
import { ButtonGroupWithLabel } from "../utils/buttonGroupWithLabel";
import { RecipientInputRow } from "../utils/recipientInfoRow";
import { Token, ScheduleDelayOption } from "../types";
import { chainIds } from "../constants/chains.constants";
import { networkRegistry } from "../constants/networkRegistry";
import { getTokenData } from "../constants/token-data";

const SCHEDULE_DELAY_OPTIONS = Object.values(ScheduleDelayOption);

const DESTINATION_CHAIN_IDS = [
  chainIds.ethMainnet,
  chainIds.arbMainnet,
  chainIds.polygon,
  chainIds.base,
  chainIds.bnbMainnet,
  chainIds.solanaMainnet,
  chainIds.tronMainnet,
];

const emptyRecipient = (): MultiSendRecipient => ({ address: "", amount: "" });

const selectClassName =
  "bg-hinkal-blue-900 h-10 rounded-lg px-3 text-[14px] outline-none text-white flex-1";

export const Bridge = () => {
  const { hinkal, chainId } = useAppContext();

  const [selectedToken, setSelectedToken] = useState<Token | undefined>();
  const [destinationChainId, setDestinationChainId] = useState<number>(
    chainIds.base
  );
  const [destinationTokenAddress, setDestinationTokenAddress] = useState("");
  const [recipients, setRecipients] = useState<MultiSendRecipient[]>([
    emptyRecipient(),
  ]);
  const [slippage, setSlippage] = useState("");
  const [selectedScheduleDelay, setSelectedScheduleDelay] =
    useState<ScheduleDelayOption>(ScheduleDelayOption.INSTANTLY);

  const destinationTokens = useMemo(
    () => getTokenData(destinationChainId),
    [destinationChainId]
  );
  const destinationToken = useMemo(
    () =>
      destinationTokens.find(
        (t) =>
          t.erc20TokenAddress.toLowerCase() ===
          destinationTokenAddress.toLowerCase()
      ),
    [destinationTokens, destinationTokenAddress]
  );

  const {
    quote,
    setQuote,
    getQuote,
    isQuoting,
    bridge,
    isBridging,
    scheduleId,
    scheduleStatuses,
  } = useBridge({
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message, { id: message });
    },
    onSuccess: () => {
      toast.success("Deposit confirmed");
      setRecipients([emptyRecipient()]);
    },
  });

  useEffect(() => {
    setSelectedToken(undefined);
    setRecipients([emptyRecipient()]);
  }, [chainId]);

  useEffect(() => {
    const usdc = destinationTokens.find((t) => t.symbol === "USDC");
    setDestinationTokenAddress(
      (usdc ?? destinationTokens[0])?.erc20TokenAddress ?? ""
    );
  }, [destinationTokens]);

  // Any input change invalidates the quote: it was issued for the old inputs.
  useEffect(() => {
    setQuote(null);
  }, [
    selectedToken,
    destinationTokenAddress,
    recipients,
    slippage,
    selectedScheduleDelay,
    setQuote,
  ]);

  const updateRecipient = useCallback(
    (index: number, field: keyof MultiSendRecipient, value: string) => {
      setRecipients((prev) =>
        prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
      );
    },
    []
  );

  const handleAmountChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      if (/^[0-9]*[.]?[0-9]*$/.test(event.target.value)) {
        updateRecipient(index, "amount", event.target.value);
      }
    },
    [updateRecipient]
  );

  const handleGetQuote = useCallback(async () => {
    if (!selectedToken || !destinationToken) return;
    await getQuote(
      selectedToken,
      destinationToken,
      recipients,
      selectedScheduleDelay,
      slippage ? Number(slippage) : undefined
    );
  }, [
    getQuote,
    selectedToken,
    destinationToken,
    recipients,
    selectedScheduleDelay,
    slippage,
  ]);

  const handleBridge = useCallback(async () => {
    if (!selectedToken) return;
    await bridge(selectedToken, selectedScheduleDelay);
  }, [bridge, selectedToken, selectedScheduleDelay]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const inputsIncomplete =
    !hinkal ||
    !selectedToken ||
    !destinationToken ||
    recipients.length === 0 ||
    recipients.some((r) => !r.address || !r.amount);
  const isBusy = isQuoting || isBridging;
  const quoteDisabled = inputsIncomplete || isBusy;
  const bridgeDisabled = inputsIncomplete || isBusy || !quote;

  const buttonClass = (disabled: boolean) =>
    `w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
      !disabled
        ? "bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300"
        : "bg-hinkal-blue-900 text-hinkal-gray-200 cursor-not-allowed"
    }`;

  return (
    <div className="text-white">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 w-[96%] mx-auto mb-4">
          <SelectToken
            swapToken={selectedToken}
            onTokenChange={(prev, cur) => setSelectedToken(cur)}
            disabled={isBusy}
          />
        </div>

        <div className="flex gap-2 w-[96%] mx-auto mb-4">
          <select
            className={selectClassName}
            value={destinationChainId}
            disabled={isBusy}
            onChange={(e) => setDestinationChainId(Number(e.target.value))}
          >
            {DESTINATION_CHAIN_IDS.map((id) => (
              <option key={id} value={id}>
                {networkRegistry[id]?.name ?? id}
              </option>
            ))}
          </select>
          <select
            className={selectClassName}
            value={destinationTokenAddress}
            disabled={isBusy}
            onChange={(e) => setDestinationTokenAddress(e.target.value)}
          >
            {destinationTokens.map((t) => (
              <option key={t.erc20TokenAddress} value={t.erc20TokenAddress}>
                {t.symbol}
              </option>
            ))}
          </select>
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
            disabled={isBusy}
            onRemove={
              recipients.length > 1
                ? () =>
                    setRecipients((prev) => prev.filter((_, i) => i !== index))
                : undefined
            }
            removeLabel={`Remove recipient ${index + 1}`}
          />
        ))}

        <div className="w-[96%] mx-auto mb-4 px-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setRecipients((prev) => [...prev, emptyRecipient()])}
            disabled={isBusy}
            className="text-[13px] text-primary hover:text-hinkal-purple-200 transition-all duration-300 disabled:cursor-not-allowed disabled:text-hinkal-gray-200"
          >
            + Add recipient
          </button>
          <input
            type="text"
            placeholder="Slippage % (auto)"
            className="bg-hinkal-blue-900 h-9 rounded-lg px-3 text-[13px] outline-none text-white w-36"
            value={slippage}
            disabled={isBusy}
            onChange={(e) => {
              if (/^[0-9]*[.]?[0-9]*$/.test(e.target.value))
                setSlippage(e.target.value);
            }}
          />
        </div>

        <ButtonGroupWithLabel
          label="Transaction Schedule"
          options={SCHEDULE_DELAY_OPTIONS}
          selected={selectedScheduleDelay}
          onSelect={(option) =>
            setSelectedScheduleDelay(option as ScheduleDelayOption)
          }
          disabled={isBusy}
        />

        {quote && destinationToken && (
          <div className="w-[90%] mx-[5%] mb-3 p-3 rounded-lg bg-hinkal-blue-900 text-sm">
            <p className="font-semibold mb-1">
              Quote ({quote.lifiRecipients?.length ? "LI.FI" : "NEAR Intents"})
            </p>
            {quote.expectedAmounts.map((amount, i) => (
              <p key={i} className="text-hinkal-gray-200">
                Recipient {i + 1} receives ~
                {formatUnits(amount, destinationToken.decimals)}{" "}
                {destinationToken.symbol}
              </p>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={quoteDisabled}
          onClick={handleGetQuote}
          className={buttonClass(quoteDisabled)}
        >
          {isQuoting ? (
            <div className="flex items-center justify-center gap-x-2">
              <span>Fetching quote</span> <Spinner />
            </div>
          ) : (
            <span>{quote ? "Refresh quote" : "Get quote"}</span>
          )}
        </button>

        <button
          type="submit"
          disabled={bridgeDisabled}
          onClick={handleBridge}
          className={buttonClass(bridgeDisabled)}
        >
          {isBridging ? (
            <div className="flex items-center justify-center gap-x-2">
              <span>Bridging</span> <Spinner />
            </div>
          ) : (
            <span>Bridge</span>
          )}
        </button>
      </form>

      {scheduleId && (
        <div className="w-[90%] mx-[5%] mt-2 p-3 rounded-lg bg-hinkal-blue-900 text-sm">
          <p className="font-semibold mb-2">Scheduled bridges</p>
          {scheduleStatuses.length === 0 ? (
            <p className="text-hinkal-gray-200">Loading status...</p>
          ) : (
            scheduleStatuses.map((tx, i) => (
              <p key={i} className="text-hinkal-gray-200">
                Leg {i + 1}: {tx.status}
                {tx.txHash ? ` (${tx.txHash.slice(0, 10)}...)` : ""}
              </p>
            ))
          )}
        </div>
      )}
    </div>
  );
};
