import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import './App.css';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { KycScreen } from './components/KycScreen';
import { NavigationBar } from './components/NavigationBar';
import { TxNotifications } from './components/TxNotifications';
import { useTxNotifications } from './hooks';
import { Deposit } from './pages/Deposit';
import { Swap } from './pages/Swap';
import { Transfer } from './pages/Transfer';
import { Withdraw } from './pages/Withdraw';
import { PopoverDimProvider } from './popover/PopoverDimProvider';
import { AppTab } from './types';

const App = () => {
  useTxNotifications();
  const [activeTab, setActiveTab] = useState(AppTab.Deposit);
  return (
    <div className="bg-bgColor h-screen font-pubsans">
      <div className="bg-bgColor flex flex-col min-h-screen">
        <Header />
        <PopoverDimProvider />
        <TxNotifications />
        <KycScreen />
        <div className={'flex flex-col justify-between grow'}>
          <main className={'flex justify-center md:gap-x-[9%] flex-col md:flex-row'}>
            <section className="bg-modalBgColor rounded-xl w-[87%] md:w-[40%] min-w-[300px] md:mt-[120px] md:h-fit mx-auto md:mx-0 md:mb-20 pt-2">
              <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
              {activeTab === AppTab.Deposit && <Deposit />}
              {activeTab === AppTab.Transfer && <Transfer />}
              {activeTab === AppTab.Withdraw && <Withdraw />}
              {activeTab === AppTab.Swap && <Swap />}
            </section>
          </main>
          <Footer />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default App;
