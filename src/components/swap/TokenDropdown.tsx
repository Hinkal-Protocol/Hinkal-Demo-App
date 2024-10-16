import { ERC20Token } from '@hinkal/common';
import { ReactNode, SetStateAction, useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { TokenDropdownButton } from './TokenDropdownButton';

interface TokenDropdownProps {
  isTokenSelectShown: boolean;
  setIsTokenSelectShown: (param: SetStateAction<boolean>) => void;
  swapToken?: ERC20Token;
  onTokenChange: (oldToken?: ERC20Token, newToken?: ERC20Token) => void;
  tokenFilter?: (arg: ERC20Token) => boolean;
}

const splitTokenButtonsIntoRows = (tokenButtons: ReactNode[], itemsPerRow: number) =>
  tokenButtons.reduce(
    (arr: ReactNode[][], button, index) =>
      index % itemsPerRow ? [...arr.slice(0, -1), [...arr[arr.length - 1], button]] : [...arr, [button]],
    [[]],
  );

export const TokenDropdown = ({
  isTokenSelectShown,
  setIsTokenSelectShown,
  swapToken,
  onTokenChange,
  tokenFilter = () => true,
}: TokenDropdownProps) => {
  const { erc20List } = useErc20List();
  const [itemsPerRow, setItemsPerRow] = useState(window.innerWidth <= 500 ? 2 : 3);
  useEffect(() => {
    const onWindowSizeUpdate = () => setItemsPerRow(window.innerWidth <= 500 ? 2 : 3);
    window.addEventListener('resize', onWindowSizeUpdate);
    return () => window.removeEventListener('resize', onWindowSizeUpdate);
  }, []);

  return (
    <Modal
      isOpen={isTokenSelectShown}
      xBtn
      xBtnAction={() => setIsTokenSelectShown(false)}
      styleProps="md:!w-[50%] md:!left-[25%] !top-[30%] xl:!w-[34%] xl:!left-[33%]"
      stylePropsBg=" opacity-[0.5] "
    >
      <div className="text-white font-poppins bg-[#202426] ">
        <p className="pt-3 pl-5 text-xl">Select a token</p>
        <div className="w-full h-[1px] my-2 bg-[#525151b4]" />
        <div className="p-8 pt-0">
          <div className="flex flex-col item-center justify-center gap-2 mt-5">
            {erc20List &&
              splitTokenButtonsIntoRows(
                erc20List
                  .filter(tokenFilter)
                  .map((token, jndex) => (
                    <TokenDropdownButton
                      key={jndex}
                      token={token}
                      swapToken={swapToken}
                      onTokenChange={onTokenChange}
                      setIsTokenSelectShown={setIsTokenSelectShown}
                    />
                  )),
                itemsPerRow,
              ).map((buttons, index) => (
                <div key={index} className="flex flex-row items-center justify-center gap-2">
                  {buttons}
                </div>
              ))}
          </div>
          <div className="bg-gray-600 w-full h-[0.1px] my-5" />
        </div>
      </div>
    </Modal>
  );
};
