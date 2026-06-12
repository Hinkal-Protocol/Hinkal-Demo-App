import {
  Hinkal,
  PrivateBalancesState,
  TokenBalanceWithUsd,
  refreshBalance,
} from "@gurge/sdk";
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
import { Network, Token } from "./types";
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
  erc20List: Token[];
  privateBalancesWithUSD: PrivateBalancesState;
  chainBalances: TokenBalanceWithUsd[];
  recipientInfo: string;
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
  chainBalances: [],
  recipientInfo: "",
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

  const erc20List = useMemo(
    () => (chainId ? getTokenData(chainId) : []),
    [chainId],
  );

  const privateBalancesWithUSD = useSyncExternalStore(
    (onChange) => {
      if (!hinkal) return () => {};
      return hinkal.onPrivateBalancesWithUSDChange(() => onChange());
    },
    () => hinkal?.privateBalancesWithUSD ?? emptyPrivateBalances,
  );

  const chainBalances = useMemo(
    () => (chainId ? privateBalancesWithUSD[chainId] ?? [] : []),
    [chainId, privateBalancesWithUSD],
  );

  const [recipientInfo, setRecipientInfo] = useState<string>("");

  const networkList = useMemo(() => Object.values(networkRegistry), []);

  useEffect(() => {
    const network = networkList.find((net) => net.chainId === chainId);
    setSelectedNetwork(network);
  }, [chainId, networkList]);

  useEffect(() => {
    if (!dataLoaded) return;
    try {
      setRecipientInfo(hinkal?.getRecipientInfo() ?? "");
    } catch (error) {
      console.error("Error getting recipient info:", error);
    }
  }, [dataLoaded, hinkal]);

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
        chainBalances,
        recipientInfo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
