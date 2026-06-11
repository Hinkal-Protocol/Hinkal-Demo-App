import { TokenBalance, zeroAddress } from "@hinkal/common";
import toast from "react-hot-toast";
import { useEffect } from "react";
import Copy from "../../assets/Copy.svg";
import Disconnect from "../../assets/Disconnect.svg";
import { copyToClipboard } from "../../utils/copyToClipboard";
import { reloadPage } from "../../utils/pageReload";
import { WalletInfoBalance } from "./WalletInfoBalance";
import { useAppContext } from "../../AppContext";

const filterTokenBalances = (tokenBalances: TokenBalance[]) => {
  const nonZeroBalances = [...tokenBalances]
    .sort((a, b) =>
      a.token.erc20TokenAddress < b.token.erc20TokenAddress ? -1 : 1,
    )
    .filter((tokenBalance) => tokenBalance.balance !== 0n);
  if (nonZeroBalances.length === 0)
    return tokenBalances.filter(
      (tokenBalance) => tokenBalance.token.erc20TokenAddress === zeroAddress,
    );
  return nonZeroBalances;
};

export const WalletInfoDropDown = () => {
  const { balances, hinkal, chainId, refreshBalances, recipientInfo } =
    useAppContext();

  useEffect(() => {
    if (chainId && refreshBalances) refreshBalances();
  }, [chainId, refreshBalances]);

  const handleCopyPublicAddress = async () => {
    try {
      const publicAddress = await hinkal.getEthereumAddress();
      if (!publicAddress) {
        toast.error("No public address found");
        return;
      }
      copyToClipboard(publicAddress);
      toast.success("Public address copied to clipboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to copy public address");
    }
  };

  const handleCopyPrivateAddress = () => {
    try {
      if (!recipientInfo) {
        toast.error("No private address found");
        return;
      }
      copyToClipboard(recipientInfo);
      toast.success("Private address copied to clipboard");
    } catch (err: any) {
      toast.error(err?.message || "Failed to copy private address");
    }
  };

  return (
    <div className="absolute min-w-max top-20 md:top-2 left-0 md:left-auto right-0 bg-hinkal-blue-900 rounded-xl shadow-metamask font-generalSans p-4 items-center max-content">
      <div className="flex items-center space-x-4">
        <div className="w-[26px]" />
        <p className="text-hinkal-white-300 text-[12px] text-left">Balance</p>
      </div>
      <div className="flex flex-col justify-center gap-4 mb-[10%]">
        {filterTokenBalances(balances).map((tokenBalance) => (
          <WalletInfoBalance
            tokenBalance={tokenBalance}
            key={tokenBalance.token.erc20TokenAddress}
          />
        ))}
      </div>

      <div className="border-t-2 md:text-[15px] border-hinkal-blue-900 flex flex-col">
        <button type="button" onClick={handleCopyPublicAddress}>
          <div className="flex items-center mt-2 text-white text-[14px] md:w-[9.5rem]">
            <div className="flex justify-center items-center w-[25px] h-[25px]">
              <Copy />
            </div>
            <div className="pl-2 text-nowrap">Copy Public Address</div>
          </div>
        </button>
        <button type="button" onClick={handleCopyPrivateAddress}>
          <div className="flex items-center mt-2 text-white text-[14px] md:w-[9.5rem]">
            <div className="flex justify-center items-center w-[25px] h-[25px]">
              <Copy />
            </div>
            <div className="pl-2 text-nowrap">Copy Private Address</div>
          </div>
        </button>
        <div>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => reloadPage()}
          >
            <div className="flex flex-row items-center text-white text-[14px] mt-2 w-[9.5rem]">
              <div className="flex justify-center items-center w-[25px] h-[25px]">
                <Disconnect />
              </div>
              <div className="pl-2">Disconnect</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
