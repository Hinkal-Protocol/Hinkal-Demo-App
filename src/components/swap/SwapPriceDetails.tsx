import { ERC20Token, relayerPercentage } from '@hinkal/common';
import { SetStateAction } from 'react';

interface SwapSettingsInterface {
  outSwapAmount: string;
  outSwapToken?: ERC20Token;
  setPriceDetailsShown: (param: SetStateAction<boolean>) => void;
}

export const SwapPriceDetails = ({ outSwapAmount, outSwapToken, setPriceDetailsShown }: SwapSettingsInterface) => {
  const tokenAmountNetRelayFee = Number(outSwapAmount) * (1 - Number(relayerPercentage) / 1000);

  return (
    <button
      type="button"
      onClick={() => {
        setPriceDetailsShown(true);
      }}
      className="w-[89%] mx-auto bg-[#202426] rounded-xl border-[0.1px] border-[#3b4145] flex flex-col p-3 py-4 mt-4 "
    >
      <p className="flex w-full justify-between items-center">
        <span className="text-[#a3a4a5]">Received amount after fee {Number(relayerPercentage) / 100}%</span>
        <span>
          {tokenAmountNetRelayFee.toFixed(4)} {outSwapToken?.symbol}
        </span>
      </p>
    </button>
  );
};
