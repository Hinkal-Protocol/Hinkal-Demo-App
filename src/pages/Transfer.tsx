import { SyntheticEvent, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { getErrorMessage, ERC20Token } from "@sabaaa1/common";
import { useTransfer } from "../hooks/useTransfer";
import { useAppContext } from "../AppContext";

export const Transfer = () => {
  const { chainId } = useAppContext();

  const { transfer, isProcessing } = useTransfer({
    onError: (err: Error) => {
      const message = getErrorMessage(err);
      if (message !== "Transaction failed") {
        toast.error(message);
      }
    },
    onSuccess: () => {
      toast.success(
        "You have successfully transferred. Balance will update in several seconds"
      );
    },
  });

  // local states
  const [selectedToken, setSelectedToken] = useState<ERC20Token | undefined>(
    undefined
  );
  const [transferAmount, setTransferAmount] = useState<string>("");
  const [transferAddress, setTransferAddress] = useState<string>("");

  const handleTransfer = useCallback(() => {
    if (!selectedToken) return;
    transfer?.(selectedToken, transferAmount, transferAddress),
      [transfer, selectedToken, transferAmount, transferAddress];
  }, [selectedToken, transferAmount, transferAddress, transfer]);

  /**
   * recipient address onChange handler
   * @param event onChange event  instance
   */
  const setTransferAddressHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTransferAddress(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  const isDisabled = useMemo(
    () => !selectedToken || !transferAmount || !transferAddress || isProcessing,
    [selectedToken, transferAmount, transferAddress, isProcessing]
  );

  return (
    <form className="rounded-lg" onSubmit={handleSubmit}>
      <TokenAmountInput
        tokenAmount={transferAmount}
        setTokenAmount={setTransferAmount}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
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
          className="bg-[#272B30] h-10 w-[90%] rounded-lg ml-[5%] text-[16px] pl-2 outline-none placeholder:text-[13.5px] mt-1 text-white"
          disabled={isProcessing}
          onChange={setTransferAddressHandler}
          value={transferAddress}
        />
        <br />
      </div>
      <div className="w-[90%] mx-auto mb-6 mt-6 h-[1px] bg-[#272B30]" />
      <div className=" border-solid ">
        <button
          type="submit"
          disabled={isDisabled}
          onClick={handleTransfer}
          className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
            !isDisabled
              ? "bg-primary text-white hover:bg-[#4d32fa] duration-200"
              : "bg-[#37363d] text-[#848688] cursor-not-allowed"
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
