import { Dispatch, SetStateAction, useMemo } from "react";
import { isTronLike } from "@hinkal/common";
import { AppTab } from "../../types";
import { TabButton } from "./TabButton";
import { useAppContext } from "../../AppContext";

interface NavigationBarProps {
  activeTab: AppTab;
  setActiveTab: Dispatch<SetStateAction<AppTab>>;
}

const buttonClassName =
  "xl:flex w-1/4 block place-self-end xl:place-self-start max-xl:w-[50%] xl:space-x-0 space-y-3";

export const NavigationBar = ({
  activeTab,
  setActiveTab,
}: NavigationBarProps) => {
  const { chainId } = useAppContext();
  const swapDisabled = useMemo(
    () => !!chainId && isTronLike(chainId),
    [chainId],
  );
  return (
    <div className="mt-[4%] xl:flex h-12 mb-4 text-[15px] font-semibold border-b border-[#3e3c3c] block relative">
      <div className="flex xl:h-full h-1 xl:py-0 py-2 w-full align-top">
        <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.Deposit}
            title="Deposit"
            onClick={() => setActiveTab(AppTab.Deposit)}
          />
        </div>
        <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.Transfer}
            title="Transfer"
            onClick={() => setActiveTab(AppTab.Transfer)}
          />
        </div>
        <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.Withdraw}
            title="Withdraw"
            onClick={() => setActiveTab(AppTab.Withdraw)}
          />
        </div>
        <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.Swap}
            title="Swap"
            onClick={() => setActiveTab(AppTab.Swap)}
            disabled={swapDisabled}
            disabledTooltip="Swap not available on Tron"
          />
        </div>
        <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.MultiSend}
            title="MultiSend"
            onClick={() => setActiveTab(AppTab.MultiSend)}
          />
        </div>
        <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.WdkTest}
            title="WDK Test"
            onClick={() => setActiveTab(AppTab.WdkTest)}
          />
        </div>
      </div>
    </div>
  );
};
