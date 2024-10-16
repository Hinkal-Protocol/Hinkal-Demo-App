import { Modal } from "../Modal";
import { AccessTokenMinted } from "./AccessTokenMinted";
import { OfferMint } from "./OfferMint";

interface MintAccessTokenProps {
  transactionStatus?: string;
  isShown: boolean;
  onMint?: () => void;
  onClose: () => void;
}

export const MintAccessToken = ({
  transactionStatus,
  isShown,
  onClose,
  onMint,
}: MintAccessTokenProps) => {
  return (
    <Modal xBtn xBtnAction={onClose} isOpen={isShown}>
      {true ? (
        <OfferMint transactionLoading={true} mintHandler={onMint} />
      ) : (
        <AccessTokenMinted resetStates={onClose} />
      )}
    </Modal>
  );
};
