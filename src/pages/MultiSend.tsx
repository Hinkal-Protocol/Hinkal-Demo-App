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
import {
  ERC20Token,
  getERC20TokenBySymbol,
  getERC20Token,
  getErrorMessage,
  ErrorCategory,
} from "@hinkal/common";
import { useAppContext } from "../AppContext";
import { useMultiSend } from "../hooks/useMultiSend";
import {
  SCHEDULE_OPTIONS,
  ScheduleOption,
} from "../constants/schedule.constants";
import { ButtonGroupWithLabel } from "../utils/buttonGroupWithLabel";
import { RecipientInputRow } from "../utils/recipientInfoRow";
import { BALANCE_REFRESH_DELAY_AFTER_TX } from "../constants/balance-refresh-delay.constants";

const NON_NATIVE_GAS_TOKENS = ["USDC", "USDT", "DAI"];
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const MultiSend = () => {
  const { hinkal, refreshBalances, chainId } = useAppContext();

  const allowedTokens = useMemo(() => {
    if (!chainId) return [];

    const nativeToken = getERC20Token(ZERO_ADDRESS, chainId);

    const stablecoins = NON_NATIVE_GAS_TOKENS.map((symbol) =>
      getERC20TokenBySymbol(symbol, chainId),
    ).filter((token): token is ERC20Token => token !== undefined);

    return nativeToken ? [nativeToken, ...stablecoins] : stablecoins;
  }, [chainId]);

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined,
  );
  const [totalAmount, setTotalAmount] = useState<string>("");

  const [address1, setAddress1] = useState<string>("");
  const [amount1, setAmount1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [amount2, setAmount2] = useState<string>("");

  const [schedule, setSchedule] = useState<ScheduleOption>("instantly");
  const [intervalBetweenTxs, setIntervalBetweenTxs] =
    useState<ScheduleOption>("instantly");

  const {
    multiSend,
    isDepositing,
    scheduleId,
    scheduleStatuses,
    calculateFee,
  } = useMultiSend({
    onError: (err) => {
      const message = getErrorMessage(err, ErrorCategory.DEPOSIT);
      if (message !== "Multi send failed") {
        toast.error(message);
      }
    },
    onSuccess: async () => {
      toast.success("Deposit confirmed");
      setAddress1("");
      setAmount1("");
      setAddress2("");
      setAmount2("");
      setTotalAmount("");
      await refreshBalances(BALANCE_REFRESH_DELAY_AFTER_TX);
    },
  });

  useEffect(() => {
    setAddress1("");
    setAmount1("");
    setAddress2("");
    setAmount2("");
    setTotalAmount("");
  }, [chainId]);

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
      isDepositing,
    [hinkal, selectedToken, address1, amount1, address2, amount2, isDepositing],
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
          disabled={isDepositing}
        />

        <RecipientInputRow
          addressValue={address2}
          amountValue={amount2}
          onAddressChange={(e) => setAddress2(e.target.value)}
          onAmountChange={(event) => setAmountHandler(event, setAmount2)}
          disabled={isDepositing}
        />

        <ButtonGroupWithLabel
          label="Schedule Transfer"
          options={SCHEDULE_OPTIONS}
          selected={schedule}
          onSelect={(option) => setSchedule(option as ScheduleOption)}
          disabled={isDepositing}
        />

        <ButtonGroupWithLabel
          label="Interval Between Transactions"
          options={SCHEDULE_OPTIONS}
          selected={intervalBetweenTxs}
          onSelect={(option) => setIntervalBetweenTxs(option as ScheduleOption)}
          disabled={isDepositing}
        />

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
