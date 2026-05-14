import {
  ERC20Token,
  Hinkal,
  PrivateBalancesState,
  getErc20Token,
  refreshBalance,
} from "@gurg/hi-test";
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
  useSyncExternalStore,
} from "react";
import { getTokenData } from "./constants/token-data";
import { Network } from "./types";
import { networkRegistry } from "./constants/networkRegistry";

const emptyPrivateBalances: PrivateBalancesState = {};

type AppContextArgumnets = {
  hinkal: Hinkal<unknown> | undefined;
  setHinkal: Dispatch<SetStateAction<Hinkal<unknown> | undefined>>;
  chainId?: number;
  setChainId: (num: number) => void;
  selectedNetwork: Network | undefined;
  setSelectedNetwork: (net: Network) => void;
  dataLoaded: boolean;
  setDataLoaded: (val: boolean) => void;
  erc20List: ERC20Token[];
  privateBalancesWithUSD: PrivateBalancesState;
};

const AppContext = createContext<AppContextArgumnets>({
  hinkal: undefined,
  setHinkal: (hinkal: SetStateAction<Hinkal<unknown> | undefined>) => {},
  chainId: undefined,
  setChainId: (num: number) => {},
  selectedNetwork: undefined,
  setSelectedNetwork: (net: Network) => {},
  dataLoaded: false,
  setDataLoaded: (val: boolean) => {},
  erc20List: [],
  privateBalancesWithUSD: emptyPrivateBalances,
});

type AppContextProps = { children: ReactNode };

export const AppContextProvider: FC<AppContextProps> = ({
  children,
}: AppContextProps) => {
  const [hinkal, setHinkal] = useState<Hinkal<unknown> | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>();
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const [selectedNetwork, setSelectedNetwork] = useState<Network | undefined>(
    undefined,
  );

  const [erc20List, setErc20List] = useState<ERC20Token[]>([]);

  const privateBalancesWithUSD = useSyncExternalStore(
    (onChange) => {
      if (!hinkal) return () => {};
      return hinkal.onPrivateBalancesWithUSDChange(() => onChange());
    },
    () => hinkal?.privateBalancesWithUSD ?? emptyPrivateBalances,
  );

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

      if (!isCancelled)
        setErc20List(tokens.filter((token) => token !== undefined));
    };

    loadErc20List();

    return () => {
      isCancelled = true;
    };
  }, [chainId]);

  useEffect(() => {
    if (!chainId || !hinkal) return;
    refreshBalance({ chainIdToUpdate: chainId });
  }, [chainId, hinkal]);

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
        privateBalancesWithUSD,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
