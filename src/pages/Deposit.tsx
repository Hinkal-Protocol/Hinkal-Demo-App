import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { chainIds, getERC20Registry, getAmountInWei } from "@hinkal/common";
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

  const handleDeposit = useCallback(async () => {
    const erc20addresses = [selectedToken.erc20TokenAddress];
    const amountChanges = [getAmountInWei(selectedToken, depositAmount)];
    try {
      await hinkal.deposit?.(erc20addresses, amountChanges);
    } catch (err) {
      console.log("deposit error", { err });
    }
  }, [hinkal.deposit, depositAmount, selectedToken]);

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
            disabled={!hinkal?.deposit || false}
            onClick={handleDeposit}
            className={`w-[90%] ml-[5%] mb-3 md:mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              true
                ? "bg-primary text-white hover:bg-[#4d32fa] duration-200"
                : "bg-[#37363d] text-[#848688] cursor-not-allowed"
            } `}
          >
            {false ? (
              <div className="mx-[5%] flex items-center justify-center gap-x-2">
                <span>Depositing</span> <Spinner />{" "}
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
