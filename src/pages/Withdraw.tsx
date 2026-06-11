import {
  SyntheticEvent,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { toast } from "react-hot-toast";
import { InfoPanel } from "../components/InfoPanel";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { ToggleSwitch } from "../components/withdraw/ToggleSwitch";
import { useAppContext } from "../AppContext";
import { useWithdraw } from "../hooks/useWithdraw";
import {
  ERC20Token,
  ErrorCategory,
  getErrorMessage,
  getAmountInWei,
} from "@hinkal/common";
import { BALANCE_REFRESH_DELAY_AFTER_TX } from "../constants/balance-refresh-delay.constants";
import { getShieldedBalanceWei } from "../utils/balance.utils";

export const Withdraw = () => {
  const { hinkal, refreshBalances, chainId, balances } = useAppContext();

  const { withdraw, isProcessing } = useWithdraw({
    hinkal,
    onError: (err) => {
      const message = getErrorMessage(err, ErrorCategory.WITHDRAW);
      if (message !== "Send failed") {
        toast.error(message, { id: message });
      }
    },
    onSuccess: async () => {
      toast.success("Withdraw confirmed");
      await refreshBalances(BALANCE_REFRESH_DELAY_AFTER_TX);
    },
  });

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined,
  );
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isRelayerOff, setIsRelayerOff] = useState(false);
  const [showRelayerDetails, setShowRelayerDetails] = useState(false);

  useEffect(() => {
    if (!chainId) return;
    setSelectedToken(undefined);
    setWithdrawAmount("");
    setRecipientAddress("");
    setIsRelayerOff(false);
  }, [chainId]);

  const exceedsBalance = useMemo(() => {
    if (!selectedToken || !withdrawAmount) return false;
    try {
      return (
        getAmountInWei(selectedToken, withdrawAmount) >
        getShieldedBalanceWei(balances, selectedToken)
      );
    } catch {
      return false;
    }
  }, [selectedToken, withdrawAmount, balances]);

  const handleWithdraw = useCallback(() => {
    if (!selectedToken) return;
    withdraw?.(selectedToken, withdrawAmount, recipientAddress, isRelayerOff);
  }, [withdraw, selectedToken, withdrawAmount, recipientAddress, isRelayerOff]);

  const setRecipientAddressHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRecipientAddress(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () =>
      !hinkal ||
      !selectedToken ||
      !withdrawAmount ||
      !recipientAddress ||
      isProcessing ||
      exceedsBalance,
    [
      hinkal,
      selectedToken,
      withdrawAmount,
      recipientAddress,
      isProcessing,
      exceedsBalance,
    ],
  );

  return (
    <div>
      <form className="rounded-lg" onSubmit={handleSubmit}>
        <TokenAmountInput
          tokenAmount={withdrawAmount}
          setTokenAmount={setWithdrawAmount}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
          withShieldedBalance
        />
        <div className="mt-[-15px] text-white">
          <label
            htmlFor="recipentAddressWithdraw"
            className="text-white pl-[5%] text-[14px] font-[300]"
          >
            Recipient address{" "}
          </label>
          <br />
          <input
            type="text"
            placeholder="Please paste address here"
            className="bg-hinkal-blue-900 h-10 w-[90%] ml-[5%] rounded-lg mb-4 pl-2 outline-none placeholder:text-[13.5px] mt-1 text-white"
            disabled={!withdraw}
            onChange={setRecipientAddressHandler}
            value={recipientAddress}
          />
        </div>
        <div className="flex justify-between items-center mt-2 w-[90%] mx-auto">
          <InfoPanel
            cloudText="Relayers are secure and trustworthy anonymous nodes that
                    perform withdrawal instead of you. They allow you to
                    withdraw your funds without paying a gas fee from your
                    Ethereum wallet. Relayer takes a fixed 0.3 percent from your
                    deposit as a fee for this service."
            addTextRight="Withdraw with relayer"
            showDetails={showRelayerDetails}
            setShowDetails={setShowRelayerDetails}
          />
          <ToggleSwitch isOff={isRelayerOff} setIsOff={setIsRelayerOff} />
        </div>
        {exceedsBalance && (
          <p className="w-[90%] mx-auto mt-2 text-sm text-red-500">
            Insufficient balance
          </p>
        )}
        <div className="w-[90%] mx-auto mb-4 mt-6 h-[1px] bg-hinkal-blue-900" />
        <div className="border-solid">
          <button
            type="submit"
            disabled={isDisabled}
            onClick={handleWithdraw}
            className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 mt-3 text-sm font-semibold outline-none ${
              !isDisabled
                ? "bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300"
                : "bg-hinkal-blue-900 text-hinkal-gray-200 cursor-not-allowed"
            } `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-x-2">
                <span>Withdrawing</span> <Spinner />
              </div>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
