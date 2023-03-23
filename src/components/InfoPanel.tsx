import { SetStateAction } from 'react';

import questionIcon from '../assets/QuestionIcon.png';

interface InfoPanelInterface {
  cloudText: string;
  addTextRight?: string;
  showDetails: boolean;
  setShowDetails: (param: SetStateAction<boolean>) => void;
}

export const InfoPanel = ({ cloudText, addTextRight, showDetails, setShowDetails }: InfoPanelInterface) => (
  <div className="flex-1 flex items-center gap-x-3 relative">
    {showDetails && (
      <div className="absolute z-[99] top-[32px] text-white font-[300] text-[10px] md:text-[11px] md:w-[150%] left-[-20px] mb-8 flex items-start">
        <button
          type="button"
          onMouseEnter={() => {
            setTimeout(() => {
              setShowDetails(true);
            }, 100);
          }}
          onMouseOut={() => {
            setTimeout(() => {
              setShowDetails(false);
            }, 100);
          }}
          className="conversationBubble cursor-default text-left "
        >
          {cloudText}
        </button>
      </div>
    )}
    <button
      type="button"
      onMouseEnter={() => setShowDetails(true)}
      onMouseOut={() => {
        setTimeout(() => {
          setShowDetails(false);
        }, 100);
      }}
    >
      <img src={questionIcon} alt="relayerShowDetailsIcon" />
    </button>
    <span className="text-white">{addTextRight || ''}</span>
  </div>
);
