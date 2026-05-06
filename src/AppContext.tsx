import { ERC20Token, Hinkal, TokenBalance, getErc20Token } from "@gurg/hi-test";
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
  useRef,
} from "react";
import { Connector } from "wagmi";
import { getTokenData } from "./constants/token-data";
import { Network } from "./types";
import { networkRegistry } from "./constants/networkRegistry";

type AppContextArgumnets = {
  hinkal: Hinkal<Connector>;
  setHinkal: Dispatch<SetStateAction<Hinkal<Connector>>>;
  chainId?: number;
  setChainId: (num: number) => void;
  selectedNetwork: Network | undefined;
  setSelectedNetwork: (net: Network) => void;
  dataLoaded: boolean;
  setDataLoaded: (val: boolean) => void;
  erc20List: ERC20Token[];
  balances: TokenBalance[];
  refreshBalances: (delayMs?: number, force?: boolean) => Promise<void>;
};

const hinkalInstance = new Hinkal<Connector>();
const BALANCE_REFRESH_INTERVAL = 100000;

const AppContext = createContext<AppContextArgumnets>({
  hinkal: hinkalInstance,
  setHinkal: (hinkal: SetStateAction<Hinkal<Connector>>) => {},
  chainId: undefined,
  setChainId: (num: number) => {},
  selectedNetwork: undefined,
  setSelectedNetwork: (net: Network) => {},
  dataLoaded: false,
  setDataLoaded: (val: boolean) => {},
  erc20List: [],
  balances: [],
  refreshBalances: async (delayMs?: number, force?: boolean) => {},
});

type AppContextProps = { children: ReactNode };

export const AppContextProvider: FC<AppContextProps> = ({
  children,
}: AppContextProps) => {
  const [hinkal, setHinkal] = useState<Hinkal<Connector>>(hinkalInstance);
  const [chainId, setChainId] = useState<number | undefined>();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const [selectedNetwork, setSelectedNetwork] = useState<Network | undefined>(
    undefined,
  );

  const [erc20List, setErc20List] = useState<ERC20Token[]>([]);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const isRefreshingRef = useRef(false);

  const networkList = useMemo(() => Object.values(networkRegistry), []);

  useEffect(() => {
    const network = networkList.find((net) => net.chainId === chainId);
    setSelectedNetwork(network);
  }, [chainId, networkList]);

  useEffect(() => {
    let isCancelled = false;

    const loadErc20List = async () => {
      if (!chainId) {
        if (!isCancelled) setErc20List([]);
        return;
      }

      const tokenData = getTokenData(chainId);
      const tokens = await Promise.all(
        tokenData.map((token) =>
          getErc20Token(chainId, token.erc20TokenAddress),
        ),
      );

      if (!isCancelled) setErc20List(tokens);
    };

    loadErc20List();

    return () => {
      isCancelled = true;
    };
  }, [chainId]);

  const refreshBalances = useCallback(
    async (delayMs?: number, force = false) => {
      if (!dataLoaded || (!force && isRefreshingRef.current) || !chainId) {
        return;
      }
      try {
        isRefreshingRef.current = true;
        if (delayMs) await new Promise((res) => setTimeout(res, delayMs));
        const bals = await hinkal.getTotalBalance(chainId);
        const balancesArray = Array.from(bals.values());
        setBalances(balancesArray);
      } catch (error) {
        console.error("Error refreshing balances:", error);
      } finally {
        isRefreshingRef.current = false;
      }
    },
    [dataLoaded, hinkal, chainId],
  );

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
