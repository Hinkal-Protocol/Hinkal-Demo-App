import {
  SyntheticEvent,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import { ERC20Token } from "@gurg/hi-test";
import { toast } from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { useAppContext } from "../AppContext";
import { getAmountInToken, getAmountInWei } from "../utils/amount.utils";
import { getPublicBalanceByTokenAddress } from "../utils/getPublicBalanceByToken";

export const Deposit = () => {
  const { hinkal, chainId } = useAppContext();

  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined,
  );
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [publicBalance, setPublicBalance] = useState<bigint | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetch = async () => {
      if (!selectedToken || !chainId) {
        if (!isCancelled) setPublicBalance(null);
        return;
      }

      const ethAddress = await hinkal.getEthereumAddress();
      const balance = await getPublicBalanceByTokenAddress(
        chainId,
        ethAddress,
        selectedToken.erc20TokenAddress,
      );
      if (!isCancelled) setPublicBalance(balance);
    };
    fetch();

    return () => {
      isCancelled = true;
    };
  }, [selectedToken, chainId, hinkal]);

  const publicBalanceDisplay = useMemo(() => {
    if (publicBalance === null || !selectedToken) return null;
    return Number(getAmountInToken(selectedToken, publicBalance)).toFixed(6);
  }, [publicBalance, selectedToken]);

  const handleDeposit = useCallback(async () => {
    try {
      if (!chainId || !selectedToken) return;
      setIsProcessing(true);
      const amountInWei = getAmountInWei(selectedToken, depositAmount);

      const result = await hinkal.deposit([selectedToken], [amountInWei]);

      if (result && typeof result === "object" && "hash" in result)
        await hinkal.waitForTransaction(chainId, result.hash);

      toast.success(
        "Deposit successful! Balance will update in several seconds",
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [hinkal, depositAmount, selectedToken]);

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
        {publicBalanceDisplay !== null && (
          <p className="text-gray-200 text-[12px] pl-[5%] mt-4">
            Available: {publicBalanceDisplay} {selectedToken?.symbol}
          </p>
        )}
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
