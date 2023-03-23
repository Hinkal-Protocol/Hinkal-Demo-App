import { TransactionStatus } from '@hinkal/react-hooks';
import { Modal } from '../Modal';
import { AccessTokenMinted } from './AccessTokenMinted';
import { OfferMint } from './OfferMint';

interface MintAccessTokenProps {
  transactionStatus?: TransactionStatus;
  isShown: boolean;
  onMint?: () => void;
  onClose: () => void;
}

export const MintAccessToken = ({ transactionStatus, isShown, onClose, onMint }: MintAccessTokenProps) => {
  return (
    <Modal xBtn xBtnAction={onClose} isOpen={isShown}>
      {transactionStatus !== TransactionStatus.Confirmed ? (
        <OfferMint transactionLoading={transactionStatus === TransactionStatus.Loading} mintHandler={onMint} />
      ) : (
        <AccessTokenMinted resetStates={onClose} />
      )}
    </Modal>
  );
};
