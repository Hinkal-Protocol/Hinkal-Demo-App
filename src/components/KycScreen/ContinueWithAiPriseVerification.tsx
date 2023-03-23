import { mediaUrls } from '../../constants';
import { Modal } from '../Modal';

interface ContinueWithAiPriseVerificationProps {
  isShown: boolean;
  isDisabled?: boolean;
  onSubmit?: () => unknown;
  onClose: () => void;
}

export const ContinueWithAiPriseVerification = ({
  isShown,
  isDisabled,
  onSubmit,
  onClose,
}: ContinueWithAiPriseVerificationProps) => {
  return (
    <Modal xBtn xBtnAction={onClose} isOpen={isShown}>
      <div className="text-white font-poppins bg-modalBgColor ">
        <p className="pt-3 pl-5">Identity Verification</p>
        <div className="w-full h-[1px] my-2 bg-[#525151b4]" />
        <div className="p-8 pt-0">
          <p className="text-[17px] mt-5 font-normal">
            After the verification with{' '}
            <a target="_blank" href={mediaUrls.AIPRISE} className="text-blue-500 underline" rel="noreferrer">
              AiPrise
            </a>
            , you will be able to mint Hinkal Access Token which will grant you an access to the protocol.
          </p>

          <p className="text-[17px] mt-5 font-bold">
            {' '}
            No single party can link Personal Identifiable Information (PII) with wallet address: Hinkal Protocol has
            wallet address information but not the PII, while the KYC provider has PII but not the wallet address. This
            preserves the necessary level of user anonymity.
          </p>
          <p className="mt-4">
            Click <span className="font-bold">continue</span> to proceed with verification
          </p>
          <div className="flex items-center justify-center gap-x-4 mt-2">
            <button
              type="button"
              disabled={!onSubmit || isDisabled}
              onClick={onSubmit}
              className="rounded-[12px] hover:bg-[#634bffce] bg-primary mt-4 w-[40%] text-center text-white font-[500] py-2 duration-500"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-primary border-[2px] border-solid border-primary rounded-[12px] mt-4 w-[40%] text-center text-white font-[500] py-2 duration-500"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
