import { EvmSwapPrice, ExternalActionId } from "@hinkal/common";

export type BestSwapQuote = {
  outSwapAmount: bigint;
  swapData: string;
  externalActionId: ExternalActionId;
};

export const pickBestEvmSwapQuote = (
  quote: EvmSwapPrice | null,
): BestSwapQuote | undefined => {
  if (!quote || quote.outSwapAmountValue <= 0n) return undefined;

  return {
    outSwapAmount: quote.outSwapAmountValue,
    swapData: quote.lifiDataValue,
    externalActionId: ExternalActionId.Lifi,
  };
};
