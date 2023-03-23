import congratulationsIcon from '../../assets/congratulationsIcon.png';
import { Spinner } from '../Spinner';

interface OfferMintProps {
  transactionLoading: boolean;
  mintHandler?: () => void;
}

export const OfferMint = ({ transactionLoading, mintHandler }: OfferMintProps) => (
  <div className="text-white font-poppins bg-[#202426] ">
    <p className="pt-3 pl-5">Access Token</p>
    <div className="w-full h-[1px] my-2 bg-[#525151b4]" />
    <div className="p-8 pt-0">
      <img src={congratulationsIcon} alt="congratulationsIcon" className="mx-auto" />
      <p className="text-center text-[17px] mt-4">You have successfully passed KYC verification</p>
      <p className="text-[13px] mt-7 font-normal text-center">
        As a final step mint Hinkal Neo Access Token to use protocol. The minting fee will be 1 MATIC.
      </p>
      {transactionLoading ? (
        <div className="flex-1 flex items-center justify-center rounded w-[80%] mx-auto mt-8 bg-gray-900 text-center text-white font-semibold py-2 duration-500">
          <Spinner />
          Processing...
        </div>
      ) : (
        <div className="flex items-center justify-center gap-x-4 mt-4">
          <button
            type="button"
            onClick={mintHandler}
            className="rounded-[12px] hover:bg-[#634bffce] bg-primary mt-4 w-[80%] text-center text-white font-[600] py-2 duration-500 text-[18px]"
          >
            Get Access Token
          </button>
        </div>
      )}
    </div>
  </div>
);
