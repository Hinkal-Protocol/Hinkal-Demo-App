import { chainIds, getShortERC20Registry, useWithdraw } from '@hinkal/react-hooks';
import { SyntheticEvent, useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { InfoPanel } from '../components/InfoPanel';
import { Spinner } from '../components/Spinner';
import { TokenAmountInput } from '../components/TokenAmountInput';
import { ToggleSwitch } from '../components/withdraw/ToggleSwitch';
import { getErrorMessage } from '../utils/getErrorMessage';

export const Withdraw = () => {
  const { withdraw, isProcessing } = useWithdraw({
    onError: (err) => {
      const message = getErrorMessage(err);
      if (message !== 'Transaction failed') {
        toast.error(message, { id: message });
      }
    },
    onSuccess: () => {
      toast.success('You have successfully withdrawn. Balance will update in several seconds');
    },
  });

  // local states
  const [selectedToken, setSelectedToken] = useState(getShortERC20Registry(chainIds.polygon)[0]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isRelayerOff, setIsRelayerOff] = useState(false);
  const [showRelayerDetails, setShowRelayerDetails] = useState(false);

  const handleWithdraw = useCallback(
    () => withdraw?.(selectedToken, withdrawAmount, recipientAddress, isRelayerOff),
    [withdraw, selectedToken, withdrawAmount, recipientAddress, isRelayerOff],
  );

  /**
   * recipient address onChange handler
   * @param event onChange event  instance
   */
  const setRecipientAddressHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(event.target.value);
  };

  const handleSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <div>
      <form className="rounded-lg" onSubmit={handleSubmit}>
        <TokenAmountInput
          tokenAmount={withdrawAmount}
          setTokenAmount={setWithdrawAmount}
          selectedToken={selectedToken}
          setSelectedToken={setSelectedToken}
        />
        <div className="mt-[-15px] text-white">
          <label htmlFor="recipentAddressWithdraw" className="text-white pl-[5%] text-[14px] font-[300]">
            Recipient address{' '}
          </label>
          <br />
          <input
            type="text"
            placeholder="Please paste address here"
            className="bg-[#272B30] h-10 w-[90%] ml-[5%] rounded-lg mb-4 pl-2 outline-none placeholder:text-[13.5px] mt-1"
            disabled={!withdraw}
            onChange={setRecipientAddressHandler}
            value={recipientAddress}
          />
        </div>
        <div className="flex justify-between items-center mt-2 w-[90%] mx-auto">
          <InfoPanel
            cloudText="Relayers are secure and trustworthy anonymous nodes that
                    perform withdrawal instead of you. They allow you to
                    withdraw your funds without paying a gas fee from your
                    Ethereum wallet. Relayer takes a fixed 0.3 percent from your
                    deposit as a fee for this service."
            addTextRight="Withdraw with relayer"
            showDetails={showRelayerDetails}
            setShowDetails={setShowRelayerDetails}
          />
          <ToggleSwitch isOff={isRelayerOff} setIsOff={setIsRelayerOff} />
        </div>
        <div className="w-[90%] mx-auto mb-4 mt-6 h-[1px] bg-[#272B30]" />
        <div className="border-solid">
          <button
            type="submit"
            disabled={!withdraw || isProcessing}
            onClick={handleWithdraw}
            className={`w-[90%] mb-3 mx-[5%] rounded-lg h-10 mt-3 text-sm font-semibold outline-none ${
              withdraw
                ? 'bg-primary text-white hover:bg-[#4d32fa] duration-200'
                : 'bg-[#37363d] text-[#848688] cursor-not-allowed'
            } `}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-x-2">
                <span>Withdrawing</span> <Spinner />{' '}
              </div>
            ) : (
              <span>Withdraw</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
