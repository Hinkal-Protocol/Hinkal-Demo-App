import { Listbox, Transition } from "@headlessui/react";
import { ERC20Token, getAmountInToken } from "@hinkal/common";
import { Fragment, SetStateAction, useEffect, useMemo } from "react";
import VectorDown from "../assets/VectorDown.svg";
import { useAppContext } from "../AppContext";
import { useShieldedUsdBalances } from "../hooks/useShieldedUsdBalances";
import { getShieldedBalanceWei } from "../utils/balance.utils";

interface TokenAmountInputInterface {
  buttonWrapperStyles?: string;
  tokenAmount: string;
  setTokenAmount: (param: SetStateAction<string>) => void;
  selectedToken: ERC20Token | undefined;
  setSelectedToken: (param: SetStateAction<ERC20Token | undefined>) => void;
  withShieldedBalance?: boolean;
}

export const TokenAmountInput = ({
  buttonWrapperStyles,
  tokenAmount,
  setTokenAmount,
  selectedToken,
  setSelectedToken,
  withShieldedBalance = false,
}: TokenAmountInputInterface) => {
  const { erc20List, balances, dataLoaded } = useAppContext();
  const { prices, isLoading: isPricesLoading } = useShieldedUsdBalances();

  useEffect(() => {
    if (erc20List.length > 0) setSelectedToken(erc20List[0]);
  }, [erc20List, setSelectedToken]);

  const shieldedBalanceDisplay = useMemo(() => {
    if (!selectedToken) return null;
    const wei = getShieldedBalanceWei(balances, selectedToken);
    if (wei <= 0n) return null;
    return `${Number(getAmountInToken(selectedToken, wei)).toFixed(4)} ${
      selectedToken.symbol
    }`;
  }, [balances, selectedToken]);

  const setTokenAmountHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const regExp = /^[0-9]*[.]?[0-9]*$/;
    if (regExp.test(event.target.value)) {
      setTokenAmount(event.target.value);
    }
  };

  const renderOptionBalance = (token: ERC20Token) => {
    const balanceWei = getShieldedBalanceWei(balances, token);
    if (balanceWei <= 0n) return null;
    const amount = Number(getAmountInToken(token, balanceWei));
    const price = prices[token.erc20TokenAddress.toLowerCase()] ?? 0;
    return (
      <span className="ml-auto mr-3 flex flex-col items-end">
        <span className="text-[12px] text-white">{amount.toFixed(4)}</span>
        {isPricesLoading ? (
          <span className="mt-1 h-3 w-10 rounded bg-hinkal-gray-300/50 animate-pulse" />
        ) : (
          price > 0 && (
            <span className="text-[11px] text-white/70">
              ${(amount * price).toFixed(2)}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-col item-center justify-center">
      {withShieldedBalance ? (
        <div className="flex justify-between items-center pl-[5%] pr-[5%]">
          <label className="text-white text-[14px] font-[300]">Token</label>
          {shieldedBalanceDisplay && (
            <span className="text-hinkal-gray-100 text-[12px]">
              Balance: {shieldedBalanceDisplay}
            </span>
          )}
        </div>
      ) : (
        <label className="text-white pl-[5%] text-[14px] font-[300]">
          Token
        </label>
      )}
      <div
        className={`flex justify-center mt-1 mb-8 ${buttonWrapperStyles} w-[90%] mx-auto relative`}
      >
        <Listbox
          disabled={false}
          value={selectedToken}
          onChange={setSelectedToken}
          as="div"
          className="flex flex-col relative w-[50%] min-[375px]:w-[40%] lg:w-[35%]"
        >
          {({ open }) => (
            <>
              <Listbox.Button
                className={`h-10 px-2 md:px-0 hover:bg-hinkal-gray-300/50 transition-all duration-300 text-white bg-hinkal-blue-900 rounded-l-lg ${
                  open ? "rounded-l-[0px] rounded-tl-lg" : ""
                } outline-none flex items-center justify-center gap-x-2 w-full cursor-pointer`}
              >
                {selectedToken ? (
                  <>
                    {selectedToken.logoURI && (
                      <img
                        src={selectedToken.logoURI}
                        alt={selectedToken.symbol}
                        className="w-[26px]"
                      />
                    )}
                    <span>{selectedToken.symbol}</span>
                  </>
                ) : (
                  <span className="text-hinkal-gray-100 text-sm">
                    {dataLoaded ? "Select token" : "Connect to select"}
                  </span>
                )}
                {!open ? (
                  <VectorDown />
                ) : (
                  <div className="rotate-180">
                    <VectorDown />
                  </div>
                )}
              </Listbox.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 -translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 -translate-y-2"
              >
                <Listbox.Options className="absolute w-[200px] max-w-[80vw] top-10 text-white flex flex-col bg-hinkal-blue-900 rounded-b-lg z-20 max-h-80 overflow-y-auto">
                  {erc20List.length === 0 ? (
                    <div className="py-3 text-center text-sm text-hinkal-gray-100">
                      No tokens available
                    </div>
                  ) : (
                    erc20List.map((token, index) => (
                      <Listbox.Option
                        key={token.name + token.erc20TokenAddress}
                        value={token}
                        className={`cursor-pointer hover:bg-hinkal-gray-300/50 transition-all duration-300 py-2 flex items-center gap-x-2 pl-[8px] ${
                          token?.name === selectedToken?.name
                            ? "bg-hinkal-gray-300/50"
                            : ""
                        } ${
                          index === erc20List.length - 1 ? " rounded-b-lg" : ""
                        }  `}
                      >
                        <img
                          src={token?.logoURI}
                          alt="tokenIcon"
                          className="w-[26px]"
                        />{" "}
                        <span>{token?.symbol}</span>
                        {token && renderOptionBalance(token)}
                      </Listbox.Option>
                    ))
                  )}
                </Listbox.Options>
              </Transition>
            </>
          )}
        </Listbox>
        <input
          autoComplete="off"
          type="text"
          id="totalAmount"
          placeholder="Token amount"
          className="bg-hinkal-blue-900 h-10 w-[50%] min-[375px]:w-[60%] lg:w-[65%] text-white text-[14px] rounded-r-lg pl-[15px] outline-none"
          disabled={false}
          onChange={(event) => setTokenAmountHandler(event)}
          value={tokenAmount}
        />
      </div>
    </div>
  );
};
