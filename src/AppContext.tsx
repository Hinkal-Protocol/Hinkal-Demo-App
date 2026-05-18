import {
  ERC20Token,
  EthereumNetwork,
  Hinkal,
  TokenBalance,
  getERC20Registry,
  networkRegistry,
} from "@hinkal/common";
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

export type TronConnection = {
  address: string;
  signerAdapter: any;
};

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
  refreshBalances: (interval?: number) => Promise<void>;
  tronConnection?: TronConnection;
  setTronConnection: (c: TronConnection | undefined) => void;
};

const hinkalInstance = new Hinkal<Connector>();
const BALANCE_REFRESH_INTERVAL = 100000;

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
  tronConnection: undefined,
  setTronConnection: (_c: TronConnection | undefined) => {},
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
  const [tronConnection, setTronConnection] = useState<
    TronConnection | undefined
  >(undefined);

  const networkList = useMemo(() => Object.values(networkRegistry), []);

  useEffect(() => {
    const network = networkList.find((net) => net.chainId === chainId);
    setSelectedNetwork(network);
  }, [chainId, networkList]);

  const erc20List = useMemo(
    () => (chainId ? getERC20Registry(chainId) : []),
    [chainId],
  );

  const refreshBalances = useCallback(async (delayMs?: number) => {
    if (!dataLoaded || isRefreshing || !chainId) return;

    try {
      setIsRefreshing(true);

      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));

      await hinkal.resetMerkle([chainId]);

      const ethAddress = await hinkal.getEthereumAddress();

      const bals = await hinkal.getBalances(
        chainId,
        hinkal.userKeys.getShieldedPrivateKey(),
        hinkal.userKeys.getShieldedPublicKey(),
        ethAddress,
      );

      const balancesArray = Array.from(bals.values());
      setBalances(balancesArray);
    } catch (error) {
      console.error("Error refreshing balances:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [dataLoaded, isRefreshing, hinkal, chainId]);

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
        tronConnection,
        setTronConnection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
