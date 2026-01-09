import { TokenBalance, getAmountInToken } from "@hinkal/common";

interface WalletInfoBalanceProps {
  tokenBalance: TokenBalance;
}

export const WalletInfoBalance = ({ tokenBalance }: WalletInfoBalanceProps) => {
  return (
    <div className="flex items-center space-x-4">
      <div>
        <img
          src={tokenBalance.token.logoURI}
          alt="tokenIcon"
          className="w-[26px]"
        />
      </div>
      <div>
        <p className="text-white text-[18px] font-semibold">
          {Number(
            getAmountInToken(tokenBalance.token, tokenBalance.balance)
          ).toFixed(4)}{" "}
          {tokenBalance.token.symbol}
        </p>
      </div>
    </div>
  );
};
