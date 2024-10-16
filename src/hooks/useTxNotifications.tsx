import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export const useTxNotifications = () => {
  const [toastId, setToastId] = useState('Transaction processing');
  const [isHandlingLoad, setIsHandlingLoad] = useState(false);


  // to clear transaction confirmed bar after 7 seconds

};
