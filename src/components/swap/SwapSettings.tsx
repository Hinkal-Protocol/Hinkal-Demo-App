import { SetStateAction, useState } from 'react';
import { SwapSettingsDropdown } from './SwapSettingsDropdown';

interface SwapSettingsInterface {
  slippageTolerance: string;
  setSlippageTollerance: (param: SetStateAction<string>) => void;
}

export const SwapSettings = ({ slippageTolerance, setSlippageTollerance }: SwapSettingsInterface) => {
  const [swapSettingsDropdownShown, setSwapSettingsDropdownShown] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setSwapSettingsDropdownShown(true);
        }}
      >
        <i className="bi bi-gear" />
      </button>
      {swapSettingsDropdownShown && (
        <SwapSettingsDropdown
          slippageTolerance={slippageTolerance}
          setSlippageTollerance={setSlippageTollerance}
          swapSettingsDropdownShown={swapSettingsDropdownShown}
          setSwapSettingsDropdownShown={setSwapSettingsDropdownShown}
        />
      )}
    </>
  );
};
