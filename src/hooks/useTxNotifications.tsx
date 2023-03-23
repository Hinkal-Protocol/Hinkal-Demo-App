import { TransactionStatus, useHinkalTransaction } from '@hinkal/react-hooks';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useTxNotifications = () => {
  const trxContext = useHinkalTransaction();
  const [toastId, setToastId] = useState('Transaction processing');
  const [isHandlingLoad, setIsHandlingLoad] = useState(false);
  const isTxLoading = trxContext.transactionStatus === TransactionStatus.Loading;
  const isTxConfirmed = trxContext.transactionStatus === TransactionStatus.Confirmed;
  const isTxFailed = trxContext.transactionStatus === TransactionStatus.Failed;

  // to clear transaction confirmed bar after 7 seconds
  useEffect(() => {
    if (isTxLoading && !isHandlingLoad) {
      setToastId(toast.loading('Transaction processing'));
      setIsHandlingLoad(true);
    } else if (isTxConfirmed) {
      toast.success('Transaction is finished', {
        duration: 1000 * 7,
        id: toastId,
      });
    } else if (isTxFailed) {
      toast.error('Transaction failed', {
        duration: 1000 * 7,
        id: toastId,
      });
    }

    if (isTxConfirmed || isTxFailed) {
      setIsHandlingLoad(false);
      const timeout = setTimeout(() => {
        if (trxContext.transactionHash?.length === 66) trxContext.setTransactionHash('');
        setToastId('');

        clearTimeout(timeout);
      }, 1000 * 7);
      return () => {
        clearTimeout(timeout);
      };
    }
    return () => {};
  }, [isTxConfirmed, isTxLoading, isTxFailed, isHandlingLoad, toastId, trxContext]);
};
