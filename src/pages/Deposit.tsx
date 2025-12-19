import { SyntheticEvent, useCallback, useState, useEffect } from "react";
import { chainIds, getERC20Registry, getAmountInWei } from "@sabaaa1/common";
import { toast } from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { useAppContext } from "../AppContext";

export const Deposit = () => {
  // local states
  const { hinkal } = useAppContext();

  const [selectedToken, setSelectedToken] = useState(
    getERC20Registry(chainIds.polygon)[0]
  );
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = useCallback(async () => {
    try {
      setIsProcessing(true);
      const amountInWei = getAmountInWei(selectedToken, depositAmount);

      const result = await hinkal.deposit([selectedToken], [amountInWei]);

      if (result && typeof result === "object" && "hash" in result)
        await hinkal.waitForTransaction(result.hash);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setIsProcessing(false);
    }
  }, [hinkal, depositAmount, selectedToken]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <div>
      <form className="rounded-lg" onSubmit={handleSubmit}>
        <TokenAmountInput
          buttonWrapperStyles="!mb-0"
          tokenAmount={depositAmount}
          setTokenAmount={setDepositAmount}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
        <div className="w-[90%] mx-auto mb-6 mt-6 h-[1px] bg-[#272B30]" />
        <div className="border-solid">
          <button
            type="submit"
            disabled={!hinkal || isProcessing}
            onClick={handleDeposit}
            className={`w-[90%] ml-[5%] mb-3 md:mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              hinkal && !isProcessing
                ? "bg-primary text-white hover:bg-[#4d32fa] duration-200"
                : "bg-[#37363d] text-[#848688] cursor-not-allowed"
            } `}
          >
            {isProcessing ? (
              <div className="mx-[5%] flex items-center justify-center gap-x-2">
                <span>Depositing</span> <Spinner />
              </div>
            ) : (
              <span>Deposit</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
