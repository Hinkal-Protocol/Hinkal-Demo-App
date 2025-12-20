import { Listbox } from "@headlessui/react";
import { ERC20Token, chainIds, getERC20Registry } from "@sabaaa1/common";
import { SetStateAction, useEffect, useMemo } from "react";
import VectorDown from "../assets/VectorDown.svg";
import { useAppContext } from "../AppContext";

interface TokenAmountInputInterface {
  buttonWrapperStyles?: string;
  tokenAmount: string;
  setTokenAmount: (param: SetStateAction<string>) => void;
  selectedToken: ERC20Token | undefined;
  setSelectedToken: (param: SetStateAction<ERC20Token | undefined>) => void;
}

export const TokenAmountInput = ({
  buttonWrapperStyles,
  tokenAmount,
  setTokenAmount,
  selectedToken,
  setSelectedToken,
}: TokenAmountInputInterface) => {
  const { erc20List } = useAppContext();

  useEffect(() => {
    if (erc20List.length > 0) setSelectedToken(erc20List[0]);
  }, [erc20List, setSelectedToken]);

  /**
   * deposit amount onChange handler
   * @param event onChange event instance
   */
  const setTokenAmountHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const regExp = /^[0-9]*[.]?[0-9]*$/;
    if (regExp.test(event.target.value)) {
      setTokenAmount(event.target.value);
    }
  };
  return (
    <div className="flex flex-col item-center justify-center">
      <label className="text-white pl-[5%] text-[14px] font-[300]">Token</label>
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
                className={`h-10 px-2 md:px-0 text-white bg-[#353945] rounded-l-lg ${
                  open ? "rounded-l-[0px] rounded-tl-lg" : ""
                } outline-none flex items-center justify-center gap-x-2 w-full ${
                  true ? "cursor-pointer" : "cursor-not-allowed"
                } `}
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
                  <span className="text-[#9ca3af] text-sm">
                    Connect to select
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
              <Listbox.Options className="absolute w-full top-10 text-white flex flex-col bg-[#272B30] rounded-b-lg z-20">
                {erc20List.map((token, index) => (
                  <Listbox.Option
                    key={token.name + token.erc20TokenAddress}
                    value={token}
                    className={`cursor-pointer py-2 flex items-center gap-x-2 pl-[8px] ${
                      token?.name === selectedToken?.name ? "bg-[#64717d]" : ""
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
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </>
          )}
        </Listbox>
        <input
          autoComplete="off"
          type="text"
          id="totalAmount"
          placeholder="Token amount"
          className={`bg-[#272B30] h-10 w-[50%] min-[375px]:w-[60%] lg:w-[65%] text-white text-[14px] rounded-r-lg pl-[15px] outline-none ${
            true ? "" : "cursor-not-allowed"
          } `}
          disabled={false}
          onChange={(event) => setTokenAmountHandler(event)}
          value={tokenAmount}
        />
      </div>
    </div>
  );
};
