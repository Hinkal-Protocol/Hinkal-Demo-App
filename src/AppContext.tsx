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
};

const hinkalInstance = new Hinkal<Connector>();

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

  const networkList = useMemo(() => Object.values(networkRegistry), []);

  useEffect(() => {
    const network = networkList.find((net) => net.chainId === chainId);
    setSelectedNetwork(network);
  }, [chainId]);

  const erc20List = useMemo(
    () => (chainId ? getERC20Registry(chainId) : []),
    [chainId]
  );

  useEffect(() => {
    const run = async () => {
      if (dataLoaded) {
        const ethAddress = await hinkal.getEthereumAddress();

        const bals = await hinkal.getBalances(
          hinkal.getCurrentChainId(),
          hinkal.userKeys.getShieldedPrivateKey(),
          hinkal.userKeys.getShieldedPublicKey(),
          ethAddress,
          false,
          true
        );
        const balancesArray = Array.from(bals.values());
        console.log({ balancesArray });
        setBalances(balancesArray);
      }
    };
    run();
  }, [dataLoaded]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
