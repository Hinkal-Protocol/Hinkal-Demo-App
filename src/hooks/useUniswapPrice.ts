import { getUniswapPrice } from "@gurge/sdk";
import { useEffect, useState } from "react";
import { useAppContext } from "../AppContext";
import { Token } from "../types";

type UseSwapPriceParams = {
  inSwapAmount: string;
  inSwapToken?: Token;
  outSwapToken?: Token;
  enabled?: boolean;
};

export const useUniswapPrice = ({
  inSwapAmount,
  inSwapToken,
  outSwapToken,
}: UseSwapPriceParams) => {
  const { hinkal, chainId } = useAppContext();
  const [price, setPrice] = useState<bigint | undefined>(undefined);
  const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
  const [swapData, setSwapData] = useState<string>("");

  useEffect(() => {
    setPrice(undefined);

    const run = async () => {
      try {
        if (!hinkal || !inSwapToken || !outSwapToken || !chainId) return;
        if (inSwapAmount.length === 0 || !inSwapAmount) {
          setPrice(undefined);
          setSwapData("");
          return;
        }
        setIsPriceLoading(true);
        const priceDict = await getUniswapPrice(
          hinkal,
          chainId,
          inSwapAmount,
          inSwapToken.erc20TokenAddress,
          outSwapToken.erc20TokenAddress,
        );
        setPrice(priceDict.tokenPrice);
        setSwapData(priceDict.poolFee);
      } catch (err: unknown) {
        setPrice(undefined);
        setSwapData("");
      } finally {
        setIsPriceLoading(false);
      }
    };
    run();
  }, [inSwapToken, outSwapToken, inSwapAmount, hinkal, chainId]);
  return { isPriceLoading, price, swapData };
};
