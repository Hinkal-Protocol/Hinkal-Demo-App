import { SetStateAction } from "react";
import { Token } from "../../types";
import { isSameTokenAddress } from "../../utils/token.utils";

interface TokenDropdownProps {
  swapToken?: Token;
  token?: Token;
  onTokenChange: (oldToken?: Token, newToken?: Token) => void;
  setIsTokenSelectShown: (param: SetStateAction<boolean>) => void;
}

export const TokenDropdownButton = ({
  token,
  swapToken,
  onTokenChange,
  setIsTokenSelectShown,
}: TokenDropdownProps) => (
  <button
    type="button"
    onClick={() => {
      onTokenChange(swapToken, token);
      setIsTokenSelectShown(false);
    }}
    className={`flex itemes-center justify-center py-[7px] gap-x-2 px-3 border-[0.1px] border-[#ffffff] rounded-[20px] w-fit hover:bg-[#343a3d7f]  ${
      isSameTokenAddress(swapToken?.erc20TokenAddress, token?.erc20TokenAddress)
        ? "border-[1px] border-blue-600 "
        : ""
    } `}
    key={token ? token.name + token.erc20TokenAddress + token.logoURI : null}
  >
    {token?.logoURI && (
      <img src={token.logoURI} alt="" className="w-[26px] h-[26px]" />
    )}
    <span className="text-lg text-center">{token && token.symbol}</span>
  </button>
);
