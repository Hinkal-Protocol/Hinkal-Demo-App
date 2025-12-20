import { SyntheticEvent, useCallback, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { InfoPanel } from "../components/InfoPanel";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { ToggleSwitch } from "../components/withdraw/ToggleSwitch";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useAppContext } from "../AppContext";
import { useWithdraw } from "../hooks/useWithdraw";
import { chainIds, getERC20Registry } from "@sabaaa1/common";

export const Withdraw = () => {
  const { hinkal } = useAppContext();

  const { withdraw, isProcessing } = useWithdraw({
    hinkal,
    onError: (err) => {
      const message = getErrorMessage(err);
      if (message !== "Transaction failed") {
        toast.error(message, { id: message });
      }
    },
    onSuccess: () => {
      toast.success(
        "You have successfully withdrawn. Balance will update in several seconds"
      );
    },
  });

  // local states
  const [selectedToken, setSelectedToken] = useState(
    getERC20Registry(chainIds.polygon)[0]
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

  const handleWithdraw = useCallback(
    () =>
      withdraw?.(selectedToken, withdrawAmount, recipientAddress, isRelayerOff),
    [withdraw, selectedToken, withdrawAmount, recipientAddress, isRelayerOff]
  );

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

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
            disabled={!hinkal || isProcessing || !recipientAddress}
            onClick={handleWithdraw}
            className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 mt-3 text-sm font-semibold outline-none ${
              hinkal
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
