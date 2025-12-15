import { ERC20Token } from "@sabaaa1/common";
import { SetStateAction } from "react";

interface SwapSettingsInterface {
  outSwapAmount: string;
  outSwapToken?: ERC20Token;
  setPriceDetailsShown: (param: SetStateAction<boolean>) => void;
}

export const SwapPriceDetails = ({
  outSwapAmount,
  outSwapToken,
  setPriceDetailsShown,
}: SwapSettingsInterface) => {
  return (
    <button
      type="button"
      onClick={() => {
        setPriceDetailsShown(true);
      }}
      className="w-[89%] mx-auto bg-[#202426] rounded-xl border-[0.1px] border-[#3b4145] flex flex-col p-3 py-4 mt-4 "
    >
      <p className="flex w-full justify-between items-center">
        <span></span>
      </p>
    </button>
  );
};
