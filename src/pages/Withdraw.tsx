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
import { ERC20Token, ErrorCategory, getErrorMessage } from "@sabaaa1/common";
import { BALANCE_REFRESH_DELAY_AFTER_TX } from "../constants/balance-refresh-delay.constants";

export const Withdraw = () => {
  const { hinkal, refreshBalances } = useAppContext();

  const { withdraw, isProcessing } = useWithdraw({
    hinkal,
    onError: (err) => {
      const message = getErrorMessage(err, ErrorCategory.WITHDRAW);
      if (message !== "Send failed") {
        toast.error(message, { id: message });
      }
    },
    onSuccess: async () => {
      toast.success(
        "You have successfully withdrawn. Balance will update in several seconds"
      );
      await refreshBalances(BALANCE_REFRESH_DELAY_AFTER_TX);
    },
  });

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined
  );
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isRelayerOff, setIsRelayerOff] = useState(false);
  const [showRelayerDetails, setShowRelayerDetails] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      if (hinkal) {
        const addr = await hinkal.getEthereumAddress();
        setRecipientAddress(addr);
      }
    };
    fetchAddress();
  }, [hinkal]);

  const handleWithdraw = useCallback(() => {
    if (!selectedToken) return;
    withdraw?.(selectedToken, withdrawAmount, recipientAddress, isRelayerOff);
  }, [withdraw, selectedToken, withdrawAmount, recipientAddress, isRelayerOff]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () =>
      !hinkal ||
      !selectedToken ||
      !withdrawAmount ||
      !recipientAddress ||
      isProcessing,
    [hinkal, selectedToken, withdrawAmount, recipientAddress, isProcessing]
  );

  return (
    <div>
      <form className="rounded-lg" onSubmit={handleSubmit}>
        <TokenAmountInput
          tokenAmount={withdrawAmount}
          setTokenAmount={setWithdrawAmount}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
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
        <div className="w-[90%] mx-auto mb-4 mt-6 h-[1px] bg-[#272B30]" />
        <div className="border-solid">
          <button
            type="submit"
            disabled={isDisabled}
            onClick={handleWithdraw}
            className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 mt-3 text-sm font-semibold outline-none ${
              !isDisabled
                ? "bg-primary text-white hover:bg-[#4d32fa] duration-200"
                : "bg-[#37363d] text-[#848688] cursor-not-allowed"
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
