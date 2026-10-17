import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { useAppContext } from "../AppContext";
import {
  PrivateBridgeResult,
  usePrivateBridge,
} from "../hooks/usePrivateBridge";
import { Token } from "../types";
import { getTokenData } from "../constants/token-data";
import { networkRegistry } from "../constants/networkRegistry";
import { BRIDGE_DESTINATION_CHAIN_IDS } from "../constants/bridge.constants";
import { getShieldedBalanceWei } from "../utils/balance.utils";
import { getAmountInToken, getAmountInWei } from "../utils/amount.utils";
import { findToken } from "../utils/token.utils";

type BridgeOutcome = PrivateBridgeResult & { destinationToken: Token };

const getChainName = (chainId: number) =>
  networkRegistry[chainId]?.name ?? String(chainId);

const selectClassName =
  "bg-hinkal-blue-900 h-10 rounded-lg px-3 text-[14px] outline-none text-white flex-1";

export const PrivateBridge = () => {
  const { hinkal, chainId, chainBalances } = useAppContext();

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    undefined,
  );
  const [bridgeAmount, setBridgeAmount] = useState<string>("");
  const [destinationChainId, setDestinationChainId] = useState<number>(
    BRIDGE_DESTINATION_CHAIN_IDS[0],
  );
  const [destinationTokenAddress, setDestinationTokenAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [slippage, setSlippage] = useState<string>("");
  const [outcome, setOutcome] = useState<BridgeOutcome | undefined>(undefined);

  const destinationTokens = useMemo(
    () => getTokenData(destinationChainId),
    [destinationChainId],
  );
  const destinationToken = useMemo(
    () =>
      findToken(destinationTokens, destinationTokenAddress, destinationChainId),
    [destinationTokens, destinationTokenAddress, destinationChainId],
  );

  const { bridge, isProcessing } = usePrivateBridge({
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast.error(message, { id: message });
    },
    onSuccess: (result, bridgedToken) => {
      toast.success("Bridge submitted");
      setOutcome({ ...result, destinationToken: bridgedToken });
      setBridgeAmount("");
    },
  });

  useEffect(() => {
    if (!chainId) return;
    setSelectedToken(undefined);
    setBridgeAmount("");
    setOutcome(undefined);
  }, [chainId]);

  // Default to the same token on the destination chain (USDC -> USDC), else USDC.
  useEffect(() => {
    const preferred =
      destinationTokens.find((t) => t.symbol === selectedToken?.symbol) ??
      destinationTokens.find((t) => t.symbol === "USDC") ??
      destinationTokens[0];
    setDestinationTokenAddress(preferred?.erc20TokenAddress ?? "");
  }, [destinationTokens, selectedToken?.symbol]);

  const exceedsBalance = useMemo(() => {
    if (!selectedToken || !bridgeAmount || !chainId) return false;
    try {
      return (
        getAmountInWei(selectedToken, bridgeAmount) >
        getShieldedBalanceWei(chainBalances, selectedToken)
      );
    } catch {
      return false;
    }
  }, [selectedToken, bridgeAmount, chainBalances, chainId]);

  const handleBridge = useCallback(() => {
    if (!selectedToken || !destinationToken) return;
    setOutcome(undefined);
    bridge(
      selectedToken,
      destinationToken,
      bridgeAmount,
      recipientAddress.trim() || undefined,
      slippage ? Number(slippage) : undefined,
    );
  }, [
    bridge,
    selectedToken,
    destinationToken,
    bridgeAmount,
    recipientAddress,
    slippage,
  ]);

  const bridgeButtonText = () => {
    if (!hinkal) return "Connect Wallet";
    if (!selectedToken || !destinationToken) return "Select a token";
    if (!bridgeAmount || Number(bridgeAmount) === 0) return "Enter an amount";
    if (exceedsBalance) return "Insufficient balance";
    return "Bridge";
  };

  const isDisabled = bridgeButtonText() !== "Bridge" || isProcessing;

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <form className="rounded-lg text-white" onSubmit={handleSubmit}>
      <TokenAmountInput
        tokenAmount={bridgeAmount}
        setTokenAmount={setBridgeAmount}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        withShieldedBalance
      />
      <div className="mt-[-3%] mb-4">
        <label className="text-white pl-[5%] text-[14px] font-[300]">To</label>
        <div className="flex gap-2 w-[90%] mx-auto mt-1">
          <select
            className={selectClassName}
            value={destinationChainId}
            disabled={isProcessing}
            onChange={(e) => setDestinationChainId(Number(e.target.value))}
          >
            {BRIDGE_DESTINATION_CHAIN_IDS.map((id) => (
              <option key={id} value={id}>
                {getChainName(id)}
              </option>
            ))}
          </select>
          <select
            className={selectClassName}
            value={destinationTokenAddress}
            disabled={isProcessing}
            onChange={(e) => setDestinationTokenAddress(e.target.value)}
          >
            {destinationTokens.map((t) => (
              <option key={t.erc20TokenAddress} value={t.erc20TokenAddress}>
                {t.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-4">
        <label
          htmlFor="bridgeRecipientAddress"
          className="text-white pl-[5%] text-[14px] font-[300]"
        >
          Recipient deposit address (optional)
        </label>
        <input
          id="bridgeRecipientAddress"
          type="text"
          placeholder={`Deposit address on ${getChainName(
            destinationChainId,
          )}, empty = your own`}
          className="bg-hinkal-blue-900 h-10 w-[90%] rounded-lg ml-[5%] text-[16px] pl-2 outline-none placeholder:text-[13.5px] mt-1 text-white"
          disabled={isProcessing}
          onChange={(e) => setRecipientAddress(e.target.value)}
          value={recipientAddress}
        />
      </div>
      <div className="flex items-center justify-between w-[90%] mx-auto">
        <label
          htmlFor="bridgeSlippage"
          className="text-white text-[14px] font-[300]"
        >
          Slippage % (optional)
        </label>
        <input
          id="bridgeSlippage"
          type="text"
          placeholder="auto"
          className="bg-hinkal-blue-900 h-10 rounded-lg px-3 text-[14px] outline-none text-white w-24"
          disabled={isProcessing}
          onChange={(e) => {
            if (/^[0-9]*[.]?[0-9]*$/.test(e.target.value))
              setSlippage(e.target.value);
          }}
          value={slippage}
        />
      </div>

      {exceedsBalance && (
        <p className="w-[90%] mx-auto text-sm text-red-500 mt-2">
          Insufficient balance
        </p>
      )}

      {outcome && (
        <div className="w-[90%] mx-auto mt-4 p-3 rounded-lg bg-hinkal-blue-900 text-sm break-all">
          <p className="font-semibold mb-1">Bridge submitted</p>
          <p className="text-hinkal-gray-200">
            Source tx: {outcome.sourceTxHash}
          </p>
          <p className="text-hinkal-gray-200">
            Shields ~
            {getAmountInToken(
              outcome.destinationToken,
              BigInt(outcome.destinationTokenAmount),
            )}{" "}
            {outcome.destinationToken.symbol} on{" "}
            {getChainName(outcome.destinationToken.chainId)} once the deposit
            address settles
          </p>
        </div>
      )}

      <div className="w-[90%] mx-auto mb-6 mt-6 h-[1px] bg-hinkal-blue-900" />
      <div className=" border-solid ">
        <button
          type="submit"
          disabled={isDisabled}
          onClick={handleBridge}
          className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
            !isDisabled
              ? "bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300"
              : "bg-hinkal-blue-900 text-hinkal-gray-200 cursor-not-allowed"
          } `}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-x-2">
              <span>Bridging</span> <Spinner />{" "}
            </div>
          ) : (
            <span>{bridgeButtonText()}</span>
          )}
        </button>
      </div>
    </form>
  );
};
