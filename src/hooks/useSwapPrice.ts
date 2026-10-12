import { ExternalActionId } from "@hinkal/common";
import { useEffect, useState } from "react";
import { useAppContext } from "../AppContext";
import { Token } from "../types";
import {
  pickBestEvmSwapQuote,
  pickBestSolanaSwapQuote,
} from "../utils/swap.utils";
import { isSolanaLike } from "../constants/solana-chain.constants";

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
  const [externalActionId, setExternalActionId] = useState<
    ExternalActionId | undefined
  >(undefined);

  useEffect(() => {
    let isSubscribed = true;

    setPrice(undefined);
    setSwapData("");
    setExternalActionId(undefined);

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

        // Solana quotes come from OKX via a separate SDK endpoint; the EVM
        // endpoint returns no route for Solana mints.
        const quoteArgs = [
          chainId,
          inSwapAmount,
          inSwapToken.erc20TokenAddress,
          outSwapToken.erc20TokenAddress,
        ] as const;

        const bestQuote = isSolanaLike(chainId)
          ? pickBestSolanaSwapQuote(
              await hinkal.getSolanaSwapPrices(...quoteArgs)
            )
          : pickBestEvmSwapQuote(await hinkal.getEvmSwapPrices(...quoteArgs));

        if (!isSubscribed) return;

        if (!bestQuote) {
          setPrice(undefined);
          setSwapData("");
          setExternalActionId(undefined);
          return;
        }

        setPrice(bestQuote.outSwapAmount);
        setSwapData(bestQuote.swapData);
        setExternalActionId(bestQuote.externalActionId);
      } catch {
        if (!isSubscribed) return;
        setPrice(undefined);
        setSwapData("");
        setExternalActionId(undefined);
      } finally {
        if (isSubscribed) setIsPriceLoading(false);
      }
    };

    run();

    return () => {
      isSubscribed = false;
    };
  }, [inSwapToken, outSwapToken, inSwapAmount, hinkal, chainId]);

  return { isPriceLoading, price, swapData, externalActionId };
};
