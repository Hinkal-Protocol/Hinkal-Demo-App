import {
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { getErrorMessage, ERC20Token, getAmountInWei } from "@hinkal/common";
import { useTransfer } from "../hooks/useTransfer";
import { useAppContext } from "../AppContext";
import { BALANCE_REFRESH_DELAY_AFTER_TX } from "../constants/balance-refresh-delay.constants";
import { getShieldedBalanceWei } from "../utils/balance.utils";

export const Transfer = () => {
  const { refreshBalances, chainId, balances } = useAppContext();

  const { transfer, isProcessing } = useTransfer({
    onError: (err: Error) => {
      const message = getErrorMessage(err);
      if (message !== "Transaction failed") {
        toast.error(message);
      }
    },
    onSuccess: async () => {
      toast.success("Transfer confirmed");
      await refreshBalances(BALANCE_REFRESH_DELAY_AFTER_TX);
    },
  });

  // local states
  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined,
  );
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferAddress, setTransferAddress] = useState<string>("");

  useEffect(() => {
    if (!chainId) return;
    setSelectedToken(undefined);
    setTransferAmount("");
    setTransferAddress("");
  }, [chainId]);

  const exceedsBalance = useMemo(() => {
    if (!selectedToken || !transferAmount) return false;
    try {
      return (
        getAmountInWei(selectedToken, transferAmount) >
        getShieldedBalanceWei(balances, selectedToken)
      );
    } catch {
      return false;
    }
  }, [selectedToken, transferAmount, balances]);

  const handleTransfer = useCallback(() => {
    if (!selectedToken) return;
    transfer?.(selectedToken, transferAmount, transferAddress);
  }, [selectedToken, transferAmount, transferAddress, transfer]);

  /**
   * recipient address onChange handler
   * @param event onChange event  instance
   */
  const setTransferAddressHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTransferAddress(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () =>
      !selectedToken ||
      !transferAmount ||
      !transferAddress ||
      isProcessing ||
      exceedsBalance,
    [
      selectedToken,
      transferAmount,
      transferAddress,
      isProcessing,
      exceedsBalance,
    ],
  );

  return (
    <form className="rounded-lg" onSubmit={handleSubmit}>
      <TokenAmountInput
        tokenAmount={transferAmount}
        setTokenAmount={setTransferAmount}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        withShieldedBalance
      />
      <div className="mt-[-3%]">
        <label
          htmlFor="recipentAddress"
          className="text-white pl-[5%] text-[14px] font-[300]"
        >
          Recipient address
        </label>
        <input
          type="text"
          placeholder="Please paste address here"
          className="bg-hinkal-blue-900 h-10 w-[90%] rounded-lg ml-[5%] text-[16px] pl-2 outline-none placeholder:text-[13.5px] mt-1 text-white"
          disabled={isProcessing}
          onChange={setTransferAddressHandler}
          value={transferAddress}
        />
        <br />
      </div>
      {exceedsBalance && (
        <p className="w-[90%] mx-auto text-sm text-red-500">
          Insufficient balance
        </p>
      )}
      <div className="w-[90%] mx-auto mb-6 mt-6 h-[1px] bg-hinkal-blue-900" />
      <div className=" border-solid ">
        <button
          type="submit"
          disabled={isDisabled}
          onClick={handleTransfer}
          className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
            !isDisabled
              ? "bg-primary text-white hover:bg-hinkal-purple-200 transition-all duration-300"
              : "bg-hinkal-blue-900 text-hinkal-gray-200 cursor-not-allowed"
          } `}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-x-2">
              <span>Transferring</span> <Spinner />{" "}
            </div>
          ) : (
            <span>Transfer</span>
          )}
        </button>
      </div>
    </form>
  );
};
