import { useCallback, useEffect } from 'react';
import { NotificationBar, NotificationBarMode } from './NotificationBar';

export const TxNotifications = () => {
  const { transactionStatus, transactionHash, resetStates } = useHinkalTransaction();

  // to clear transaction confirmed bar after 7 seconds
  const clearNotification = useCallback(() => {
    const timeout = setTimeout(() => resetStates(), 1000 * 7);
    return () => {
      clearTimeout(timeout);
    };
  }, [resetStates]);

  useEffect(() => {
    if (transactionStatus === TransactionStatus.Confirmed || transactionStatus === TransactionStatus.Failed) {
      clearNotification();
    }
  }, [transactionStatus, clearNotification]);

  let title: string | undefined;
  let mode: NotificationBarMode | undefined;

  if (transactionStatus === TransactionStatus.Confirmed) {
    title = 'Transaction is finished';
    mode = NotificationBarMode.Success;
  } else if (transactionStatus === TransactionStatus.Loading) {
    title = 'Transaction processing';
    mode = NotificationBarMode.Loading;
  } else if (transactionStatus === TransactionStatus.Failed) {
    title = 'Transaction failed';
    mode = NotificationBarMode.Error;
  } else {
    title = undefined;
    mode = undefined;
  }

  return (
    <div>
      {title && (
        <NotificationBar
          transactionHash={transactionHash}
          notificationTitle={title}
          onHide={resetStates}
          isOpen={transactionStatus === TransactionStatus.Confirmed}
          mode={mode}
          wrapperStyle="z-[100] w-fit ml-[6.5%] md:top-[100px] md:right-[5%] md:ml-0 "
        />
      )}
    </div>
  );
};
