import { useState } from "react";
import HinkalLogo from "../../assets/HinkalLogo.png";
import { ChooseWallet } from "../ChooseWallet";
import { HinkalInfo } from "./HinkalInfo";

export const Header = () => {
  // local states
  const [chooseWalletShown, setChooseWalletShown] = useState<boolean>(false);

  const [shieldedAddress, setShieldedAddress] = useState<string | undefined>();

  return (
    <header className="md:bg-[#1A1D1F] pt-4 md:pt-0 pb-4 relative z-20">
      <ChooseWallet
        isOpen={chooseWalletShown}
        onHide={() => setChooseWalletShown(false)}
        setShieldedAddress={setShieldedAddress}
      />
      <div
        className={`flex ${
          shieldedAddress ? "flex-col" : ""
        } md:flex-row justify-between w-[87%] md:w-[81.5%] mx-auto pt-[1%] relative md:static`}
      >
        <div className="flex items-center justify-between gap-2.5">
          <img src={HinkalLogo} alt="" className="w-9 h-9 md:w-10 md:h-10" />
          <p className="text-[20px] md:text-2xl font-bold text-white font-libFranklin">
            HINKAL
          </p>
        </div>

        {shieldedAddress ? (
          <HinkalInfo shieldedAddress={shieldedAddress} />
        ) : (
          <button
            type="button"
            onClick={() => setChooseWalletShown(true)}
            className="text-white font-[700] md:font-[500] text-[16px] rounded-[12px] px-4 py-3 border-[2px] bg-primary md:bg-transparent border-primary font-pubsans"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
};
