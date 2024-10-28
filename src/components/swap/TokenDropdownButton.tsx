import { ERC20Token } from "valtest-com-try-new-build-v";
import { SetStateAction } from "react";

interface TokenDropdownProps {
  swapToken?: ERC20Token;
  token?: ERC20Token;
  onTokenChange: (oldToken?: ERC20Token, newToken?: ERC20Token) => void;
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
    className={`flex itemes-center justify-center py-[7px] gap-x-2 px-3 border-[0.1px] border-[#ffffff] rounded-[20px] w-fit hover:bg-[#343a3d7f]  ${swapToken?.name === token?.name ? "border-[1px] border-blue-600 " : ""
      } `}
    key={token ? token.name + token.erc20TokenAddress + token.logoURI : null}
  >
    {token && <img src={token.logoURI} alt="" className="w-[26px] h-[26px]" />}
    <span className="text-xl text-center">{token && token.symbol}</span>
  </button>
);
