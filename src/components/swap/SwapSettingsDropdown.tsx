import { SetStateAction, useState } from 'react';
import TolleranceDetailsImage from '../../assets/QuestionIcon.png';
import { Modal } from '../Modal';

interface SwapSettingsDropdownInterface {
  slippageTolerance: string;
  setSlippageTollerance: (param: SetStateAction<string>) => void;
  swapSettingsDropdownShown: boolean;
  setSwapSettingsDropdownShown: (param: SetStateAction<boolean>) => void;
}

export const SwapSettingsDropdown = ({
  slippageTolerance,
  setSlippageTollerance,
  swapSettingsDropdownShown,
  setSwapSettingsDropdownShown,
}: SwapSettingsDropdownInterface) => {
  const [showTolleranceDetails, setShowTolleranceDetails] = useState(false);
  const [isAutoTolleranceSelected, setIsAutoTolleranceSelected] = useState(true);

  const setTokenAmountHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    setValue: (param: SetStateAction<string>) => void,
  ) => {
    const regExp = /^[0-9]*[.]?[0-9]*$/;
    if (regExp.test(event.target.value)) {
      setValue(event.target.value);
      if (isAutoTolleranceSelected) setIsAutoTolleranceSelected(false);
    }
  };

  return (
    <Modal
      isOpen={swapSettingsDropdownShown}
      xBtnAction={() => setSwapSettingsDropdownShown(false)}
      styleProps="md:w-[24.9%] md:left-[22%] top-[50%] rounded-[13px] bg-transparent "
      stylePropsBg=" opacity-[0] "
    >
      <div className="text-white font-poppins bg-[#202426] rounded-[13px] p-2">
        <p className="pl-2 text-[16px] font-[600]">Settings</p>
        <div className="p-2">
          <div className="flex gap-x-2">
            <p className="text-[15px] font-[400]">Slippage tolerance</p>
            <div className="flex-1 flex items-center gap-x-3 relative">
              {showTolleranceDetails ? (
                <div className="absolute z-[99] top-[32px] text-white font-[300] text-[10px] md:text-[11px] w-[120%] left-[-20px] mb-8 flex items-start">
                  <button
                    type="button"
                    onMouseEnter={() => {
                      setTimeout(() => {
                        setShowTolleranceDetails(true);
                      }, 100);
                    }}
                    onMouseOut={() => {
                      setTimeout(() => {
                        setShowTolleranceDetails(false);
                      }, 100);
                    }}
                    className="conversationBubble cursor-default text-left "
                  >
                    Your transaction will revert if the price changes unfavorably by more than this percentage.
                  </button>
                </div>
              ) : (
                <></>
              )}
              <button
                type="button"
                onMouseEnter={() => setShowTolleranceDetails(true)}
                onMouseOut={() => {
                  setTimeout(() => {
                    setShowTolleranceDetails(false);
                  }, 100);
                }}
              >
                <img src={TolleranceDetailsImage} alt="" />
              </button>
            </div>
          </div>
          <div className="flex gap-x-2 h-9 items-center justify-start mt-2 ">
            <button
              type="button"
              onClick={() => {
                setIsAutoTolleranceSelected(true);
                setSlippageTollerance('0.01');
              }}
              className={` font-[400] border-[1px] border-solid border-primary text-[16px] rounded-xl h-full px-3 ${
                isAutoTolleranceSelected ? 'bg-primary' : 'bg-modalBG border-primary'
              } `}
            >
              Auto
            </button>
            <input
              type="text"
              placeholder="0.10"
              className={
                'bg-[#272B30] w-full h-full text-white text-[14px] rounded-lg px-[25px] outline-none text-right '
              }
              onChange={(event) => setTokenAmountHandler(event, setSlippageTollerance)}
              value={slippageTolerance === '0.10' ? '' : slippageTolerance}
            />
            <span className="absolute right-[22px] text-[14px]">%</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
