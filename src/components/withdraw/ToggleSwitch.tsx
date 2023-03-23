import { SetStateAction } from 'react';

interface ToggleSwitchInterface {
  wrapperStyles?: string;
  innerStyles?: string;
  isOff: boolean;
  setIsOff: (param: SetStateAction<boolean>) => void;
}

export const ToggleSwitch = ({ wrapperStyles, innerStyles, isOff, setIsOff }: ToggleSwitchInterface) => (
  <div
    className={`w-10 h-5 rounded-[16px] flex items-center gap-x-1 cursor-pointer child:rounded-md ${
      isOff ? 'bg-[#404040] ' : 'bg-primary'
    } duration-500 px-[2px] ${wrapperStyles} `}
    onClick={() => setIsOff((prev) => !prev)}
  >
    <div
      className={`w-4 flex items-center justify-center h-[80%] rounded-[50%] bg-white ${
        isOff ? ' translate-x-0 ' : ' translate-x-[20px] '
      } duration-300 ${innerStyles} `}
    />
  </div>
);
