import { ExternalActionId } from "@gurge/sdk";

type EvmSwapPrices = {
  uniswap: { tokenPrice: bigint; poolFee: string } | null;
  odos: { outSwapAmountValue: bigint; odosDataValue: string } | null;
  oneInch: { outSwapAmountValue: bigint; oneInchDataValue: string } | null;
};

type BestSwapQuote = {
  outSwapAmount: bigint;
  swapData: string;
  externalActionId: ExternalActionId;
};

export const pickBestEvmSwapQuote = (
  quotes: EvmSwapPrices,
): BestSwapQuote | undefined => {
  const candidates: BestSwapQuote[] = [];

  if (quotes.uniswap && quotes.uniswap.tokenPrice > 0n) {
    candidates.push({
      outSwapAmount: quotes.uniswap.tokenPrice,
      swapData: quotes.uniswap.poolFee,
      externalActionId: ExternalActionId.Uniswap,
    });
  }

  if (quotes.odos && quotes.odos.outSwapAmountValue > 0n) {
    candidates.push({
      outSwapAmount: quotes.odos.outSwapAmountValue,
      swapData: quotes.odos.odosDataValue,
      externalActionId: ExternalActionId.Odos,
    });
  }

  if (quotes.oneInch && quotes.oneInch.outSwapAmountValue > 0n) {
    candidates.push({
      outSwapAmount: quotes.oneInch.outSwapAmountValue,
      swapData: quotes.oneInch.oneInchDataValue,
      externalActionId: ExternalActionId.OneInch,
    });
  }

  if (candidates.length === 0) return undefined;

  return candidates.reduce((best, current) =>
    current.outSwapAmount > best.outSwapAmount ? current : best,
  );
};
