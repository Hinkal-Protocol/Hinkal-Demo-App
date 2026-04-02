import { SyntheticEvent, useCallback, useState, useMemo } from "react";
import {
  getAmountInWei,
  ERC20Token,
  getErrorMessage,
  ErrorCategory,
} from "h_test_1";
import { toast } from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { useAppContext } from "../AppContext";
import { BALANCE_REFRESH_DELAY_AFTER_TX } from "../constants/balance-refresh-delay.constants";
import { ethers } from "ethers";

export const Deposit = () => {
  const { hinkal, refreshBalances, chainId } = useAppContext();

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined,
  );
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDeposit = useCallback(async () => {
    try {
      if (!chainId || !selectedToken) return;
      setIsProcessing(true);
      const amountInWei = getAmountInWei(selectedToken, depositAmount);

      console.log({ userKeys: hinkal.userKeys });
      console.log({ generateProofRemotely: hinkal.generateProofRemotely });
      console.log("accessKeys", hinkal.userKeys.getAccessKey());
      console.log("signature check:", hinkal.userKeys.getSignature());

      console.log("chainId:", chainId);
      const result: any = await hinkal.deposit(
        [selectedToken],
        [amountInWei],
        false,
        true,
      );
      console.log("deposit result:", result);

      if (result && typeof result === "object" && "hash" in result)
        await hinkal.waitForTransaction(chainId, result.hash);
      await refreshBalances(BALANCE_REFRESH_DELAY_AFTER_TX);
    } catch (err) {
      const errorMessage = getErrorMessage(err, ErrorCategory.DEPOSIT);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [hinkal, depositAmount, selectedToken, refreshBalances]);

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () => !hinkal || !selectedToken || !depositAmount || isProcessing,
    [hinkal, selectedToken, depositAmount, isProcessing],
  );

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
            disabled={isDisabled}
            onClick={handleDeposit}
            className={`w-[90%] ml-[5%] mb-3 md:mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              !isDisabled
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
