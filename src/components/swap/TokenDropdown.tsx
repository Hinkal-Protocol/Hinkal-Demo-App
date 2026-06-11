import { ERC20Token } from "@hinkal/common";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { Modal } from "../Modal";
import { TokenDropdownButton } from "./TokenDropdownButton";
import { useAppContext } from "../../AppContext";

interface TokenDropdownProps {
  isTokenSelectShown: boolean;
  setIsTokenSelectShown: (param: SetStateAction<boolean>) => void;
  swapToken?: ERC20Token;
  onTokenChange: (oldToken?: ERC20Token, newToken?: ERC20Token) => void;
  tokenFilter?: (arg: ERC20Token) => boolean;
}

export const TokenDropdown = ({
  isTokenSelectShown,
  setIsTokenSelectShown,
  swapToken,
  onTokenChange,
  tokenFilter = () => true,
}: TokenDropdownProps) => {
  const { erc20List } = useAppContext();
  const [query, setQuery] = useState("");
  const filteredTokens = (erc20List ?? []).filter(tokenFilter);
  const searchedTokens = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return filteredTokens;
    return filteredTokens.filter(
      (token) =>
        token.symbol.toLowerCase().includes(q) ||
        token.name.toLowerCase().includes(q) ||
        token.erc20TokenAddress.toLowerCase().includes(q),
    );
  }, [filteredTokens, query]);

  useEffect(() => {
    if (isTokenSelectShown) setQuery("");
  }, [isTokenSelectShown]);

  return (
    <Modal
      isOpen={isTokenSelectShown}
      xBtn
      xBtnAction={() => setIsTokenSelectShown(false)}
      styleProps="md:!w-[70%] md:!left-[15%] !top-[10%] xl:!w-[50%] xl:!left-[25%]"
      stylePropsBg=" bg-[#00000052] "
      scrollBody={false}
    >
      <div className="text-white font-poppins bg-hinkal-blue-300 flex flex-col min-h-0">
        <p className="pt-3 pl-5 text-xl shrink-0">Select a token</p>
        <div className="px-5 pt-3 shrink-0">
          <input
            type="text"
            autoFocus
            placeholder="Search by name, symbol or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-hinkal-blue-900 h-10 rounded-lg px-3 text-[14px] outline-none placeholder:text-[13px] placeholder:text-hinkal-gray-100"
          />
        </div>
        <div className="w-full h-[1px] mt-3 bg-[#525151b4] shrink-0" />
        <div className="p-8 pt-0 overflow-y-auto min-h-0">
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {searchedTokens.length === 0 ? (
              <p className="text-hinkal-white-300 text-sm text-center py-6">
                {filteredTokens.length === 0
                  ? "No tokens available"
                  : "No tokens found"}
              </p>
            ) : (
              searchedTokens.map((token) => (
                <TokenDropdownButton
                  key={token.name + token.erc20TokenAddress}
                  token={token}
                  swapToken={swapToken}
                  onTokenChange={onTokenChange}
                  setIsTokenSelectShown={setIsTokenSelectShown}
                />
              ))
            )}
          </div>
          <div className="bg-gray-600 w-full h-[0.1px] my-5" />
        </div>
      </div>
    </Modal>
  );
};
