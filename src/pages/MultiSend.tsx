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
import { ExternalActionId } from "@gurge/sdk";
import { useAppContext } from "../AppContext";
import { useMultiSend } from "../hooks/useMultiSend";
import { SCHEDULE_OPTIONS } from "../constants/schedule.constants";
import { ButtonGroupWithLabel } from "../utils/buttonGroupWithLabel";
import { RecipientInputRow } from "../utils/recipientInfoRow";
import { zeroAddress } from "../constants";
import { Token, ScheduleDelayOption } from "../types";
import { useFee } from "../hooks/useFee";
import { isSameTokenAddress } from "../utils/token.utils";

const NON_NATIVE_GAS_TOKENS = ["USDC", "USDT", "DAI"];

export const MultiSend = () => {
  const { hinkal, chainId, erc20List } = useAppContext();

  const allowedTokens = useMemo(() => {
    const nativeToken = erc20List.find(
      (token) => token.erc20TokenAddress === zeroAddress,
    );
    const stablecoins = erc20List.filter((token) =>
      NON_NATIVE_GAS_TOKENS.includes(token.symbol),
    );

    return nativeToken ? [nativeToken, ...stablecoins] : stablecoins;
  }, [erc20List]);

  const [selectedToken, setSelectedToken] = useState<Token | undefined>(
    undefined,
  );

  const [address1, setAddress1] = useState<string>("");
  const [amount1, setAmount1] = useState<string>("");
  const [address2, setAddress2] = useState<string>("");
  const [amount2, setAmount2] = useState<string>("");

  const [selectedScheduleDelay, setSelectedScheduleDelay] =
    useState<ScheduleDelayOption>(ScheduleDelayOption.INSTANTLY);

  const tokenAddresses = useMemo(() => {
    return [selectedToken?.erc20TokenAddress];
  }, [selectedToken]);

  const { isFeeLoading, feeStructure } = useFee(
    selectedToken,
    ExternalActionId.Transact,
    tokenAddresses,
  );

  const { multiSend, isProcessing } = useMultiSend({
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
      toast.success("Multi send succeeded!");
      setAddress1("");
      setAmount1("");
      setAddress2("");
      setAmount2("");
    },
  });

  useEffect(() => {
    setAddress1("");
    setAmount1("");
    setAddress2("");
    setAmount2("");
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
        ),
      );

      if (!isTokenStillValid) setSelectedToken(allowedTokens[0] || undefined);
    }
  }, [chainId, allowedTokens, selectedToken]);

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
      selectedScheduleDelay,
      feeStructure,
    );
  }, [
    multiSend,
    selectedToken,
    address1,
    amount1,
    address2,
    amount2,
    selectedScheduleDelay,
    feeStructure,
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
              allowedTokens.some((allowedToken) =>
                isSameTokenAddress(
                  allowedToken.erc20TokenAddress,
                  token.erc20TokenAddress,
                ),
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
          label="Transaction Schedule"
          options={SCHEDULE_OPTIONS}
          selected={selectedScheduleDelay}
          onSelect={(option) =>
            setSelectedScheduleDelay(option as ScheduleDelayOption)
          }
          disabled={isProcessing}
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
