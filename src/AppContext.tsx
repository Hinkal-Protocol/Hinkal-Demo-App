import {
  ERC20Token,
  EthereumNetwork,
  Hinkal,
  TokenBalance,
  getERC20Registry,
  networkRegistry,
} from "@sabaaa1/common";
import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Connector } from "wagmi";

type AppContextArgumnets = {
  hinkal: Hinkal<Connector>;
  setHinkal: Dispatch<SetStateAction<Hinkal<Connector>>>;
  chainId?: number;
  setChainId: (num: number) => void;
  selectedNetwork: EthereumNetwork | undefined;
  setSelectedNetwork: (net: EthereumNetwork) => void;
  dataLoaded: boolean;
  setDataLoaded: (val: boolean) => void;
  erc20List: ERC20Token[];
  balances: TokenBalance[];
  refreshBalances: () => Promise<void>;
};

const hinkalInstance = new Hinkal<Connector>();
const BALANCE_REFRESH_INTERVAL = 100000;
const BALANCE_REFRESH_DELAY = 3000;

const AppContext = createContext<AppContextArgumnets>({
  hinkal: hinkalInstance,
  setHinkal: (hinkal: SetStateAction<Hinkal<Connector>>) => {},
  chainId: undefined,
  setChainId: (num: number) => {},
  selectedNetwork: undefined,
  setSelectedNetwork: (net: EthereumNetwork) => {},
  dataLoaded: false,
  setDataLoaded: (val: boolean) => {},
  erc20List: [],
  balances: [],
  refreshBalances: async () => {},
});

type AppContextProps = { children: ReactNode };

export const AppContextProvider: FC<AppContextProps> = ({
  children,
}: AppContextProps) => {
  const [hinkal, setHinkal] = useState<Hinkal<Connector>>(hinkalInstance);
  const [chainId, setChainId] = useState<number | undefined>();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const [selectedNetwork, setSelectedNetwork] = useState<
    EthereumNetwork | undefined
  >(undefined);

  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const networkList = useMemo(() => Object.values(networkRegistry), []);

  useEffect(() => {
    const network = networkList.find((net) => net.chainId === chainId);
    console.log("setting selected network", network);
    setSelectedNetwork(network);
  }, [chainId, networkList]);

  const erc20List = useMemo(
    () => (chainId ? getERC20Registry(chainId) : []),
    [chainId]
  );

  const refreshBalances = useCallback(async () => {
    if (!dataLoaded || isRefreshing) return;

    try {
      setIsRefreshing(true);
      await new Promise((resolve) =>
        setTimeout(resolve, BALANCE_REFRESH_DELAY)
      ); // Wait 3 seconds before refreshing
      console.log("dataLoaded", dataLoaded);
      const ethAddress = await hinkal.getEthereumAddress();

      console.log("ethAddress", ethAddress);
      const bals = await hinkal.getBalances(
        hinkal.getCurrentChainId(),
        hinkal.userKeys.getShieldedPrivateKey(),
        hinkal.userKeys.getShieldedPublicKey(),
        ethAddress,
        false,
        true
      );

      console.log("fetched balances", bals);
      const balancesArray = Array.from(bals.values());
      console.log("balances array", balancesArray);
      setBalances(balancesArray);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dataLoaded, hinkal]);

  useEffect(() => {
    if (!dataLoaded) return;

    refreshBalances();

    const interval = setInterval(() => {
      refreshBalances();
    }, BALANCE_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [dataLoaded, refreshBalances]);

  return (
    <AppContext.Provider
      value={{
        hinkal,
        setHinkal,
        chainId,
        setChainId,
        selectedNetwork,
        setSelectedNetwork,
        dataLoaded,
        setDataLoaded,
        erc20List,
        balances,
        refreshBalances,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
