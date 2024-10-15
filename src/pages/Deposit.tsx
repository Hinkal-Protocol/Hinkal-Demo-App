import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { Hinkal } from "hinkal-sdk";
import toast from "react-hot-toast";
import { Spinner } from "../components/Spinner";
import { TokenAmountInput } from "../components/TokenAmountInput";
import { getErrorMessage } from "../utils/getErrorMessage";

export const Deposit = () => {
  const [hinkal, setHinkal] = useState<Hinkal | undefined>();

  useEffect(() => {
    setHinkal(new Hinkal());
    hinkal
  }, []);

  // local states
  const [selectedToken, setSelectedToken] = useState(
    getShortERC20Registry(chainIds.polygon)[0]
  );
  const [depositAmount, setDepositAmount] = useState("");

  const handleDeposit = useCallback(
    () => deposit?.(selectedToken, depositAmount),
    [deposit, depositAmount, selectedToken]
  );

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
            disabled={!deposit || false}
            onClick={handleDeposit}
            className={`w-[90%] ml-[5%] mb-3 md:mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              deposit
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
