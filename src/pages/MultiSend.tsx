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
import { ERC20Token, getErc20Token } from "@gurg/hi-test";
import { useAppContext } from "../AppContext";
import { useMultiSend } from "../hooks/useMultiSend";
import {
  SCHEDULE_OPTIONS,
  ScheduleOption,
} from "../constants/schedule.constants";
import { ButtonGroupWithLabel } from "../utils/buttonGroupWithLabel";
import { RecipientInputRow } from "../utils/recipientInfoRow";
import { BALANCE_REFRESH_DELAY_AFTER_TX } from "../constants/balance-refresh-delay.constants";
import { zeroAddress } from "../constants";
import { getTokenData } from "../constants/token-data";

const NON_NATIVE_GAS_TOKENS = ["USDC", "USDT", "DAI"];

export const MultiSend = () => {
  const { hinkal, refreshBalances, chainId } = useAppContext();

  const [allowedTokens, setAllowedTokens] = useState<ERC20Token[]>([]);

  useEffect(() => {
    let isCancelled = false;

    const loadAllowedTokens = async () => {
      if (!chainId) {
        if (!isCancelled) setAllowedTokens([]);
        return;
      }

      const nativeToken = await getErc20Token(chainId, zeroAddress);

      const tokenData = getTokenData(chainId);

      const stablecoinsData = tokenData.filter((token) =>
        NON_NATIVE_GAS_TOKENS.includes(token.symbol),
      );

      const stablecoins = (
        await Promise.all(
          stablecoinsData.map((token) =>
            getErc20Token(chainId, token.erc20TokenAddress),
          ),
        )
      ).filter((token) => token !== undefined);

      if (!isCancelled) {
        setAllowedTokens(
          nativeToken ? [nativeToken, ...stablecoins] : stablecoins,
        );
      }
    };

    loadAllowedTokens();

    return () => {
      isCancelled = true;
    };
  }, [chainId]);

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined,
  );

  const [address1, setAddress1] = useState<string>("");
  const [amount1, setAmount1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [amount2, setAmount2] = useState<string>("");

  const [schedule, setSchedule] = useState<ScheduleOption>("instantly");
  const [intervalBetweenTxs, setIntervalBetweenTxs] =
    useState<ScheduleOption>("instantly");

  const { multiSend, isProcessing, fee, isFeeLoading, calculateFee } =
    useMultiSend({
      onError: (err) => {
        const message = err instanceof Error ? err.message : "Unknown error";
        toast.error(message, { id: message });
      },
      onSuccess: async () => {
        toast.success("Multi send succeeded!");
        setAddress1("");
        setAmount1("");
        setAddress2("");
        setAmount2("");
        await refreshBalances(BALANCE_REFRESH_DELAY_AFTER_TX);
      },
    });

  useEffect(() => {
    if (!chainId) {
      setSelectedToken(undefined);
      return;
    }

    if (selectedToken) {
      const isTokenStillValid = allowedTokens.some(
        (token) =>
          token.erc20TokenAddress.toLowerCase() ===
          selectedToken.erc20TokenAddress.toLowerCase(),
      );

      if (!isTokenStillValid) setSelectedToken(allowedTokens[0] || undefined);
    }
  }, [chainId, allowedTokens, selectedToken]);

  useEffect(() => {
    if (selectedToken) calculateFee(selectedToken);
  }, [selectedToken, calculateFee]);

  const setAmountHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    setValue: (value: string) => void,
  ) => {
    if (/^[0-9]*[.]?[0-9]*$/.test(event.target.value)) {
      setValue(event.target.value);
    }
  };

  const handleMultiSend = useCallback(async () => {
    if (!selectedToken) return;
    await multiSend(
      selectedToken,
      address1,
      amount1,
      address2,
      amount2,
      schedule,
    );
  }, [
    multiSend,
    selectedToken,
    address1,
    amount1,
    address2,
    amount2,
    schedule,
  ]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () =>
      !hinkal ||
      !selectedToken ||
      !address1 ||
      !amount1 ||
      !address2 ||
      !amount2 ||
      isProcessing,
    [hinkal, selectedToken, address1, amount1, address2, amount2, isProcessing],
  );

  return (
    <div className="text-white">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 w-[96%] mx-auto mb-4">
          <SelectToken
            swapToken={selectedToken}
            onTokenChange={(prev, cur) => setSelectedToken(cur)}
            disabled={isProcessing}
            tokenFilter={(token) =>
              allowedTokens.some(
                (allowedToken) =>
                  allowedToken.erc20TokenAddress.toLowerCase() ===
                  token.erc20TokenAddress.toLowerCase(),
              )
            }
          />
        </div>

        <RecipientInputRow
          addressValue={address1}
          amountValue={amount1}
          onAddressChange={(e) => setAddress1(e.target.value)}
          onAmountChange={(event) => setAmountHandler(event, setAmount1)}
          disabled={isProcessing}
        />

        <RecipientInputRow
          addressValue={address2}
          amountValue={amount2}
          onAddressChange={(e) => setAddress2(e.target.value)}
          onAmountChange={(event) => setAmountHandler(event, setAmount2)}
          disabled={isProcessing}
        />

        <ButtonGroupWithLabel
          label="Interval Between Transactions"
          options={SCHEDULE_OPTIONS}
          selected={intervalBetweenTxs}
          onSelect={(option) => setIntervalBetweenTxs(option as ScheduleOption)}
          disabled={isProcessing}
        />

        <div className="border-solid">
          <button
            type="submit"
            disabled={isDisabled}
            onClick={handleMultiSend}
            className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              !isDisabled
                ? "bg-primary text-white hover:bg-[#4d32fa] duration-200"
                : "bg-[#37363d] text-[#848688] cursor-not-allowed"
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-x-2">
                <span>Sending</span> <Spinner />
              </div>
            ) : (
              <span>Send</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
