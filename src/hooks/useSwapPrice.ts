import { useEffect, useState } from "react";
import { useAppContext } from "../AppContext";
import { Token } from "../types";

type UseSwapPriceParams = {
  inSwapAmount: string;
  inSwapToken?: Token;
  outSwapToken?: Token;
};

export const useSwapPrice = ({
  inSwapAmount,
  inSwapToken,
  outSwapToken,
}: UseSwapPriceParams) => {
  const { hinkal, chainId } = useAppContext();
  const [price, setPrice] = useState<bigint | undefined>(undefined);
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
  const [swapData, setSwapData] = useState<string>("");


  useEffect(() => {
    let isSubscribed = true;

    setPrice(undefined);
    setSwapData("");


    const run = async () => {
      try {
        if (!hinkal || !inSwapToken || !outSwapToken || !chainId) return;
        if (
          inSwapAmount.length === 0 ||
          !inSwapAmount ||
          Number(inSwapAmount) <= 0
        ) {
          return;
        }

        setIsPriceLoading(true);
        const swapQuote = await hinkal.getEvmSwapPrices(
          chainId,
          inSwapAmount,
          inSwapToken.erc20TokenAddress,
          outSwapToken.erc20TokenAddress,
        );


        if (!isSubscribed || !swapQuote) return;

        setPrice(swapQuote.outSwapAmountValue);
        setSwapData(swapQuote.lifiDataValue);

      } catch {
        if (!isSubscribed) return;
        setPrice(undefined);
        setSwapData("");

      } finally {
        if (isSubscribed) setIsPriceLoading(false);
      }
    };

    run();

    return () => {
      isSubscribed = false;
    };
  }, [inSwapToken, outSwapToken, inSwapAmount, hinkal, chainId]);

  return { isPriceLoading, price, swapData };
};
