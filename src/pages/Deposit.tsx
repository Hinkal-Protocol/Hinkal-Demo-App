import { chainIds, getShortERC20Registry, useDeposit } from '@hinkal/react-hooks';
import { SyntheticEvent, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { Spinner } from '../components/Spinner';
import { TokenAmountInput } from '../components/TokenAmountInput';
import { getErrorMessage } from '../utils/getErrorMessage';

export const Deposit = () => {
  const { deposit, isProcessing } = useDeposit({
    onError: (err) => {
      const message = getErrorMessage(err);
      if (message !== 'Transaction failed') {
        toast.error(message, { id: message });
      }
    },
    onSuccess: () => {
      toast.success('You have successfully deposited. Balance will update in several seconds');
    },
  });

  // local states
  const [selectedToken, setSelectedToken] = useState(getShortERC20Registry(chainIds.polygon)[0]);
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = useCallback(
    () => deposit?.(selectedToken, depositAmount),
    [deposit, depositAmount, selectedToken],
  );

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <div>
      <form className="rounded-lg" onSubmit={handleSubmit}>
        <TokenAmountInput
          buttonWrapperStyles="!mb-0"
          tokenAmount={depositAmount}
          setTokenAmount={setDepositAmount}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
        <div className="w-[90%] mx-auto mb-6 mt-6 h-[1px] bg-[#272B30]" />
        <div className="border-solid">
          <button
            type="submit"
            disabled={!deposit || isProcessing}
            onClick={handleDeposit}
            className={`w-[90%] ml-[5%] mb-3 md:mx-[5%] rounded-lg h-10 text-sm font-semibold outline-none ${
              deposit
                ? 'bg-primary text-white hover:bg-[#4d32fa] duration-200'
                : 'bg-[#37363d] text-[#848688] cursor-not-allowed'
            } `}
          >
            {isProcessing ? (
              <div className="mx-[5%] flex items-center justify-center gap-x-2">
                <span>Depositing</span> <Spinner />{' '}
              </div>
            ) : (
              <span>Deposit</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
