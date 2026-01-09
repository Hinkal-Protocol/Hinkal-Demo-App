import { Dispatch, SetStateAction } from "react";
import { AppTab } from "../../types";
import { TabButton } from "./TabButton";

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
          />
        </div>
        {/* <div className={buttonClassName}>
          <TabButton
            isActive={activeTab === AppTab.MultiSend}
            title="MultiSend"
            onClick={() => setActiveTab(AppTab.MultiSend)}
          />
        </div> */}
      </div>
    </div>
  );
};
