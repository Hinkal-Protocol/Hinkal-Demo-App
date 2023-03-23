import { Modal } from '../Modal';
import { Spinner } from '../Spinner';

interface PendingAiPriseVerificationProps {
  isShown: boolean;
  onClose: () => void;
}

export const PendingAiPriseVerification = ({ isShown, onClose }: PendingAiPriseVerificationProps) => {
  return (
    <Modal xBtnAction={onClose} xBtn isOpen={isShown}>
      <div className="text-white font-poppins bg-modalBgColor ">
        <p className="pt-3 pl-5">Access Token</p>
        <div className="w-full h-[1px] my-2 bg-[#525151b4]" />
        <div className="p-8 pt-0">
          <p className="text-center mt-4">Your verification is being reviewed</p>
          <div className="mt-[5%] flex justify-center">
            <Spinner styleSize="!w-8 !h-8" />
          </div>
          <h3 className="text-[16px] text-center mt-[5%]">
            Please stay with us. If a pending status does not resolve within a minute, it means that your KYC went to
            manual verification.
          </h3>
        </div>
      </div>
    </Modal>
  );
};
