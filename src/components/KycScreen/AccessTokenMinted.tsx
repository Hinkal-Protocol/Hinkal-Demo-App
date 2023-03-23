interface AccessTokenMintedProps {
  resetStates: () => void;
}

export const AccessTokenMinted = ({ resetStates }: AccessTokenMintedProps) => (
  <div className="text-white font-poppins bg-modalBgColor ">
    <p className="pt-3 pl-5">Access Token Minted</p>
    <div className="w-full h-[1px] my-2 bg-[#525151b4]" />
    <div className="p-8 pt-0">
      <p className="text-center text-2xl mt-8">You have minted an Access Token</p>
      <p className="font-bold text-[13px] md:text-[16px] mt-3 mb-4">
        Important: We suggest waiting some period after receiving an access token and before the user deposits funds to
        Hinkal Protocol. This way, one can ensure no other party can access the user’s PII even if the KYC provider’s
        database gets hacked. It is achieved by disentangling the time when the user received an access token and of
        depositing funds.
      </p>

      <button
        type="button"
        onClick={resetStates}
        className="rounded-[12px] hover:bg-[#634bffce] bg-primary mt-2 w-[50%] ml-[25%] text-center text-white font-[500] py-2 duration-500 text-[16px]"
      >
        Click to continue
      </button>
    </div>
  </div>
);
