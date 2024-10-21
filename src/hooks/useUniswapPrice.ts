import { ERC20Token, getUniswapPrice } from "@hinkal/common";
import { useEffect, useState } from "react";
import { useAppContext } from "../AppContext";

type UseSwapPriceParams = {
    inSwapAmount: string;
    inSwapToken?: ERC20Token;
    outSwapToken?: ERC20Token;
    enabled?: boolean;
};

export const useUniswapPrice = ({ inSwapAmount, inSwapToken, outSwapToken }: UseSwapPriceParams) => {
    const { hinkal } = useAppContext();
    const [price, setPrice] = useState<bigint | undefined>(undefined);
    const [isPriceLoading, setIsPriceLoading] = useState<boolean>(false);
    const [swapData, setSwapData] = useState<string>('');

    useEffect(() => {
        setPrice(undefined);

        const run = async () => {
            try {
                if (!hinkal || !inSwapToken || !outSwapToken) return;
                if (inSwapAmount.length === 0 || !inSwapAmount) {
                    setPrice(undefined);
                    setSwapData('');
                    return;
                }
                setIsPriceLoading(true);
                const priceDict = await getUniswapPrice(hinkal, inSwapAmount, inSwapToken, outSwapToken);
                setPrice(priceDict.tokenPrice);
                setSwapData(priceDict.poolFee);
            } catch (err: unknown) {
                setPrice(undefined);
                setSwapData('');
            } finally {
                setIsPriceLoading(false);
            }
        }
        run();
    }, [])
    return { isPriceLoading, price, swapData };
}