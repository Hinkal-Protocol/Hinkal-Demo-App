import { ERC20Token } from '@hinkal/common';
import { useState } from 'react';
import VectorDown from '../../assets/VectorDown.svg';
import { TokenDropdown } from './TokenDropdown';

interface SelectTokenProps {
  swapToken?: ERC20Token;
  onTokenChange: (prev?: ERC20Token, cur?: ERC20Token) => void;
  disabled?: boolean;
  tokenFilter?: (arg: ERC20Token) => boolean;
}

export const SelectToken = ({ swapToken, onTokenChange, disabled, tokenFilter }: SelectTokenProps) => {
  const [isTokenSelectShown, setIsTokenSelectShown] = useState(false);
  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsTokenSelectShown((prev) => !prev)}
        className={`rounded-lg ${
          swapToken ? 'bg-modalBgColor' : 'bg-primary'
        } px-3 py-2 w-fit mr-[15px] flex items-center justify-center`}
      >
        <span className="text-xl font-[600]">
          {swapToken ? (
            <span className="flex justify-center items-center gap-x-2">
              {swapToken.logoURI && <img src={swapToken.logoURI} alt="" className="w-[24px] h-[24px]" />}
              <span>{swapToken.symbol}</span>{' '}
            </span>
          ) : (
            'Select token'
          )}
        </span>
        {!isTokenSelectShown ? (
          <div className="px-1">
            <VectorDown />
          </div>
        ) : (
          <div className="rotate-180 px-1">
            <VectorDown />
          </div>
        )}
      </button>
      {isTokenSelectShown && (
        <TokenDropdown
          isTokenSelectShown={isTokenSelectShown}
          setIsTokenSelectShown={setIsTokenSelectShown}
          swapToken={swapToken}
          onTokenChange={onTokenChange}
          tokenFilter={tokenFilter}
        />
      )}
    </>
  );
};
