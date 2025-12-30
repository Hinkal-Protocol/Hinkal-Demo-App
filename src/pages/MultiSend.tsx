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
import { SwapBalanceDisplay } from "../components/swap/SwapBalanceDisplay";
import {
  ERC20Token,
  getERC20TokenBySymbol,
  getERC20Token,
  getAmountInToken,
  getErrorMessage,
  ErrorCategory,
} from "@sabaaa1/common";
import { useAppContext } from "../AppContext";
import { useMultiSend } from "../hooks/useMultiSend";
import {
  SCHEDULE_OPTIONS,
  ScheduleOption,
} from "../constants/schedule.constants";
import { ButtonGroupWithLabel } from "../utils/buttonGroupWithLabel";
import { RecipientInputRow } from "../utils/recipientInfoRow";

const NON_NATIVE_GAS_TOKENS = ["USDC", "USDT", "DAI"];
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MultiSend = () => {
  const { hinkal, refreshBalances, chainId } = useAppContext();

  const allowedTokens = useMemo(() => {
    if (!chainId) return [];

    const nativeToken = getERC20Token(ZERO_ADDRESS, chainId);

    const stablecoins = NON_NATIVE_GAS_TOKENS.map((symbol) =>
      getERC20TokenBySymbol(symbol, chainId)
    ).filter((token): token is ERC20Token => token !== undefined);

    return nativeToken ? [nativeToken, ...stablecoins] : stablecoins;
  }, [chainId]);

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined
  );
  const [totalAmount, setTotalAmount] = useState<string>("");

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
        const message = getErrorMessage(err, ErrorCategory.DEPOSIT);
        if (message !== "Multi send failed") {
          toast.error(message);
        }
      },
      onSuccess: async () => {
        toast.success("Multi send successed!");
        setAddress1("");
        setAmount1("");
        setAddress2("");
        setAmount2("");
        setTotalAmount("");
        await refreshBalances();
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
          selectedToken.erc20TokenAddress.toLowerCase()
      );

      if (!isTokenStillValid) setSelectedToken(allowedTokens[0] || undefined);
    }
  }, [chainId, allowedTokens, selectedToken]);

  useEffect(() => {
    if (selectedToken) calculateFee(selectedToken);
  }, [selectedToken, calculateFee]);

  const setAmountHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    setValue: (value: string) => void
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
      intervalBetweenTxs
    );
  }, [
    multiSend,
    selectedToken,
    address1,
    amount1,
    address2,
    amount2,
    schedule,
    intervalBetweenTxs,
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
    [hinkal, selectedToken, address1, amount1, address2, amount2, isProcessing]
  );

  const feeDisplay = useMemo(() => {
    if (!fee || !selectedToken) return "0.00";
    return getAmountInToken(selectedToken, fee);
  }, [fee, selectedToken]);

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
                  token.erc20TokenAddress.toLowerCase()
              )
            }
          />
          <SwapBalanceDisplay token={selectedToken} />
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
          label="Schedule Transfer"
          options={SCHEDULE_OPTIONS}
          selected={schedule}
          onSelect={(option) => setSchedule(option as ScheduleOption)}
          disabled={isProcessing}
        />

        <ButtonGroupWithLabel
          label="Interval Between Transactions"
          options={SCHEDULE_OPTIONS}
          selected={intervalBetweenTxs}
          onSelect={(option) => setIntervalBetweenTxs(option as ScheduleOption)}
          disabled={isProcessing}
        />

        <div className="w-[96%] mx-auto mb-4 flex justify-between items-center text-[14px]">
          <span className="text-gray-400">Fees</span>
          <span className="text-white">
            {isFeeLoading ? (
              <Spinner />
            ) : (
              `${feeDisplay} ${selectedToken?.symbol || ""}`
            )}
          </span>
        </div>

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
